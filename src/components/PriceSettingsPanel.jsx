import { useState } from 'react';
import { ITEM_NAMES } from '../data/scrapItems';

export default function PriceSettingsPanel({ prices, onPriceChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 no-print">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-amber-100 transition"
      >
        <span>⚙️</span>
        {open ? 'Hide Price Settings' : 'Edit Global Prices'}
      </button>

      {open && (
        <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">
            Global Price Editor — changes apply to all rows instantly
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ITEM_NAMES.map(item => (
              <div key={item} className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-medium">{item}</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <span className="px-2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={prices[item]}
                    onChange={e => onPriceChange(item, Number(e.target.value))}
                    className="w-full py-1.5 pr-2 text-sm text-gray-800 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
