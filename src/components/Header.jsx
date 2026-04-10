import DatePicker from 'react-datepicker';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

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
  const [showQrInput, setShowQrInput] = useState(false);

  return (
    <div className="mb-6 pb-4 border-b-2 border-gray-800">
      {/* Top row: Shop name and Date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-gray-500 uppercase tracking-wide no-print">Shop Name</label>
          <input
            className="text-2xl font-bold text-gray-800 border-b-2 border-dashed border-gray-300 focus:border-blue-500 outline-none bg-transparent no-print"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            placeholder="Enter Shop Name"
          />
          <span className="print-only text-2xl font-bold text-gray-800 hidden">{shopName}</span>
        </div>

        <div className="flex flex-col gap-1 no-print">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Date</label>
          <DatePicker
            selected={date}
            onChange={d => setDate(d)}
            dateFormat="dd MMM yyyy"
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            calendarClassName="shadow-xl"
          />
        </div>

        <div className="hidden print:block text-right">
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold text-gray-800">
            {date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
          </p>
        </div>
      </div>

      {/* Second row: Mobile and Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 no-print">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Mobile Number</label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={mobileNumber}
            onChange={e => setMobileNumber(e.target.value)}
            placeholder="Enter mobile number"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Address</label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter shop address"
          />
        </div>
      </div>

      {/* QR Code section */}
      <div className="flex flex-col gap-2 no-print">
        <button
          onClick={() => setShowQrInput(!showQrInput)}
          className="text-xs bg-purple-50 border border-purple-300 text-purple-700 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100 transition w-fit"
        >
          {showQrInput ? '✕ Hide QR' : '+ Add QR Code'}
        </button>

        {showQrInput && (
          <div className="flex flex-col gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <label className="text-xs text-purple-700 font-medium">QR Code URL (Shop Location)</label>
            <input
              className="border border-purple-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={qrCode}
              onChange={e => setQrCode(e.target.value)}
              placeholder="e.g., https://maps.google.com/?q=K+NarayanaPura+Circle"
            />
            <p className="text-xs text-purple-600">Paste Google Maps link or any location URL</p>
          </div>
        )}
      </div>

      {/* Print-only header info */}
      <div className="hidden print:block mt-4 pt-4 border-t border-gray-300">
        <div className="flex justify-between items-start gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{shopName}</h1>
            <p className="text-sm text-gray-600 mt-2">{address}</p>
            <p className="text-sm text-gray-600">📱 {mobileNumber}</p>
          </div>
          {qrCode && (
            <div className="flex flex-col items-center gap-1">
              <QRCodeSVG value={qrCode} size={100} level="H" includeMargin={true} />
              <p className="text-xs text-gray-500">Location</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
