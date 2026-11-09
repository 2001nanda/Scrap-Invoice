// Indian Currency Number to Words converter

const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertChunk(n) {
  let str = '';
  if (n >= 100) {
    str += units[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += units[n] + ' ';
  }
  return str.trim();
}

export function numberToWordsINR(amount) {
  if (!amount || isNaN(amount) || amount <= 0) return 'Zero Rupees Only';

  const num = Math.floor(amount);
  const paise = Math.round((amount - num) * 100);

  // Indian numbering: Crores (10,000,000), Lakhs (100,000), Thousands (1,000), Hundreds (100)
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundred = rem;

  let words = '';

  if (crore > 0) {
    words += convertChunk(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertChunk(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertChunk(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += convertChunk(hundred) + ' ';
  }

  words = words.trim() + ' Rupees';

  if (paise > 0) {
    words += ' and ' + convertChunk(paise) + ' Paise';
  }

  return words + ' Only';
}
