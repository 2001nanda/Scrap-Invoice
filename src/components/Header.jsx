import DatePicker from 'react-datepicker';

export default function Header({ shopName, setShopName, date, setDate }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-gray-800">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 uppercase tracking-wide no-print">Shop Name</label>
        <input
          className="text-2xl font-bold text-gray-800 border-b-2 border-dashed border-gray-300 focus:border-blue-500 outline-none bg-transparent w-72 no-print"
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
  );
}
