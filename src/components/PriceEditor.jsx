import { useState } from 'react';
import { 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Save, 
  Plus, 
  Search
} from 'lucide-react';

export default function PriceEditor({
  items = [],
  onUpdatePrices,
  onOpenAddItem,
  isOpenDefault = false,
}) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [draftPrices, setDraftPrices] = useState({});
  const [filterText, setFilterText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const activeItems = items.filter(it => it.active !== false);
  const hasUnsavedChanges = Object.keys(draftPrices).length > 0;

  const handlePriceChange = (id, value) => {
    const num = value === '' ? '' : Math.max(0, Number(value));
    setDraftPrices(prev => ({ ...prev, [id]: num }));
  };

  const handleSaveAll = () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);

    const updates = Object.entries(draftPrices).map(([id, price]) => ({
      id,
      price: Number(price) || 0,
    }));

    onUpdatePrices(updates);
    setDraftPrices({});

    setTimeout(() => {
      setIsSaving(false);
    }, 300);
  };

  const filteredItems = activeItems.filter(it =>
    it.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (it.category && it.category.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-6 overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/75 transition select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">Global Market Price Editor</h3>
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-full animate-pulse">
                  Unsaved changes
                </span>
              )}
              {!hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Synced
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Quickly update per-KG scrap prices across all materials ({activeItems.length} active items)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveAll();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5" />
              Save Rates
            </button>
          )}

          <div className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30 animate-in fade-in duration-200">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Quick filter rates..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAddItem}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={!hasUnsavedChanges || isSaving}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition ${
                  hasUnsavedChanges
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Apply & Save Rates'}
              </button>
            </div>
          </div>

          {/* Rate inputs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {filteredItems.map(item => {
              const currentVal = draftPrices[item.id] !== undefined ? draftPrices[item.id] : item.price;
              const isModified = draftPrices[item.id] !== undefined && draftPrices[item.id] !== item.price;

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isModified
                      ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-semibold text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">/KG</span>
                  </div>

                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 transition">
                    <span className="px-2 text-xs font-semibold text-slate-400 select-none">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={currentVal}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      className="w-full py-1 text-xs font-bold text-slate-800 bg-transparent outline-none pr-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No scrap items match "{filterText}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
