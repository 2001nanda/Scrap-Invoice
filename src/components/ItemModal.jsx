import { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { ITEM_CATEGORIES } from '../utils/storage';

function ItemModalForm({
  mode = 'add',
  item = null,
  existingItems = [],
  onSave,
  onClose,
}) {
  const [name, setName] = useState(() => (mode === 'edit' && item ? item.name || '' : ''));
  const [price, setPrice] = useState(() => (mode === 'edit' && item && item.price !== undefined ? String(item.price) : ''));
  
  const [category, setCategory] = useState(() => {
    if (mode === 'edit' && item && item.category) {
      return ITEM_CATEGORIES.includes(item.category) ? item.category : '__custom__';
    }
    return ITEM_CATEGORIES[0];
  });

  const [isCustomCategory, setIsCustomCategory] = useState(() => {
    return Boolean(mode === 'edit' && item && item.category && !ITEM_CATEGORIES.includes(item.category));
  });

  const [customCategory, setCustomCategory] = useState(() => {
    if (mode === 'edit' && item && item.category && !ITEM_CATEGORIES.includes(item.category)) {
      return item.category;
    }
    return '';
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Item name is required.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid price per KG (0 or higher).');
      return;
    }

    // Check duplicate name
    const isDuplicate = existingItems.some(
      it => it.active !== false &&
            it.name.toLowerCase() === cleanName.toLowerCase() &&
            (!item || it.id !== item.id)
    );

    if (isDuplicate) {
      setError(`An item named "${cleanName}" already exists.`);
      return;
    }

    const finalCategory = isCustomCategory ? (customCategory.trim() || 'Other') : category;

    onSave({
      id: item?.id,
      name: cleanName,
      price: numPrice,
      category: finalCategory,
      unit: 'KG',
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {mode === 'edit' ? 'Edit Scrap Item' : 'Add New Scrap Item'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'edit'
                  ? 'Update item specifications and market price'
                  : 'Add a new item to your shop rate list'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Copper Wire, Heavy Iron, Newspaper"
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Price Per KG */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Price per KG (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (error) setError('');
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Default rate applied when this item is selected in billing.</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            {!isCustomCategory ? (
              <div className="space-y-2">
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCategory(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                >
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Category...</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Preset List
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer"
            >
              {mode === 'edit' ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ItemModal(props) {
  if (!props.isOpen) return null;
  const key = `${props.mode}-${props.item?.id || 'new'}`;
  return <ItemModalForm key={key} {...props} />;
}
