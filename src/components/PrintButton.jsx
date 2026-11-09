import { Printer } from 'lucide-react';

export default function PrintButton({ onClick }) {
  return (
    <button
      onClick={onClick || (() => window.print())}
      className="no-print flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-sm shadow-emerald-600/30 cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      <span>Print Invoice / Save PDF</span>
    </button>
  );
}
