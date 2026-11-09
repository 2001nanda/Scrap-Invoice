import { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import {
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  Calendar,
  User,
  FileText,
  Sparkles,
  DollarSign,
  Package,
  Layers,
  ChevronDown,
  CreditCard,
  CheckCircle2,
  Download,
  Share2
} from 'lucide-react';
import { formatINR, formatNumberOnly } from '../utils/storage';
import ScrapItemDropdown from './ScrapItemDropdown';
import AddScrapItemModal from './AddScrapItemModal';

export default function BillingTerminal({
  shopProfile,
  bill,
  onUpdateBill,
  items = [],
  onGenerateBill,
  onPrintInvoice,
  onClearRows,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onNewBill,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const activeItems = useMemo(() => items.filter(it => it.active !== false), [items]);

  // Calculations
  const subTotal = useMemo(() => {
    return (bill.rows || []).reduce((sum, row) => sum + (Number(row.price) || 0) * (Number(row.qty) || 0), 0);
  }, [bill.rows]);

  const totalQuantity = useMemo(() => {
    return (bill.rows || []).reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
  }, [bill.rows]);

  const discount = Number(bill.discount) || 0;
  const grandTotal = Math.max(0, subTotal - discount);
  const totalItemsCount = bill.rows ? bill.rows.length : 0;

  const handleDateChange = (d) => {
    onUpdateBill({ date: d ? d.toISOString() : new Date().toISOString() });
  };

  const handleCustomerChange = (field, val) => {
    onUpdateBill({ [field]: val });
  };

  const billDate = bill.date ? new Date(bill.date) : new Date();

  return (
    <div className="space-y-6">
      {/* 1. Customer & Invoice Meta Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 transition">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              <span>Customer & Invoice Details</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer name is optional (defaults to Unknown on bill).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={onNewBill || onClearRows}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer border border-slate-200"
              title="Clear current bill and start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
              <span>New Bill</span>
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
              {shopProfile?.shopName || 'Shop'}
            </span>
            <span className="text-xs font-bold px-3 py-1 bg-teal-600 text-white rounded-lg shadow-2xs font-mono">
              # {String(bill.invoiceNo || '000125').padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* Simplified Billing Fields: Customer Name (Optional), Date, Payment Mode, Cashier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Name (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bill.customerName || ''}
                onChange={e => handleCustomerChange('customerName', e.target.value)}
                placeholder="Leave empty for 'Unknown'"
                className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Billing Date
            </label>
            <div className="relative">
              <DatePicker
                selected={billDate}
                onChange={handleDateChange}
                dateFormat="dd-MM-yyyy"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition"
                calendarClassName="shadow-xl rounded-xl border border-slate-200"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Mode
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={bill.paymentMode || 'Cash'}
                onChange={e => handleCustomerChange('paymentMode', e.target.value)}
                className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / Online">UPI / Online</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit">Credit / Due</option>
              </select>
            </div>
          </div>

          {/* Cashier / Billed By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Billed By (Cashier)
            </label>
            <input
              type="text"
              value={bill.cashier || shopProfile?.cashierName || 'Nanda'}
              onChange={e => handleCustomerChange('cashier', e.target.value)}
              placeholder="e.g. Nanda"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* 2. Billing Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Table Title Bar */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" />
              <span>Purchased Scrap Materials</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select scrap item, enter measured weight in KG. Rates and amounts calculate automatically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewBill || onClearRows}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
              title="Clear current bill and start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>New Bill</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm shadow-teal-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Scrap Item</span>
            </button>
          </div>
        </div>

        {/* Rows List (Responsive Table on sm+, Cards on mobile) */}
        {bill.rows.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No scrap items in this bill yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Click the "Add Scrap Item" button to open the popup and record weighed materials.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition shadow-sm shadow-teal-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Scrap Item</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table View (hidden on small mobile) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f2744] text-[11px] font-bold text-white uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">S.No</th>
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-4 w-32 text-center">Qty (KG)</th>
                    <th className="py-3 px-4 w-36 text-right">Rate (₹/KG)</th>
                    <th className="py-3 px-4 w-36 text-right bg-[#0d9488]">Amount (₹)</th>
                    <th className="py-3 px-4 w-12 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bill.rows.map((row, index) => {
                    const rowTotal = (Number(row.price) || 0) * (Number(row.qty) || 0);

                    return (
                      <tr key={row.id} className="hover:bg-teal-50/20 transition-colors">
                        <td className="py-3 px-4 text-center text-xs font-semibold text-slate-400 font-mono">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4 min-w-[260px]">
                          <ScrapItemDropdown
                            value={row.item}
                            items={activeItems}
                            onChange={(selectedItem) => {
                              onUpdateRow(row.id, {
                                item: selectedItem.name,
                                price: selectedItem.price !== undefined ? selectedItem.price : row.price,
                              });
                            }}
                            placeholder="Select scrap material..."
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="relative inline-flex items-center w-full max-w-[120px]">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.qty}
                              onChange={(e) => {
                                onUpdateRow(row.id, {
                                  qty: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                                });
                              }}
                              placeholder="0"
                              className="w-full py-2 pl-2 pr-7 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition font-mono"
                            />
                            <span className="absolute right-2 text-xs text-slate-400 font-medium">kg</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="relative inline-flex items-center w-full max-w-[130px]">
                            <span className="absolute left-2.5 text-xs text-slate-400 font-semibold">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.price}
                              onChange={(e) => {
                                onUpdateRow(row.id, {
                                  price: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                                });
                              }}
                              className="w-full py-2 pl-6 pr-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition font-mono"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-extrabold text-teal-800 tracking-tight font-mono">
                            {formatINR(rowTotal)}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onDeleteRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Shown on screens < 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {bill.rows.map((row, index) => {
                const rowTotal = (Number(row.price) || 0) * (Number(row.qty) || 0);

                return (
                  <div key={row.id} className="p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">
                        Item #{index + 1}
                      </span>
                      <button
                        onClick={() => onDeleteRow(row.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Scrap Material
                      </label>
                      <ScrapItemDropdown
                        value={row.item}
                        items={activeItems}
                        onChange={(selectedItem) => {
                          onUpdateRow(row.id, {
                            item: selectedItem.name,
                            price: selectedItem.price !== undefined ? selectedItem.price : row.price,
                          });
                        }}
                        placeholder="Select scrap material..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                          Rate (₹/KG)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={row.price}
                            onChange={(e) => {
                              onUpdateRow(row.id, {
                                price: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                              });
                            }}
                            className="w-full py-2 pl-6 pr-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                          Weight (KG)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={row.qty}
                            onChange={(e) => {
                              onUpdateRow(row.id, {
                                qty: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)),
                              });
                            }}
                            placeholder="0"
                            className="w-full py-2 pl-2 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 text-right font-mono"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">Row Total</span>
                      <span className="text-base font-extrabold text-teal-800 font-mono">
                        {formatINR(rowTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions inside Table Container */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-600 stroke-[2.5]" />
            <span>Add Item Row</span>
          </button>

          <button
            type="button"
            onClick={onNewBill || onClearRows}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Bill / Clear Items</span>
          </button>
        </div>
      </div>

      {/* 3. Summary & Primary Action Card (Teal & Navy inspired) */}
      <div
        className="text-white rounded-3xl shadow-xl p-5 sm:p-7 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #0f2744 0%, #162f4d 60%, #0d9488 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Metrics Column */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                Total Items
              </span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">
                {totalItemsCount}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block">
                Total Net Weight
              </span>
              <span className="text-2xl font-black text-white mt-1 block font-mono">
                {formatNumberOnly(totalQuantity)}
                <span className="text-xs font-normal text-white/70 ml-1">KG</span>
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-teal-500/25 backdrop-blur-md rounded-2xl p-4 border border-teal-400/40">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-200 block">
                Grand Total
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-1 block tracking-tight font-mono">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Save & Generate Bill + Direct Print */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-3 shrink-0">
            {/* Primary Action Button */}
            <button
              onClick={onGenerateBill}
              className="w-full sm:w-auto lg:w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-teal-500/30 transition active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-5 h-5 text-slate-950" />
              <span>Save & Generate Bill</span>
            </button>

            <div className="flex items-center gap-2 w-full justify-center">
              <button
                onClick={onPrintInvoice}
                className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 transition py-1 px-2 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Direct Print (Ctrl+P)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Scrap Item Popup */}
      {isAddModalOpen && (
        <AddScrapItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          items={items}
          onAddItem={(newRow) => {
            onAddRow(newRow);
          }}
        />
      )}
    </div>
  );
}
