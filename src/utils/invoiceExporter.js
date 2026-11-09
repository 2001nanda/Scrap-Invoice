import { sanitizeClonedInvoiceTree } from './colorSanitizer';

/**
 * Downloads a DOM element as a high-resolution PNG image
 * @param {HTMLElement|string} target - The DOM element or its element ID
 * @param {string} filename - Filename without extension
 */
export async function downloadInvoiceAsImage(target, filename = 'ScrapBill') {
  const { default: html2canvas } = await import('html2canvas');

  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) throw new Error('Invoice element not found');

  // Wait for fonts to finish loading
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Small delay to ensure any layout changes settle
  await new Promise(r => setTimeout(r, 100));

  const targetContent = element.firstElementChild || element;
  const captureWidth = 820;
  const captureHeight = Math.max(element.scrollHeight, element.offsetHeight, targetContent.scrollHeight, targetContent.offsetHeight);

  const canvas = await html2canvas(element, {
    scale: 2.5, // 2.5x high-DPI retina sharpness
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    width: captureWidth,
    height: captureHeight,
    windowWidth: captureWidth,
    windowHeight: captureHeight,
    onclone: (clonedDoc, clonedElement) => {
      // In cloned iframe, ensure clonedElement is at (0, 0) with unconstrained dimensions
      clonedElement.style.position = 'relative';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.width = '820px';
      clonedElement.style.height = 'auto';
      clonedElement.style.maxHeight = 'none';
      clonedElement.style.overflow = 'visible';
      clonedElement.style.margin = '0 auto';

      if (clonedDoc.body) {
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.height = 'auto';
      }

      // Convert any residual modern CSS color functions (oklch, oklab)
      sanitizeClonedInvoiceTree(clonedDoc, clonedElement);
    },
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas to Blob conversion failed'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve(true);
    }, 'image/png', 1.0);
  });
}

/**
 * Downloads a DOM element as a professional A4 PDF
 * @param {HTMLElement|string} target - The DOM element or its element ID
 * @param {string} filename - Filename without extension
 */
export async function downloadInvoiceAsPDF(target, filename = 'ScrapBill') {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) throw new Error('Invoice element not found');

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  await new Promise(r => setTimeout(r, 100));

  const targetContent = element.firstElementChild || element;
  const captureWidth = 820;
  const captureHeight = Math.max(element.scrollHeight, element.offsetHeight, targetContent.scrollHeight, targetContent.offsetHeight);

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    width: captureWidth,
    height: captureHeight,
    windowWidth: captureWidth,
    windowHeight: captureHeight,
    onclone: (clonedDoc, clonedElement) => {
      clonedElement.style.position = 'relative';
      clonedElement.style.left = '0';
      clonedElement.style.top = '0';
      clonedElement.style.width = '820px';
      clonedElement.style.height = 'auto';
      clonedElement.style.maxHeight = 'none';
      clonedElement.style.overflow = 'visible';
      clonedElement.style.margin = '0 auto';

      if (clonedDoc.body) {
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.height = 'auto';
      }

      sanitizeClonedInvoiceTree(clonedDoc, clonedElement);
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Standard A4 portrait: 210mm x 297mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  
  // Fit to A4 width with 8mm side padding
  const margin = 8;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  if (contentHeight <= (pageHeight - (margin * 2))) {
    // Fits on single page
    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
  } else {
    // Multi-page handling for long invoices
    let heightLeft = contentHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
    heightLeft -= (pageHeight - (margin * 2));

    while (heightLeft > 0) {
      position -= (pageHeight - (margin * 2));
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pageHeight - (margin * 2));
    }
  }

  pdf.save(`${filename}.pdf`);
  return true;
}
