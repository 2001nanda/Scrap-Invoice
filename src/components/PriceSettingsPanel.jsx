import { useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export default function PriceSettingsPanel({ prices, onPriceChange, availableItems = [] }) {
  const [open, setOpen] = useState(false);

  const itemsList = availableItems.length > 0 
    ? availableItems 
    : Object.entries(prices).map(([name, price]) => ({ id: name, name, price }));

  return (
    <div className="mb-6 no-print bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div
        onClick={() => setOpen(o => !o)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Quick Price Settings</h3>
            <p className="text-xs text-slate-500">Live per-KG rates applied to newly added billing rows</p>
          </div>
        </div>

        <div className="text-slate-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {open && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {itemsList.map(item => (
              <div key={item.id || item.name} className="flex flex-col gap-1 p-2.5 bg-white border border-slate-200 rounded-xl">
                <label className="text-xs text-slate-700 font-semibold truncate" title={item.name}>
                  {item.name}
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-indigo-600 transition">
                  <span className="px-2 text-slate-400 font-semibold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={prices[item.name] !== undefined ? prices[item.name] : item.price}
                    onChange={e => onPriceChange(item.name, Math.max(0, Number(e.target.value)))}
                    className="w-full py-1 pr-2 text-xs font-bold text-slate-800 outline-none"
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
