import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, X, AlertCircle, Package } from 'lucide-react';
import { formatINR } from '../utils/storage';
import ScrapItemDropdown from './ScrapItemDropdown';

/**
 * Modern modal for adding a scrap material row to the current bill.
 * Never inserts empty rows; validates material, quantity and rate before submission.
 */
export default function AddScrapItemModal({
  isOpen,
  onClose,
  items = [],
  onAddItem,
}) {
  const activeItems = useMemo(() => items.filter(it => it.active !== false), [items]);
  const defaultMaterial = activeItems[0] || null;

  const [selectedMaterial, setSelectedMaterial] = useState(defaultMaterial ? defaultMaterial.name : '');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState(
    defaultMaterial && defaultMaterial.price !== undefined ? String(defaultMaterial.price) : '0'
  );
  const [error, setError] = useState('');

  const qtyInputRef = useRef(null);

  // Auto-focus quantity input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      qtyInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle material selection from the custom dropdown
  const handleMaterialChange = (item) => {
    if (!item) return;
    setSelectedMaterial(item.name);
    setRate(item.price !== undefined ? String(item.price) : '0');
    setError('');
    // Auto-focus quantity input for fast entry
    setTimeout(() => {
      qtyInputRef.current?.focus();
    }, 50);
  };

  // Instant calculated amount: Quantity × Rate
  const numQty = parseFloat(quantity) || 0;
  const numRate = parseFloat(rate) || 0;
  const calculatedAmount = Math.max(0, numQty * numRate);

  // Form submission handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!selectedMaterial) {
      setError('Please select a scrap material.');
      return;
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Please enter a valid weight in KG greater than 0.');
      qtyInputRef.current?.focus();
      return;
    }

    const parsedRate = parseFloat(rate);
    if (isNaN(parsedRate) || parsedRate < 0) {
      setError('Please enter a valid rate (₹/KG) of 0 or more.');
      return;
    }

    // Create completed billing row
    const newRow = {
      id: crypto.randomUUID ? crypto.randomUUID() : `row_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item: selectedMaterial,
      price: parsedRate,
      qty: parsedQty,
    };

    onAddItem(newRow);
    onClose();
  };

  // Keyboard navigation: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-scrap-item-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-scrap-item-title" className="text-base sm:text-lg font-bold text-slate-900">
                Add Scrap Item
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select material, enter measured KG, and review amount.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Error Message Alert */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Material Dropdown Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Scrap Material <span className="text-rose-500">*</span>
            </label>
            <ScrapItemDropdown
              value={selectedMaterial}
              items={activeItems}
              onChange={handleMaterialChange}
              placeholder="Search or pick scrap material..."
            />
          </div>

          {/* 2. Quantity & Rate in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity (KG) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={qtyInputRef}
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. 5.5"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition font-mono"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  KG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Supports decimals (e.g. 2.5, 10.25)</p>
            </div>

            {/* Rate Input (auto-populated, optionally editable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Rate (₹/KG)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={rate}
                  onChange={(e) => {
                    setRate(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0"
                  className="w-full pl-7 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  /kg
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Override applies to this row only</p>
            </div>
          </div>

          {/* 3. Calculated Amount Highlight Card */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                Calculated Amount
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block font-mono">
                {numQty > 0 ? `${numQty} KG × ₹${numRate}/kg` : 'Enter weight in KG'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-teal-900 tracking-tight font-mono">
                {formatINR(calculatedAmount)}
              </span>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
