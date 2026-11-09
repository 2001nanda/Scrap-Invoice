import { useState } from 'react';
import { X, Store, Phone, MapPin, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function ShopSettingsModalForm({
  profile,
  onSave,
  onClose,
}) {
  const [shopName, setShopName] = useState(() => profile?.shopName || '');
  const [mobileNumber, setMobileNumber] = useState(() => profile?.mobileNumber || '');
  const [address, setAddress] = useState(() => profile?.address || '');
  const [pinCode, setPinCode] = useState(() => profile?.pinCode || '');
  const [qrCode, setQrCode] = useState(() => profile?.qrCode || '');
  const [terms, setTerms] = useState(() => profile?.terms || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...profile,
      shopName: shopName.trim() || 'My Scrap Shop',
      mobileNumber: mobileNumber.trim(),
      address: address.trim(),
      pinCode: pinCode.trim(),
      qrCode: qrCode.trim(),
      terms: terms.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Shop Profile & Settings</h3>
              <p className="text-xs text-slate-500">Business details printed on invoices & receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="e.g. Metro Scrap Traders"
                required
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Contact & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Shop Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                PIN / Postal Code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
                placeholder="e.g. 560077"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Shop address, street, landmark..."
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition resize-none"
              />
            </div>
          </div>

          {/* Location QR Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop Location URL (QR Code)
            </label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={qrCode}
                onChange={e => setQrCode(e.target.value)}
                placeholder="e.g. Google Maps link (https://maps.google.com/?q=...)"
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
            {qrCode ? (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="p-1 bg-white rounded-lg shadow-xs">
                  <QRCodeSVG value={qrCode} size={50} level="M" />
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">QR Code Active:</span> This QR will be printed on the invoice for customers to navigate to your scrap yard.
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Optional. Adds a scannable map link to printed receipts.</p>
            )}
          </div>

          {/* Receipt Custom Terms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Invoice Terms / Note
            </label>
            <textarea
              rows={2}
              value={terms}
              onChange={e => setTerms(e.target.value)}
              placeholder="e.g. Rates are subject to market conditions. Weights verified on scale."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition resize-none"
            />
          </div>

          {/* Save Button */}
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
              Save Shop Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ShopSettingsModal(props) {
  if (!props.isOpen) return null;
  return <ShopSettingsModalForm {...props} />;
}
