import { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Image as ImageIcon, 
  FileText, 
  Eye, 
  Download, 
  Calendar, 
  User, 
  Clock, 
  Package, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatINR, formatNumberOnly } from '../utils/storage';

export default function InvoiceHistory({
  invoices = [],
  onSelectInvoice,
  onDownloadImage,
  onDownloadPDF,
  onGoToBilling,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // `${invoiceId}-image` | `${invoiceId}-pdf`

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = 
        String(inv.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customer?.name && inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.customer?.mobile && inv.customer.mobile.includes(searchTerm));
      return matchSearch;
    });
  }, [invoices, searchTerm]);

  const handleDownload = async (inv, format) => {
    const actionKey = `${inv.id}-${format}`;
    try {
      setLoadingAction(actionKey);
      const filename = `ScrapBill_${String(inv.invoiceNo).padStart(6, '0')}`;
      if (format === 'image') {
        await onDownloadImage(inv, filename);
      } else {
        await onDownloadPDF(inv, filename);
      }
    } catch (err) {
      console.error('History download failed:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 mb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Invoice History & Downloads</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access, view, and re-download past generated bills in PNG image or PDF formats anytime.
          </p>
        </div>

        <button
          onClick={onGoToBilling}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-teal-600/30 cursor-pointer"
        >
          <span>Create New Bill</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-5 relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by invoice #, customer name, mobile..."
          className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Invoices List */}
      <div className="mt-5">
        {invoices.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No invoices generated yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              When you click "Save & Generate Bill" in the billing terminal, your invoices will be permanently recorded here.
            </p>
            <button
              onClick={onGoToBilling}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <span>Go to Billing Terminal</span>
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No invoices match "{searchTerm}".
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
            {filteredInvoices.map(inv => {
              const invoiceNum = String(inv.invoiceNo).padStart(6, '0');
              const isImageLoading = loadingAction === `${inv.id}-image`;
              const isPdfLoading = loadingAction === `${inv.id}-pdf`;

              return (
                <div 
                  key={inv.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: Invoice & Customer Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-800 text-sm bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                        # {invoiceNum}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {inv.date} at {inv.time}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800">
                      <span>{inv.customer?.name || 'Walk-in Customer'}</span>
                      {inv.customer?.mobile && (
                        <span className="text-slate-400 font-normal">
                          (📱 {inv.customer.mobile})
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-normal">
                        {inv.rows?.length || 0} items ({formatNumberOnly(inv.totalWeight)} KG)
                      </span>
                    </div>
                  </div>

                  {/* Center: Grand Total Amount */}
                  <div className="text-left md:text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Grand Total
                    </div>
                    <div className="text-base font-extrabold text-teal-700 font-mono">
                      {formatINR(inv.grandTotal)}
                    </div>
                  </div>

                  {/* Right: Format Actions */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    {/* Preview Button */}
                    <button
                      onClick={() => onSelectInvoice(inv)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer text-xs font-semibold flex items-center gap-1"
                      title="Preview Ticket"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    {/* Download Image Button */}
                    <button
                      onClick={() => handleDownload(inv, 'image')}
                      disabled={isImageLoading}
                      className="px-3 py-2 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5"
                      title="Download as PNG Image"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{isImageLoading ? 'Saving...' : 'PNG'}</span>
                    </button>

                    {/* Download PDF Button */}
                    <button
                      onClick={() => handleDownload(inv, 'pdf')}
                      disabled={isPdfLoading}
                      className="px-3 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      title="Download as A4 PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isPdfLoading ? 'Saving...' : 'PDF'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
