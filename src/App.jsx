import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import BillingTerminal from './components/BillingTerminal';
import ItemManager from './components/ItemManager';
import PriceEditor from './components/PriceEditor';
import PrintableInvoice from './components/PrintableInvoice';
import ItemModal from './components/ItemModal';
import ShopSettingsModal from './components/ShopSettingsModal';
import ConfirmModal from './components/ConfirmModal';
import InvoicePreviewModal from './components/InvoicePreviewModal';
import BillExportModal from './components/BillExportModal';
import InvoiceHistory from './components/InvoiceHistory';
import Toast from './components/Toast';
import {
  loadApplicationData,
  saveToStorage,
  generateInvoiceNumber,
  getFormattedTime
} from './utils/storage';
import {
  downloadInvoiceAsImage,
  downloadInvoiceAsPDF
} from './utils/invoiceExporter';

export default function App() {
  // Load data with versioned fallback and migration
  const [initialData] = useState(() => loadApplicationData());

  const [items, setItems] = useState(initialData.items);
  const [shopProfile, setShopProfile] = useState(initialData.shopProfile);
  const [bill, setBill] = useState(initialData.bill);
  const [invoiceHistory, setInvoiceHistory] = useState(initialData.invoiceHistory || []);

  // Active view tab: 'billing' | 'history' | 'items' | 'prices'
  const [activeTab, setActiveTab] = useState('billing');

  // Currently focused invoice for export or preview
  const [exportModalInvoice, setExportModalInvoice] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Separate preview modal
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Offscreen capture invoice state (for html2canvas/jspdf)
  const [captureInvoice, setCaptureInvoice] = useState(null);

  // Other Modals state
  const [itemModal, setItemModal] = useState({
    isOpen: false,
    mode: 'add',
    item: null,
  });

  const [isShopSettingsOpen, setIsShopSettingsOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: () => { },
  });

  // Toasts state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    saveToStorage({
      version: 2,
      items,
      shopProfile,
      invoiceHistory,
      bill,
    });
  }, [items, shopProfile, invoiceHistory, bill]);

  // Active items (excluding soft-deleted)
  const activeItems = useMemo(() => {
    return items.filter(it => it.active !== false);
  }, [items]);

  // ----------------------------------------------------
  // BILLING OPERATIONS
  // ----------------------------------------------------
  const handleUpdateBill = useCallback((changes) => {
    setBill(prev => ({ ...prev, ...changes }));
  }, []);

  const handleAddRow = useCallback((completedRow) => {
    if (!completedRow || !completedRow.item) return;

    setBill(prev => ({
      ...prev,
      rows: [...(prev.rows || []), completedRow],
    }));
    addToast('Item Added', `${completedRow.item} (${completedRow.qty} KG) added to bill.`, 'success');
  }, [addToast]);

  const handleUpdateRow = useCallback((rowId, changes) => {
    setBill(prev => ({
      ...prev,
      rows: (prev.rows || []).map(row =>
        row.id === rowId ? { ...row, ...changes } : row
      ),
    }));
  }, []);

  const handleDeleteRow = useCallback((rowId) => {
    setBill(prev => ({
      ...prev,
      rows: (prev.rows || []).filter(row => row.id !== rowId),
    }));
  }, []);

  const handleRequestNewBill = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      title: 'Start New Bill?',
      message: 'This will clear all items and customer details from the current bill. Your saved materials, prices and previous invoices will remain safe.',
      confirmText: 'Clear & Start New Bill',
      cancelText: 'Cancel',
      confirmVariant: 'teal',
      onConfirm: () => {
        const nextNum = generateInvoiceNumber(invoiceHistory);
        setBill(prev => ({
          ...prev,
          customerName: '',
          customerMobile: '',
          customerAddress: '',
          customerPin: '',
          notes: 'Thank you for recycling with us!',
          discount: 0,
          rows: [],
          invoiceNo: nextNum,
          date: new Date().toISOString(),
          time: getFormattedTime(),
        }));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        addToast('New Bill Ready', 'Current ticket cleared and ready for next customer.', 'info');
      },
    });
  }, [invoiceHistory, addToast]);

  // ----------------------------------------------------
  // SAVE & GENERATE BILL WORKFLOW
  // ----------------------------------------------------
  const handleGenerateBill = useCallback(() => {
    if (!bill.rows || bill.rows.length === 0) {
      addToast('Empty Bill', 'Please add at least one scrap material to the bill.', 'warning');
      return;
    }

    const subTotal = (bill.rows || []).reduce(
      (sum, row) => sum + (Number(row.price) || 0) * (Number(row.qty) || 0),
      0
    );
    const totalWeight = (bill.rows || []).reduce(
      (sum, row) => sum + (Number(row.qty) || 0),
      0
    );
    const discount = Number(bill.discount) || 0;
    const grandTotal = Math.max(0, subTotal - discount);

    const invNum = bill.invoiceNo || generateInvoiceNumber(invoiceHistory);
    const invoiceDate = bill.date ? new Date(bill.date) : new Date();

    const formattedDate = invoiceDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');

    const formattedTime = bill.time || getFormattedTime(invoiceDate);

    // Create immutable invoice record snapshot
    const invoiceRecord = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNo: invNum,
      date: formattedDate,
      time: formattedTime,
      timestamp: new Date().toISOString(),
      customer: {
        name: bill.customerName?.trim() || '',
        mobile: bill.customerMobile || '',
        address: bill.customerAddress || '',
        pin: bill.customerPin || '',
        notes: bill.notes || 'Thank you for recycling with us!',
      },
      paymentMode: bill.paymentMode || 'Cash',
      cashier: bill.cashier || shopProfile.cashierName || 'Nanda',
      rows: bill.rows.map(r => ({ ...r })), // Deep copy rows snapshot
      subTotal,
      discount,
      grandTotal,
      totalWeight,
      shopProfile: { ...shopProfile },
    };

    // Save to history (prevent duplicate by invoiceNo if re-generating same bill)
    setInvoiceHistory(prev => {
      const filtered = prev.filter(inv => inv.invoiceNo !== invNum);
      return [invoiceRecord, ...filtered];
    });

    const exportPayload = {
      shopProfile,
      bill: {
        ...bill,
        invoiceNo: invNum,
        time: formattedTime,
      },
    };

    setExportModalInvoice(exportPayload);
    setCaptureInvoice(exportPayload);
    setIsExportModalOpen(true);

    addToast('Bill Generated', `Invoice #${invNum} saved successfully.`, 'success');
  }, [bill, invoiceHistory, shopProfile, addToast]);

  const handleStartNewBill = useCallback(() => {
    setIsExportModalOpen(false);
    const nextNum = generateInvoiceNumber(invoiceHistory);
    setBill({
      customerName: '',
      customerMobile: '',
      customerAddress: '',
      customerPin: '',
      notes: 'Thank you for recycling with us!',
      paymentMode: 'Cash',
      cashier: shopProfile.cashierName || 'Nanda',
      invoiceNo: nextNum,
      date: new Date().toISOString(),
      time: getFormattedTime(),
      discount: 0,
      rows: [],
    });
    setActiveTab('billing');
    addToast('New Invoice Ready', `Starting ticket #${nextNum}.`, 'info');
  }, [invoiceHistory, shopProfile, addToast]);

  // ----------------------------------------------------
  // DOWNLOAD EXPORTERS (PNG Image & PDF Document)
  // ----------------------------------------------------
  const handleDownloadImage = useCallback(async (customFilename) => {
    try {
      const filename = customFilename || `ScrapBill_${exportModalInvoice?.bill?.invoiceNo || '000125'}`;
      await downloadInvoiceAsImage('invoice-capture-container', filename);
      addToast('Image Downloaded', `Saved as ${filename}.png`, 'success');
    } catch (err) {
      console.error('Image export failed:', err);
      addToast('Export Error', 'Failed to generate image. Please try again.', 'error');
    }
  }, [exportModalInvoice, addToast]);

  const handleDownloadPDF = useCallback(async (customFilename) => {
    try {
      const filename = customFilename || `ScrapBill_${exportModalInvoice?.bill?.invoiceNo || '000125'}`;
      await downloadInvoiceAsPDF('invoice-capture-container', filename);
      addToast('PDF Downloaded', `Saved as ${filename}.pdf`, 'success');
    } catch (err) {
      console.error('PDF export failed:', err);
      addToast('Export Error', 'Failed to generate PDF. Please try again.', 'error');
    }
  }, [exportModalInvoice, addToast]);

  // Download directly from Invoice History item
  const handleHistoryDownloadImage = useCallback(async (inv, filename) => {
    const payload = {
      shopProfile: inv.shopProfile || shopProfile,
      bill: {
        customerName: inv.customer?.name,
        customerMobile: inv.customer?.mobile,
        customerAddress: inv.customer?.address,
        customerPin: inv.customer?.pin,
        notes: inv.customer?.notes,
        paymentMode: inv.paymentMode,
        cashier: inv.cashier,
        invoiceNo: inv.invoiceNo,
        date: inv.timestamp || new Date().toISOString(),
        time: inv.time,
        discount: inv.discount || 0,
        rows: inv.rows || [],
      },
    };
    setCaptureInvoice(payload);
    // Allow offscreen DOM to update
    await new Promise(r => setTimeout(r, 60));
    await downloadInvoiceAsImage('invoice-capture-container', filename);
    addToast('Image Downloaded', `${filename}.png saved.`, 'success');
  }, [shopProfile, addToast]);

  const handleHistoryDownloadPDF = useCallback(async (inv, filename) => {
    const payload = {
      shopProfile: inv.shopProfile || shopProfile,
      bill: {
        customerName: inv.customer?.name,
        customerMobile: inv.customer?.mobile,
        customerAddress: inv.customer?.address,
        customerPin: inv.customer?.pin,
        notes: inv.customer?.notes,
        paymentMode: inv.paymentMode,
        cashier: inv.cashier,
        invoiceNo: inv.invoiceNo,
        date: inv.timestamp || new Date().toISOString(),
        time: inv.time,
        discount: inv.discount || 0,
        rows: inv.rows || [],
      },
    };
    setCaptureInvoice(payload);
    await new Promise(r => setTimeout(r, 60));
    await downloadInvoiceAsPDF('invoice-capture-container', filename);
    addToast('PDF Downloaded', `${filename}.pdf saved.`, 'success');
  }, [shopProfile, addToast]);

  const handleSelectHistoryInvoice = useCallback((inv) => {
    const payload = {
      shopProfile: inv.shopProfile || shopProfile,
      bill: {
        customerName: inv.customer?.name,
        customerMobile: inv.customer?.mobile,
        customerAddress: inv.customer?.address,
        customerPin: inv.customer?.pin,
        notes: inv.customer?.notes,
        paymentMode: inv.paymentMode,
        cashier: inv.cashier,
        invoiceNo: inv.invoiceNo,
        date: inv.timestamp || new Date().toISOString(),
        time: inv.time,
        discount: inv.discount || 0,
        rows: inv.rows || [],
      },
    };
    setPreviewInvoice(payload);
    setCaptureInvoice(payload);
    setIsPreviewOpen(true);
  }, [shopProfile]);

  // ----------------------------------------------------
  // ITEM MANAGEMENT OPERATIONS
  // ----------------------------------------------------
  const handleOpenAddItem = useCallback(() => {
    setItemModal({
      isOpen: true,
      mode: 'add',
      item: null,
    });
  }, []);

  const handleOpenEditItem = useCallback((item) => {
    setItemModal({
      isOpen: true,
      mode: 'edit',
      item,
    });
  }, []);

  const handleSaveItem = useCallback((itemData) => {
    if (itemModal.mode === 'add') {
      const newItem = {
        ...itemData,
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      setItems(prev => [newItem, ...prev]);
      addToast('Material Created', `"${newItem.name}" added to catalog.`, 'success');
    } else {
      setItems(prev => prev.map(it => it.id === itemData.id ? { ...it, ...itemData } : it));
      addToast('Material Updated', `"${itemData.name}" details updated.`, 'success');
    }

    setItemModal({ isOpen: false, mode: 'add', item: null });
  }, [itemModal.mode, addToast]);

  const handleDeleteItem = useCallback((item) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete "${item.name}"?`,
      message: `Are you sure you want to delete "${item.name}"? It will no longer appear in future billing dropdowns. Existing invoice records will retain this item's details.`,
      confirmText: 'Delete Material',
      confirmVariant: 'danger',
      onConfirm: () => {
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, active: false } : it));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        addToast('Material Removed', `"${item.name}" removed from catalog.`, 'info');
      },
    });
  }, [addToast]);

  // ----------------------------------------------------
  // PRICE MANAGEMENT OPERATIONS
  // ----------------------------------------------------
  const handleBulkPriceUpdate = useCallback((priceUpdates) => {
    const updateMap = new Map();
    priceUpdates.forEach(u => updateMap.set(u.id, u.price));

    setItems(prev => prev.map(it => {
      if (updateMap.has(it.id)) {
        return { ...it, price: updateMap.get(it.id) };
      }
      return it;
    }));

    addToast('Rates Updated', 'Global scrap market rates saved successfully.', 'success');
  }, [addToast]);

  // ----------------------------------------------------
  // SHOP PROFILE OPERATIONS
  // ----------------------------------------------------
  const handleSaveShopProfile = useCallback((newProfile) => {
    setShopProfile(newProfile);
    setIsShopSettingsOpen(false);
    addToast('Profile Saved', 'Shop details and invoice header updated.', 'success');
  }, [addToast]);

  // Current capture bill representation
  const activeCaptureData = captureInvoice || { shopProfile, bill };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Modern POS Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopProfile={shopProfile}
        onOpenShopSettings={() => setIsShopSettingsOpen(true)}
        onOpenAddItem={handleOpenAddItem}
        itemsCount={activeItems.length}
        activeRowCount={(bill.rows || []).length}
        historyCount={invoiceHistory.length}
      />

      {/* 2. Main Application Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 no-print">
        {/* Tab 1: Billing Terminal */}
        {activeTab === 'billing' && (
          <div className="animate-in fade-in duration-200">
            {/* Quick action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Point of Sale Terminal
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Record scrap materials, verify scale weights, and generate professional customer bills.
                </p>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewInvoice({ shopProfile, bill });
                    setCaptureInvoice({ shopProfile, bill });
                    setIsPreviewOpen(true);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Preview Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateBill}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-teal-600/30 cursor-pointer"
                >
                  <span>Save & Generate Bill</span>
                </button>
              </div>
            </div>

            {/* Core Billing Terminal */}
            <BillingTerminal
              shopProfile={shopProfile}
              bill={bill}
              onUpdateBill={handleUpdateBill}
              items={items}
              onGenerateBill={handleGenerateBill}
              onPrintInvoice={() => window.print()}
              onClearRows={handleRequestNewBill}
              onNewBill={handleRequestNewBill}
              onAddRow={handleAddRow}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
            />
          </div>
        )}

        {/* Tab 2: Invoice History */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <InvoiceHistory
              invoices={invoiceHistory}
              onSelectInvoice={handleSelectHistoryInvoice}
              onDownloadImage={handleHistoryDownloadImage}
              onDownloadPDF={handleHistoryDownloadPDF}
              onGoToBilling={() => setActiveTab('billing')}
            />
          </div>
        )}

        {/* Tab 3: Material Catalog */}
        {activeTab === 'items' && (
          <div className="animate-in fade-in duration-200">
            <ItemManager
              items={items}
              onAddItem={handleOpenAddItem}
              onEditItem={handleOpenEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        )}

        {/* Tab 4: Rate List Management */}
        {activeTab === 'prices' && (
          <div className="animate-in fade-in duration-200">
            <PriceEditor
              items={items}
              onUpdatePrices={handleBulkPriceUpdate}
              onOpenAddItem={handleOpenAddItem}
              isOpenDefault={true}
            />
          </div>
        )}
      </main>

      {/* 3. Screen Footer */}
      <footer className="mt-auto py-4 border-t border-slate-200/60 bg-white text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{shopProfile?.shopName || 'NEXTGEN SCRAP TRADERS'} — Commercial Scrap Billing System</span>
          <span className="text-[11px] text-slate-400">
            PNG Image & PDF Export • Offline Persistent Storage
          </span>
        </div>
      </footer>

      {/* 4. Direct Print Layout (Window.print) */}
      <PrintableInvoice
        shopProfile={activeCaptureData.shopProfile}
        bill={activeCaptureData.bill}
      />

      {/* 5. Hidden Offscreen Container for HTML2Canvas & jsPDF high-res export */}
      <div
        id="invoice-capture-container"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '820px',
          backgroundColor: '#FFFFFF',
          color: '#263445',
          zIndex: -100,
          overflow: 'visible',
          height: 'auto',
        }}
      >
        <PrintableInvoice
          shopProfile={activeCaptureData.shopProfile}
          bill={activeCaptureData.bill}
          isPreview={true}
        />
      </div>

      {/* 6. Modals */}
      {/* Generate Your Bill Export Modal (PNG Image / PDF Document) */}
      <BillExportModal
        isOpen={isExportModalOpen}
        invoiceData={exportModalInvoice}
        onDownloadImage={handleDownloadImage}
        onDownloadPDF={handleDownloadPDF}
        onPrint={() => window.print()}
        onClose={() => setIsExportModalOpen(false)}
        onStartNewBill={handleStartNewBill}
      />

      {/* Preview Invoice Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        shopProfile={previewInvoice?.shopProfile || shopProfile}
        bill={previewInvoice?.bill || bill}
        onClose={() => setIsPreviewOpen(false)}
        onPrint={() => {
          setIsPreviewOpen(false);
          setTimeout(() => window.print(), 100);
        }}
        onDownloadImage={handleDownloadImage}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Item Modal (Add/Edit) */}
      <ItemModal
        isOpen={itemModal.isOpen}
        mode={itemModal.mode}
        item={itemModal.item}
        existingItems={items}
        onSave={handleSaveItem}
        onClose={() => setItemModal({ isOpen: false, mode: 'add', item: null })}
      />

      {/* Shop Settings Drawer */}
      <ShopSettingsModal
        isOpen={isShopSettingsOpen}
        profile={shopProfile}
        onSave={handleSaveShopProfile}
        onClose={() => setIsShopSettingsOpen(false)}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
