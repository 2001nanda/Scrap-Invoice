import { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Loader2,
  Share2
} from 'lucide-react';
import PrintableInvoice from './PrintableInvoice';

export default function BillExportModal({
  isOpen,
  invoiceData,
  onDownloadImage,
  onDownloadPDF,
  onPrint,
  onClose,
  onStartNewBill,
}) {
  const [downloadingFormat, setDownloadingFormat] = useState(null); // 'image' | 'pdf' | null
  const [showLivePreview, setShowLivePreview] = useState(false);

  if (!isOpen || !invoiceData) return null;

  const invoiceNum = invoiceData?.bill?.invoiceNo 
    ? String(invoiceData.bill.invoiceNo).padStart(6, '0') 
    : '000125';

  const filename = `ScrapBill_${invoiceNum}`;

  const handleDownload = async (format) => {
    try {
      setDownloadingFormat(format);
      if (format === 'image') {
        await onDownloadImage(filename);
      } else if (format === 'pdf') {
        await onDownloadPDF(filename);
      }
    } catch (err) {
      console.error(`Failed to export invoice as ${format}:`, err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200 no-print">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-teal-50/20 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Generate Your Bill
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  # {invoiceNum}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Invoice snapshot recorded. Choose your preferred export format below:
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Format Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* OPTION 1: Download as Image */}
            <div 
              onClick={() => !downloadingFormat && handleDownload('image')}
              className="group relative bg-white hover:bg-teal-50/30 rounded-2xl border-2 border-slate-200 hover:border-teal-500 p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-100 text-teal-800 rounded-lg">
                    PNG Image
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-teal-900">
                  Download as Image
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  High-resolution PNG file with crystal-sharp typography. Perfect for sharing via WhatsApp or mobile devices.
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-400 truncate">
                  File: <span className="text-slate-700 font-semibold">{filename}.png</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={downloadingFormat !== null}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-teal-600/30 cursor-pointer"
                >
                  {downloadingFormat === 'image' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Image...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* OPTION 2: Download as PDF */}
            <div 
              onClick={() => !downloadingFormat && handleDownload('pdf')}
              className="group relative bg-white hover:bg-indigo-50/30 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-lg">
                    A4 PDF
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-900">
                  Download as PDF
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Clean A4 portrait document formatted for commercial printing, customer receipts, and book-keeping.
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-400 truncate">
                  File: <span className="text-slate-700 font-semibold">{filename}.pdf</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={downloadingFormat !== null}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer"
                >
                  {downloadingFormat === 'pdf' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Quick Action Tray: Preview Toggle & Direct Print */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>{showLivePreview ? 'Hide Invoice Preview' : 'Preview Invoice'}</span>
              </button>

              <button
                type="button"
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Direct Print</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onStartNewBill}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 transition flex items-center gap-1 cursor-pointer"
            >
              <span>+ Create Next Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Preview Dropdown (If expanded) */}
          {showLivePreview && (
            <div className="mt-4 p-4 bg-slate-100 rounded-2xl border border-slate-200 animate-in fade-in duration-200 max-h-[60vh] overflow-y-auto flex justify-center">
              <div className="w-full max-w-[760px] bg-white rounded-xl shadow-md border border-slate-200">
                <PrintableInvoice 
                  shopProfile={invoiceData.shopProfile} 
                  bill={invoiceData.bill} 
                  isPreview={true} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Both formats can be downloaded again anytime from Invoice History.</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
