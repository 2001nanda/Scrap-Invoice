import { ITEM_NAMES } from '../data/scrapItems';

const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function RowComponent({ row, index, prices, onUpdate, onDelete, date }) {
  const handleItemChange = (item) => {
    onUpdate(row.id, { item, price: prices[item] ?? 0 });
  };

  const handleQtyChange = (qty) => {
    onUpdate(row.id, { qty: qty === '' ? '' : Number(qty) });
  };

  const rowTotal = (row.price || 0) * (row.qty || 0);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
      <td className="px-3 py-2 text-center text-gray-500 text-sm">{index + 1}</td>

      <td className="px-3 py-2 text-sm text-gray-700">
        <span className="no-print hidden sm:hidden">
          {date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
        <span className="print-date">
          {date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      </td>

      <td className="px-3 py-2">
        <select
          value={row.item}
          onChange={e => handleItemChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-full no-print"
        >
          {ITEM_NAMES.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <span className="hidden print:inline text-sm">{row.item}</span>
      </td>

      <td className="px-3 py-2 text-sm text-gray-700 text-right">
        {fmt(row.price)}
      </td>

      <td className="px-3 py-2">
        <input
          type="number"
          min="0"
          step="0.1"
          value={row.qty}
          onChange={e => handleQtyChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 w-24 text-right focus:outline-none focus:ring-2 focus:ring-blue-300 no-print"
          placeholder="0"
        />
        <span className="hidden print:inline text-sm">{row.qty} kg</span>
      </td>

      <td className="px-3 py-2 text-sm font-semibold text-gray-800 text-right">
        {fmt(rowTotal)}
      </td>

      <td className="px-3 py-2 text-center no-print">
        <button
          onClick={() => onDelete(row.id)}
          className="text-red-400 hover:text-red-600 text-lg transition"
          title="Delete row"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
