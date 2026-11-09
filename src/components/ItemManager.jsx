import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Layers, 
  AlertCircle,
  Package,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { formatINR } from '../utils/storage';

export default function ItemManager({
  items = [],
  onAddItem,
  onEditItem,
  onDeleteItem,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'price-asc' | 'price-desc'

  const activeItems = useMemo(() => {
    return items.filter(it => it.active !== false);
  }, [items]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    activeItems.forEach(it => {
      if (it.category) set.add(it.category);
    });
    return ['All', ...Array.from(set)];
  }, [activeItems]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return activeItems
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [activeItems, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 mb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Scrap Items Catalog</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your scrap materials, dynamic market rates, and custom categories.
          </p>
        </div>

        <button
          onClick={onAddItem}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-indigo-600/30 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items by name or category..."
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="sm:col-span-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            >
              <option value="name">Sort: Name (A to Z)</option>
              <option value="price-desc">Sort: Rate (Highest First)</option>
              <option value="price-asc">Sort: Rate (Lowest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Count and Quick Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{filteredItems.length}</span> of {activeItems.length} items
        </div>
      </div>

      {/* Items Grid */}
      <div className="mt-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No items match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search terms or filters.'
                : 'Your catalog is empty. Click "+ Add New Item" to configure items.'}
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative bg-white hover:bg-slate-50/60 rounded-xl border border-slate-200/90 hover:border-indigo-200 p-4 transition-all duration-150 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/50">
                      {item.category || 'General'}
                    </span>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditItem(item)}
                        title="Edit Item"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item)}
                        title="Delete Item"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-slate-800 leading-snug group-hover:text-indigo-950">
                    {item.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-400">Current Rate</span>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-600 tracking-tight">
                      {formatINR(item.price)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ KG</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
