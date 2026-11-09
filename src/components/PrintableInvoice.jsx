import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  CreditCard,
  FileText,
  CheckCircle2,
  Scale,
  Tag,
  Truck,
  Recycle,
  Hammer,
  Coins,
  Zap,
  Cpu,
  Box,
  Package
} from 'lucide-react';
import { formatNumberOnly } from '../utils/storage';
import { numberToWordsINR } from '../utils/numberToWords';
import { EXPORT_PALETTE } from '../utils/colorSanitizer';

// Professional Lucide SVG Material Icons for scrap categories (replaces inconsistent emojis)
function MaterialCategoryIcon({ itemName = '', category = '' }) {
  const lower = (itemName + ' ' + category).toLowerCase();
  let IconComponent = Package;

  if (lower.includes('paper') || lower.includes('book') || lower.includes('cotton') || lower.includes('box')) {
    IconComponent = FileText;
  } else if (lower.includes('iron') || lower.includes('steel')) {
    IconComponent = Hammer;
  } else if (lower.includes('aluminum') || lower.includes('brass') || lower.includes('copper') || lower.includes('metal')) {
    IconComponent = Coins;
  } else if (lower.includes('wire') || lower.includes('cable') || lower.includes('electrical')) {
    IconComponent = Zap;
  } else if (lower.includes('motor') || lower.includes('rc') || lower.includes('oc') || lower.includes('waste')) {
    IconComponent = Cpu;
  } else if (lower.includes('plastic') || lower.includes('bottle')) {
    IconComponent = Box;
  }

  return (
    <div
      style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        backgroundColor: EXPORT_PALETTE.paleTeal,
        border: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: EXPORT_PALETTE.teal,
      }}
    >
      <IconComponent style={{ width: '13px', height: '13px', strokeWidth: 2.2 }} />
    </div>
  );
}

export default function PrintableInvoice({ shopProfile, bill, isPreview = false }) {
  const rows = bill?.rows || [];

  const subTotal = rows.reduce(
    (sum, row) => sum + (Number(row.price) || 0) * (Number(row.qty) || 0),
    0
  );

  const totalQuantity = rows.reduce(
    (sum, row) => sum + (Number(row.qty) || 0),
    0
  );

  const discount = Number(bill?.discount) || 0;
  const grandTotal = Math.max(0, subTotal - discount);

  // Formatted date
  const invoiceDate = bill?.date ? new Date(bill.date) : new Date();
  const formattedDate = invoiceDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  const invoiceTime = bill?.time || invoiceDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const invoiceNum = bill?.invoiceNo ? String(bill.invoiceNo).padStart(6, '0') : '000125';
  const cashierName = bill?.cashier || shopProfile?.cashierName || 'Nanda';
  const paymentMode = bill?.paymentMode || 'Cash';

  // Customer details resolution (nullable fallback to 'Unknown' and default thank-you note)
  const customerDisplayName = bill?.customerName && bill.customerName.trim()
    ? bill.customerName.trim()
    : 'Unknown';
  const invoiceNote = bill?.notes && bill.notes.trim()
    ? bill.notes.trim()
    : 'Thank you for recycling with us!';

  return (
    <div
      id={isPreview ? undefined : "printable-invoice"}
      className={`${isPreview ? 'block' : 'hidden print:block'} font-sans mx-auto`}
      style={{
        width: '100%',
        maxWidth: '820px',
        backgroundColor: EXPORT_PALETTE.white,
        color: EXPORT_PALETTE.darkText,
        overflow: 'visible',
      }}
    >
      <div
        style={{
          backgroundColor: EXPORT_PALETTE.white,
          border: `1px solid ${EXPORT_PALETTE.border}`,
          padding: '28px 32px',
          overflow: 'visible',
          height: 'auto',
        }}
      >

        {/* ============================================================== */}
        {/* 1. TOP HEADER SECTION */}
        {/* ============================================================== */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '24px',
            paddingBottom: '20px',
          }}
        >
          {/* Left: Branding & Shop Contact Info */}
          <div style={{ flex: 1, minWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {/* Brand Logo Badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${EXPORT_PALETTE.teal} 0%, #0891B2 50%, ${EXPORT_PALETTE.navy} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.25)',
                  }}
                >
                  <Recycle style={{ width: '36px', height: '36px', strokeWidth: 2.2 }} />
                </div>
                {/* Subtle dot matrix pattern */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-12px',
                    left: '-8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 4px)',
                    gap: '4px',
                    opacity: 0.25,
                  }}
                >
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: EXPORT_PALETTE.teal,
                        display: 'block'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Shop Titles */}
              <div>
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: EXPORT_PALETTE.navy,
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  {shopProfile?.shopName || 'NEXTGEN SCRAP TRADERS'}
                </h1>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: EXPORT_PALETTE.teal,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginTop: '4px',
                  }}
                >
                  {shopProfile?.subtitle || 'SCRAP SHOP BILL • RECYCLING CENTER'}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontStyle: 'italic',
                    color: EXPORT_PALETTE.mutedText,
                    fontWeight: 500,
                    marginTop: '2px',
                  }}
                >
                  {shopProfile?.tagline || 'Smart Recycling, Better Living.'}
                </div>
              </div>
            </div>

            {/* Shop Contact details */}
            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: EXPORT_PALETTE.darkText,
                paddingLeft: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span
                  style={{
                    padding: '3px',
                    borderRadius: '50%',
                    backgroundColor: EXPORT_PALETTE.paleTeal,
                    color: EXPORT_PALETTE.teal,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <MapPin style={{ width: '13px', height: '13px' }} />
                </span>
                <span>
                  {shopProfile?.address || 'Shop No. 12, City Plaza, MG Road, Bangalore - 452001'}
                  {shopProfile?.pinCode ? ` - ${shopProfile.pinCode}` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    padding: '3px',
                    borderRadius: '50%',
                    backgroundColor: EXPORT_PALETTE.paleTeal,
                    color: EXPORT_PALETTE.teal,
                    flexShrink: 0,
                  }}
                >
                  <Phone style={{ width: '13px', height: '13px' }} />
                </span>
                <span style={{ fontWeight: 700, color: EXPORT_PALETTE.navy }}>
                  {shopProfile?.mobileNumber || '+91 9611399943/9663495417'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    padding: '3px',
                    borderRadius: '50%',
                    backgroundColor: EXPORT_PALETTE.paleTeal,
                    color: EXPORT_PALETTE.teal,
                    flexShrink: 0,
                  }}
                >
                  <Mail style={{ width: '13px', height: '13px' }} />
                </span>
                <span style={{ color: EXPORT_PALETTE.mutedText }}>
                  {shopProfile?.email || 'nextgenscraprecycle@gmail.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Bill Header & Consistent 3-Column Meta Grid */}
          <div style={{ width: '270px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: EXPORT_PALETTE.navy,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                    margin: 0,
                  }}
                >
                  BILL
                </h2>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    color: EXPORT_PALETTE.teal,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                  }}
                >
                  THANK YOU!
                </div>
              </div>

              {/* Slanted Teal Invoice Number Badge */}
              <div
                style={{
                  padding: '7px 16px',
                  backgroundColor: EXPORT_PALETTE.teal,
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '15px',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)',
                  minWidth: 'fit-content',
                }}
              >
                # {invoiceNum}
              </div>
            </div>

            {/* Structured 4-Column CSS Grid: Icon (20px) | Label (86px) | Colon (10px) | Value (1fr) */}
            <div
              style={{
                marginTop: '12px',
                backgroundColor: EXPORT_PALETTE.white,
                border: `1px solid ${EXPORT_PALETTE.border}`,
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'grid',
                gridTemplateColumns: '20px 86px 10px 1fr',
                rowGap: '6px',
                alignItems: 'center',
              }}
            >
              {/* Row 1: Date */}
              <Calendar style={{ width: '14px', height: '14px', color: EXPORT_PALETTE.teal }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText }}>Date</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText, textAlign: 'center' }}>:</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: EXPORT_PALETTE.navy, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {formattedDate}
              </span>

              {/* Divider */}
              <div style={{ gridColumn: 'span 4', height: '1px', backgroundColor: EXPORT_PALETTE.lightBg, margin: '1px 0' }} />

              {/* Row 2: Time */}
              <Clock style={{ width: '14px', height: '14px', color: EXPORT_PALETTE.teal }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText }}>Time</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText, textAlign: 'center' }}>:</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: EXPORT_PALETTE.navy, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {invoiceTime}
              </span>

              {/* Divider */}
              <div style={{ gridColumn: 'span 4', height: '1px', backgroundColor: EXPORT_PALETTE.lightBg, margin: '1px 0' }} />

              {/* Row 3: Cashier */}
              <User style={{ width: '14px', height: '14px', color: EXPORT_PALETTE.teal }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText }}>Cashier</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText, textAlign: 'center' }}>:</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: EXPORT_PALETTE.navy, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {cashierName}
              </span>

              {/* Divider */}
              <div style={{ gridColumn: 'span 4', height: '1px', backgroundColor: EXPORT_PALETTE.lightBg, margin: '1px 0' }} />

              {/* Row 4: Payment Mode */}
              <CreditCard style={{ width: '14px', height: '14px', color: EXPORT_PALETTE.teal }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText }}>Payment Mode</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: EXPORT_PALETTE.mutedText, textAlign: 'center' }}>:</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: EXPORT_PALETTE.navy, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {paymentMode}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. CUSTOMER DETAILS CARD (Clean 2-Column: Name & Default Notes) */}
        {/* ============================================================== */}
        <div
          style={{
            backgroundColor: EXPORT_PALETTE.paleTeal,
            border: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
            borderRadius: '14px',
            padding: '14px 20px',
            marginBottom: '20px',
            overflow: 'visible',
            height: 'auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px 24px',
              alignItems: 'center',
            }}
          >
            {/* Left Section: Customer Name (defaults to 'Unknown' if empty) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: EXPORT_PALETTE.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                <User style={{ width: '14px', height: '14px' }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: EXPORT_PALETTE.darkText, lineHeight: '1.4', wordBreak: 'break-word' }}>
                <span style={{ color: EXPORT_PALETTE.mutedText, fontWeight: 500 }}>Customer Name : </span>
                <span style={{ fontWeight: 800, color: EXPORT_PALETTE.navy }}>
                  {customerDisplayName}
                </span>
              </div>
            </div>

            {/* Right Section: Default Thank-You Notes */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderLeft: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
                paddingLeft: '20px',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: EXPORT_PALETTE.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                <FileText style={{ width: '14px', height: '14px' }} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: EXPORT_PALETTE.darkText, lineHeight: '1.4', wordBreak: 'break-word', flex: 1 }}>
                <span style={{ color: EXPORT_PALETTE.mutedText, fontWeight: 500 }}>Notes : </span>
                <span style={{ fontWeight: 600, color: EXPORT_PALETTE.navy }}>
                  {invoiceNote}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. ITEMS TABLE (Fixed: Consistent SVG Icons & Right Aligned Qty) */}
        {/* ============================================================== */}
        <div
          style={{
            marginBottom: '20px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${EXPORT_PALETTE.border}`,
          }}
        >
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    backgroundColor: EXPORT_PALETTE.navy,
                    color: '#FFFFFF',
                    padding: '12px 14px',
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    width: '52px',
                  }}
                >
                  S.NO.
                </th>
                <th
                  style={{
                    backgroundColor: EXPORT_PALETTE.navy,
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: 800,
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  ITEMS
                </th>
                <th
                  style={{
                    backgroundColor: EXPORT_PALETTE.navy,
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    width: '110px',
                  }}
                >
                  QTY. (KG)
                </th>
                <th
                  style={{
                    backgroundColor: EXPORT_PALETTE.navy,
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    width: '120px',
                  }}
                >
                  RATE (₹)
                </th>
                <th
                  style={{
                    backgroundColor: EXPORT_PALETTE.teal,
                    color: '#FFFFFF',
                    padding: '12px 18px',
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    width: '140px',
                  }}
                >
                  AMOUNT (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '36px',
                      textAlign: 'center',
                      fontStyle: 'italic',
                      color: EXPORT_PALETTE.mutedText,
                    }}
                  >
                    No items in this invoice. Add items in billing terminal.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const rowTotal = (Number(row.price) || 0) * (Number(row.qty) || 0);
                  const isAlt = index % 2 === 1;

                  return (
                    <tr
                      key={row.id || index}
                      style={{
                        backgroundColor: isAlt ? EXPORT_PALETTE.lightBg : EXPORT_PALETTE.white,
                        borderBottom: `1px solid ${EXPORT_PALETTE.border}`,
                        minHeight: '44px',
                      }}
                    >
                      {/* S.No */}
                      <td
                        style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: EXPORT_PALETTE.mutedText,
                        }}
                      >
                        {index + 1}
                      </td>

                      {/* Items with Centered Vector SVG Icon */}
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <MaterialCategoryIcon itemName={row.item} />
                          <span style={{ fontWeight: 800, color: EXPORT_PALETTE.navy, fontSize: '13px' }}>
                            {row.item}
                          </span>
                        </div>
                      </td>

                      {/* Quantity in KG (Right-aligned with tabular numbers) */}
                      <td
                        style={{
                          padding: '10px 16px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: EXPORT_PALETTE.darkText,
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: '13px',
                        }}
                      >
                        {formatNumberOnly(row.qty)}
                      </td>

                      {/* Rate per KG (Right-aligned) */}
                      <td
                        style={{
                          padding: '10px 16px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: EXPORT_PALETTE.darkText,
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: '13px',
                        }}
                      >
                        {formatNumberOnly(row.price)}
                      </td>

                      {/* Row Total (Right-aligned in Teal) */}
                      <td
                        style={{
                          padding: '10px 18px',
                          textAlign: 'right',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          color: EXPORT_PALETTE.teal,
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: '13px',
                        }}
                      >
                        {formatNumberOnly(rowTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ============================================================== */}
        {/* 4. BILLING SUMMARY & AMOUNT IN WORDS SECTION */}
        {/* ============================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Amount in Words & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Amount in words card */}
            <div
              style={{
                backgroundColor: EXPORT_PALETTE.paleTeal,
                border: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
                borderRadius: '12px',
                padding: '12px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: EXPORT_PALETTE.teal,
                    color: '#FFFFFF',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  ₹
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: EXPORT_PALETTE.navy,
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    AMOUNT IN WORDS
                  </span>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      fontStyle: 'italic',
                      lineHeight: '1.35',
                      color: EXPORT_PALETTE.teal,
                      margin: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {numberToWordsINR(grandTotal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shop terms / notes card */}
            <div
              style={{
                backgroundColor: EXPORT_PALETTE.lightBg,
                border: `1px solid ${EXPORT_PALETTE.border}`,
                borderRadius: '12px',
                padding: '12px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: EXPORT_PALETTE.navy,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <FileText style={{ width: '13px', height: '13px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: EXPORT_PALETTE.navy,
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    NOTES
                  </span>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      lineHeight: '1.4',
                      color: EXPORT_PALETTE.mutedText,
                      margin: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {shopProfile?.terms || 'Goods once weighed and sold will not be taken back. Rates are subject to daily scrap market conditions. Thank you for your valuable visit!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calculations & Compact Grand Total Card (No excessive empty gap) */}
          <div
            style={{
              backgroundColor: EXPORT_PALETTE.white,
              border: `1px solid ${EXPORT_PALETTE.border}`,
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: EXPORT_PALETTE.darkText }}>
                <span>Total Weight</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: EXPORT_PALETTE.navy, fontSize: '13px' }}>
                  {formatNumberOnly(totalQuantity)} KG
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: EXPORT_PALETTE.darkText }}>
                <span>Sub Total</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: EXPORT_PALETTE.navy, fontSize: '13px' }}>
                  ₹ {formatNumberOnly(subTotal)}
                </span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: EXPORT_PALETTE.teal }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '13px' }}>
                    - ₹ {formatNumberOnly(discount)}
                  </span>
                </div>
              )}
            </div>

            {/* Prominent Teal Grand Total Banner */}
            <div
              style={{
                backgroundColor: EXPORT_PALETTE.teal,
                color: '#FFFFFF',
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                GRAND TOTAL
              </span>
              <span style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                ₹ {formatNumberOnly(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. FOOTER BADGES & SIGNATURE SECTION */}
        {/* ============================================================== */}
        <div
          style={{
            borderTop: `1px solid ${EXPORT_PALETTE.lightBg}`,
            paddingTop: '16px',
            paddingBottom: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Feature Badges Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px 20px',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: EXPORT_PALETTE.darkText }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: EXPORT_PALETTE.paleTeal,
                  border: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
                  color: EXPORT_PALETTE.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 style={{ width: '15px', height: '15px' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>
                Quality<br />
                <span style={{ color: EXPORT_PALETTE.mutedText, fontWeight: 500 }}>Service</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: EXPORT_PALETTE.darkText }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: EXPORT_PALETTE.paleTeal,
                  border: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
                  color: EXPORT_PALETTE.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Scale style={{ width: '15px', height: '15px' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>
                Accurate<br />
                <span style={{ color: EXPORT_PALETTE.mutedText, fontWeight: 500 }}>Digital Scale</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: EXPORT_PALETTE.darkText }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: EXPORT_PALETTE.paleTeal,
                  border: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
                  color: EXPORT_PALETTE.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Tag style={{ width: '15px', height: '15px' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>
                Best Market<br />
                <span style={{ color: EXPORT_PALETTE.mutedText, fontWeight: 500 }}>Prices</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: EXPORT_PALETTE.darkText }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: EXPORT_PALETTE.paleTeal,
                  border: `1px solid ${EXPORT_PALETTE.paleTealBorder}`,
                  color: EXPORT_PALETTE.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Truck style={{ width: '15px', height: '15px' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>
                Instant<br />
                <span style={{ color: EXPORT_PALETTE.mutedText, fontWeight: 500 }}>Payment</span>
              </div>
            </div>
          </div>

          {/* Authorised Signature Area */}
          <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '130px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: EXPORT_PALETTE.mutedText,
                marginBottom: '2px',
              }}
            >
              Authorised Sign.
            </div>
            <div style={{ width: '130px', marginLeft: 'auto' }}>
              <div
                style={{
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#2563EB',
                  userSelect: 'none',
                  paddingBottom: '2px',
                }}
              >
                {cashierName}
              </div>
              <div style={{ height: '1.5px', width: '100%', borderRadius: '1px', backgroundColor: '#3B82F6' }} />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 6. BOTTOM NAVY BANNER (VISIT AGAIN!) */}
        {/* ============================================================== */}
        <div
          style={{
            backgroundColor: EXPORT_PALETTE.navy,
            borderRadius: '10px',
            padding: '10px 20px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
          }}
        >
          {/* Left dots decoration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.4 }}>
            {[...Array(4)].map((_, i) => (
              <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: EXPORT_PALETTE.teal, display: 'block' }} />
            ))}
          </div>

          {/* Center Text */}
          <div
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            VISIT AGAIN!
          </div>

          {/* Right dots decoration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.4 }}>
            {[...Array(4)].map((_, i) => (
              <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: EXPORT_PALETTE.teal, display: 'block' }} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
