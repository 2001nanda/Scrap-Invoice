import RowComponent from './RowComponent';

const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function ItemTable({ rows, prices, date, onUpdate, onDelete, onAddRow, grandTotal }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-3 py-3 text-center w-12">S.No</th>
              <th className="px-3 py-3 text-left">Item</th>
              <th className="px-3 py-3 text-right">Price/KG</th>
              <th className="px-3 py-3 text-right">Qty (KG)</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3 text-center no-print w-12">Del</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 italic">
                  No items yet. Click "Add Row" to start.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <RowComponent
                  key={row.id}
                  row={row}
                  index={i}
                  prices={prices}
                  date={date}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-300">
              <td colSpan={4} className="px-3 py-3 text-right font-bold text-gray-700 text-base">
                Grand Total
              </td>
              <td className="px-3 py-3 text-right font-bold text-green-700 text-lg">
                {fmt(grandTotal)}
              </td>
              <td className="no-print" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 no-print">
        <button
          onClick={onAddRow}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow"
        >
          <span className="text-lg">+</span> Add Row
        </button>
      </div>
    </div>
  );
}
