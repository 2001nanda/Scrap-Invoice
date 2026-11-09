import { Trash2 } from 'lucide-react';
import { formatINR } from '../utils/storage';
import ScrapItemDropdown from './ScrapItemDropdown';

export default function RowComponent({ row, index, prices = {}, onUpdate, onDelete, availableItems = [] }) {
  const itemsList = availableItems.length > 0
    ? availableItems
    : Object.entries(prices).map(([name, price]) => ({ name, price, category: 'General' }));

  const handleItemChange = (selectedItem) => {
    const itemPrice = selectedItem.price !== undefined ? selectedItem.price : (prices[selectedItem.name] ?? 0);
    onUpdate(row.id, { item: selectedItem.name, price: itemPrice });
  };

  const handleQtyChange = (qty) => {
    onUpdate(row.id, { qty: qty === '' ? '' : Math.max(0, Number(qty)) });
  };

  const rowTotal = (Number(row.price) || 0) * (Number(row.qty) || 0);

  return (
    <tr className="border-b border-slate-100 hover:bg-teal-50/20 transition-colors">
      <td className="px-3.5 py-3 text-center text-slate-400 font-semibold text-xs">{index + 1}</td>

      <td className="px-3.5 py-3 min-w-[240px]">
        <ScrapItemDropdown
          value={row.item}
          items={itemsList}
          onChange={handleItemChange}
          placeholder="Select material..."
        />
        <span className="hidden print:inline text-sm font-bold text-slate-900">{row.item}</span>
      </td>

      <td className="px-3.5 py-3 text-sm text-slate-700 text-right font-medium">
        {formatINR(row.price)}
      </td>

      <td className="px-3.5 py-3 text-right">
        <div className="relative inline-flex items-center w-full max-w-[120px]">
          <input
            type="number"
            min="0"
            step="0.1"
            value={row.qty}
            onChange={e => handleQtyChange(e.target.value)}
            className="border border-slate-200 rounded-xl px-2.5 py-2 text-sm font-bold text-slate-800 w-full text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 no-print"
            placeholder="0"
          />
        </div>
        <span className="hidden print:inline text-sm font-bold">{row.qty} kg</span>
      </td>

      <td className="px-3.5 py-3 text-sm font-extrabold text-slate-900 text-right">
        {formatINR(rowTotal)}
      </td>

      <td className="px-3.5 py-3 text-center no-print">
        <button
          onClick={() => onDelete(row.id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
          title="Delete row"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
