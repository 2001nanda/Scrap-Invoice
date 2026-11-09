import { 
  Receipt, 
  Package, 
  DollarSign, 
  Settings, 
  Plus, 
  Store,
  Sparkles,
  Layers,
  History,
  Recycle
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  shopProfile,
  onOpenShopSettings,
  onOpenAddItem,
  itemsCount = 0,
  activeRowCount = 0,
  historyCount = 0,
}) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand & Shop Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-600/20"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0f2744 100%)',
              }}
            >
              <Recycle className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0f2744] tracking-tight text-base sm:text-lg">
                  {shopProfile?.shopName || 'NEXTGEN SCRAP'}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  POS Live
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Professional Scrap Shop Billing & Inventory
              </span>
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Receipt className="w-4 h-4 text-teal-600" />
              <span>Billing Terminal</span>
              {activeRowCount > 0 && (
                <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full text-[10px]">
                  {activeRowCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-4 h-4 text-teal-600" />
              <span>Invoices</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('items')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'items'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Package className="w-4 h-4 text-teal-600" />
              <span>Materials</span>
              <span className="px-1.5 py-0.2 bg-slate-200/80 text-slate-600 rounded-full text-[10px]">
                {itemsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('prices')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'prices'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>Rate List</span>
            </button>
          </nav>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddItem}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition border border-teal-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>New Material</span>
            </button>

            <button
              onClick={onOpenShopSettings}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition cursor-pointer text-xs font-medium"
              title="Shop Settings"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Scrollable pill row) */}
        <div className="flex md:hidden items-center justify-around gap-1 py-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'billing'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Billing</span>
            {activeRowCount > 0 && (
              <span className="px-1 bg-teal-600 text-white rounded-full text-[10px]">
                {activeRowCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Invoices ({historyCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'items'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('prices')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'prices'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Rates</span>
          </button>
        </div>
      </div>
    </header>
  );
}
