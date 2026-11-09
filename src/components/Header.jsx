import DatePicker from 'react-datepicker';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Store, Phone, MapPin, QrCode, Calendar, X } from 'lucide-react';

export default function Header({
  shopName,
  setShopName,
  mobileNumber,
  setMobileNumber,
  address,
  setAddress,
  qrCode,
  setQrCode,
  date,
  setDate,
}) {
  const [showQrInput, setShowQrInput] = useState(Boolean(qrCode));

  return (
    <div className="mb-6 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Top row: Shop name and Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="flex flex-col gap-1.5 flex-1 w-full sm:w-auto">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider no-print">
            Shop Name
          </label>
          <div className="relative">
            <input
              className="text-xl sm:text-2xl font-extrabold text-slate-900 border-b-2 border-slate-200 focus:border-indigo-600 outline-none bg-transparent w-full transition no-print py-1"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              placeholder="Enter Shop Name"
            />
          </div>
          <span className="print-only text-2xl font-bold text-slate-900 hidden">{shopName}</span>
        </div>

        <div className="flex flex-col gap-1.5 no-print w-full sm:w-auto">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Billing Date
          </label>
          <div className="relative">
            <DatePicker
              selected={date}
              onChange={d => setDate(d)}
              dateFormat="dd MMM yyyy"
              className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              calendarClassName="shadow-xl rounded-xl border border-slate-200"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Second row: Mobile and Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 no-print">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Mobile Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Shop Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter shop address"
            />
          </div>
        </div>
      </div>

      {/* QR Code section */}
      <div className="flex flex-col gap-2 no-print">
        <button
          onClick={() => setShowQrInput(!showQrInput)}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold transition w-fit cursor-pointer flex items-center gap-1.5"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{showQrInput ? 'Hide Location QR' : '+ Add Location QR'}</span>
        </button>

        {showQrInput && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Shop Location URL
              </label>
              <input
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                value={qrCode}
                onChange={e => setQrCode(e.target.value)}
                placeholder="e.g. Google Maps URL (https://maps.google.com/?q=...)"
              />
            </div>
            {qrCode && (
              <div className="shrink-0 p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <QRCodeSVG value={qrCode} size={48} level="M" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
