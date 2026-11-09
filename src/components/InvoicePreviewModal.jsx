import { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Eye, 
  Image as ImageIcon, 
  FileText, 
  Loader2 
} from 'lucide-react';
import PrintableInvoice from './PrintableInvoice';

export default function InvoicePreviewModal({
  isOpen,
  shopProfile,
  bill,
  onClose,
  onPrint,
  onDownloadImage,
  onDownloadPDF,
}) {
  const [downloading, setDownloading] = useState(null);

  if (!isOpen || !bill) return null;

  const invoiceNum = bill?.invoiceNo 
    ? String(bill.invoiceNo).padStart(6, '0') 
    : '000125';
  const filename = `ScrapBill_${invoiceNum}`;

  const handleDownload = async (format) => {
    try {
      setDownloading(format);
      if (format === 'image' && onDownloadImage) {
        await onDownloadImage(filename);
      } else if (format === 'pdf' && onDownloadPDF) {
        await onDownloadPDF(filename);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200 no-print">
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Invoice Ticket Preview
            </h3>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md border border-teal-200">
              # {invoiceNum}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDownloadImage && (
              <button
                onClick={() => handleDownload('image')}
                disabled={downloading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {downloading === 'image' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                )}
                <span>PNG Image</span>
              </button>
            )}

            {onDownloadPDF && (
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {downloading === 'pdf' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>PDF Doc</span>
              </button>
            )}

            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice View Area (Paper sheet style) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-200/50">
          <div className="w-full max-w-[820px] bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-300">
            <PrintableInvoice shopProfile={shopProfile} bill={bill} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
