import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ChevronDown,
  Check,
  X,
  FileText,
  Hammer,
  Coins,
  Zap,
  Box,
  Package,
  Layers
} from 'lucide-react';

/**
 * Renders an appropriate scrap category icon.
 */
function CategoryIcon({ itemName = '', category = '', className = 'w-4 h-4' }) {
  const text = `${itemName} ${category}`.toLowerCase();
  if (text.includes('paper') || text.includes('book') || text.includes('cotton') || text.includes('box')) {
    return <FileText className={className} />;
  }
  if (text.includes('iron') || text.includes('steel')) {
    return <Hammer className={className} />;
  }
  if (text.includes('aluminum') || text.includes('brass') || text.includes('copper') || text.includes('metal')) {
    return <Coins className={className} />;
  }
  if (text.includes('wire') || text.includes('cable') || text.includes('motor') || text.includes('rc') || text.includes('oc') || text.includes('electronic')) {
    return <Zap className={className} />;
  }
  if (text.includes('plastic') || text.includes('bottle')) {
    return <Box className={className} />;
  }
  return <Package className={className} />;
}

/**
 * Modern, accessible, searchable Scrap Item Dropdown.
 * Renders via React Portal to prevent clipping from parent overflow containers.
 */
export default function ScrapItemDropdown({
  value,
  items = [],
  onChange,
  placeholder = 'Select scrap material...',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 280, openUpwards: false, maxHeight: 320 });

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Active items list (ensure current value is included even if custom or legacy)
  const fullItems = useMemo(() => {
    if (!value) return items;
    const exists = items.some(it => it.name === value);
    if (!exists) {
      return [{ id: `custom_${value}`, name: value, category: 'Custom / Saved', price: 0 }, ...items];
    }
    return items;
  }, [items, value]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return fullItems.find(it => it.name === value) || null;
  }, [fullItems, value]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fullItems;
    return fullItems.filter(it => {
      const matchName = it.name && it.name.toLowerCase().includes(q);
      const matchCat = it.category && it.category.toLowerCase().includes(q);
      return matchName || matchCat;
    });
  }, [fullItems, search]);

  // Reposition floating menu relative to trigger
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownEstimatedHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < 260 && spaceAbove > spaceBelow;

    const width = Math.max(rect.width, 300);
    let left = rect.left;

    // Boundary constraints
    if (left + width > window.innerWidth - 12) {
      left = window.innerWidth - width - 12;
    }
    if (left < 12) {
      left = 12;
    }

    const maxHeight = openUpwards
      ? Math.max(180, Math.min(spaceAbove - 16, 360))
      : Math.max(180, Math.min(spaceBelow - 16, 360));

    const top = openUpwards
      ? Math.max(12, rect.top - Math.min(maxHeight, dropdownEstimatedHeight) - 6)
      : rect.bottom + 6;

    setCoords({
      top,
      left,
      width,
      openUpwards,
      maxHeight,
    });
  }, []);

  // Open / Close toggling
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setSearch('');
      // Default highlight to currently selected item if present
      const selIdx = fullItems.findIndex(it => it.name === value);
      setHighlightedIndex(selIdx >= 0 ? selIdx : 0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleWindowResizeOrScroll = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    window.addEventListener('resize', handleWindowResizeOrScroll);
    window.addEventListener('scroll', handleWindowResizeOrScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('resize', handleWindowResizeOrScroll);
      window.removeEventListener('scroll', handleWindowResizeOrScroll, true);
    };
  }, [isOpen, updatePosition]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const highlightedEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
    if (highlightedEl) {
      highlightedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Handle item selection
  const handleSelect = (item) => {
    if (!item) return;
    if (onChange) {
      onChange(item);
    }
    setIsOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  };

  // Handle search text change
  const handleSearchChange = (newVal) => {
    setSearch(newVal);
    setHighlightedIndex(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[highlightedIndex]) {
        handleSelect(filteredItems[highlightedIndex]);
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full py-2 px-3 bg-white border rounded-xl text-left transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
          isOpen
            ? 'border-teal-600 ring-2 ring-teal-500/20'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              selectedItem
                ? 'bg-teal-50 text-teal-700 border border-teal-100'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <CategoryIcon
              itemName={selectedItem?.name}
              category={selectedItem?.category}
              className="w-4 h-4"
            />
          </div>

          <div className="min-w-0 flex-1">
            {selectedItem ? (
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="text-sm font-bold text-slate-800 truncate">
                  {selectedItem.name}
                </span>
                <span className="text-[11px] font-medium text-slate-400 truncate hidden xs:inline">
                  • {selectedItem.category || 'General'}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-400">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedItem && selectedItem.price !== undefined && (
            <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md hidden sm:inline-block">
              ₹{selectedItem.price}/kg
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
              isOpen ? 'rotate-180 text-teal-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Portal Dropdown Menu */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 9999,
            }}
            className="bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="listbox"
          >
            {/* Search Input Header */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 backdrop-blur-xs flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search item or category (e.g. Iron, Paper)..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick status bar */}
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-medium text-slate-400 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-teal-600" />
                <span>{filteredItems.length} material{filteredItems.length === 1 ? '' : 's'} available</span>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Use ↑↓ to navigate • ↵ to select</span>
            </div>

            {/* Scrollable Items List */}
            <div
              ref={listRef}
              className="overflow-y-auto divide-y divide-slate-50 p-1.5 flex-1 focus:outline-none"
              tabIndex={-1}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const isSelected = selectedItem?.name === item.name;
                  const isHighlighted = highlightedIndex === index;

                  return (
                    <div
                      key={item.id || item.name}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => handleSelect(item)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all duration-100 flex items-center justify-between gap-3 ${
                        isHighlighted
                          ? 'bg-teal-50/80 text-teal-950'
                          : isSelected
                          ? 'bg-slate-50 text-slate-900'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-xs shadow-teal-600/30'
                              : isHighlighted
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <CategoryIcon
                            itemName={item.name}
                            category={item.category}
                            className="w-4 h-4"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-bold truncate ${
                              isSelected ? 'text-teal-950' : 'text-slate-800'
                            }`}>
                              {item.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-1.5 py-0.2 rounded-full">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400 truncate">
                            {item.category || 'General Scrap'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/50">
                            ₹{item.price || 0}
                            <span className="text-[10px] font-normal text-slate-400">/{item.unit || 'kg'}</span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    No materials found
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    No scrap item matches &ldquo;{search}&rdquo;. Try searching by name or category.
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="mt-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
