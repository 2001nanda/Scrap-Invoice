import RowComponent from './RowComponent';
import { Plus } from 'lucide-react';
import { formatINR } from '../utils/storage';

export default function ItemTable({ 
  rows, 
  prices, 
  date, 
  onUpdate, 
  onDelete, 
  onAddRow, 
  grandTotal,
  availableItems = [] 
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
              <th className="px-3.5 py-3 text-center w-12">#</th>
              <th className="px-3.5 py-3 text-left">Scrap Material</th>
              <th className="px-3.5 py-3 text-right w-32">Price/KG</th>
              <th className="px-3.5 py-3 text-right w-32">Qty (KG)</th>
              <th className="px-3.5 py-3 text-right w-36">Total</th>
              <th className="px-3.5 py-3 text-center no-print w-12">Del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                  No items in this invoice yet. Click "Add Row" to start.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <RowComponent
                  key={row.id}
                  row={row}
                  index={i}
                  prices={prices}
                  availableItems={availableItems}
                  date={date}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td colSpan={4} className="px-4 py-3.5 text-right font-bold text-slate-700 text-sm">
                Grand Total Payable
              </td>
              <td className="px-4 py-3.5 text-right font-black text-emerald-600 text-lg">
                {formatINR(grandTotal)}
              </td>
              <td className="no-print" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100 no-print">
        <button
          onClick={onAddRow}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm shadow-indigo-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Billing Row</span>
        </button>
      </div>
    </div>
  );
}
