/**
 * Color Sanitizer for Invoice Image and PDF Export
 * Replaces modern unsupported CSS color functions (oklch, oklab, color()) 
 * with standard RGB and HEX values compatible with html2canvas.
 */

export const EXPORT_PALETTE = {
  navy: '#10243A',
  teal: '#0D9488',
  white: '#FFFFFF',
  lightBg: '#F3F6F8',
  darkText: '#263445',
  mutedText: '#64748B',
  border: '#DCE3EA',
  success: '#15803D',
  paleTeal: '#EDF8F7',
  paleTealBorder: '#BCE3DE',
};

// Offscreen canvas context for native browser color parsing
let cachedCanvas = null;
let cachedCtx = null;

function get2DContext() {
  if (typeof document === 'undefined') return null;
  if (!cachedCtx) {
    cachedCanvas = document.createElement('canvas');
    cachedCanvas.width = 1;
    cachedCanvas.height = 1;
    cachedCtx = cachedCanvas.getContext('2d', { willReadFrequently: true });
  }
  return cachedCtx;
}

/**
 * Converts any single color value (including oklch, oklab) into a standard rgb(...) or #hex string
 */
export function convertColorToStandard(colorStr, fallback = '#263445') {
  if (!colorStr || typeof colorStr !== 'string') return fallback;
  
  // If already standard format without modern functions
  if (!colorStr.includes('oklch') && !colorStr.includes('oklab') && !colorStr.includes('color(')) {
    return colorStr;
  }

  // Use browser 2D canvas context to compute standard RGB
  const ctx = get2DContext();
  if (ctx) {
    try {
      ctx.fillStyle = '#000000'; // reset
      ctx.fillStyle = colorStr;
      const computed = ctx.fillStyle;
      if (computed && !computed.includes('oklch') && !computed.includes('oklab')) {
        return computed; // returns "#rrggbb" or "rgba(r, g, b, a)"
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback heuristic based on color names or lightness
  const lower = colorStr.toLowerCase();
  if (lower.includes('teal') || lower.includes('180') || lower.includes('170') || lower.includes('190')) {
    return EXPORT_PALETTE.teal;
  }
  if (lower.includes('slate') || lower.includes('gray') || lower.includes('grey')) {
    return EXPORT_PALETTE.mutedText;
  }
  if (lower.includes('0.9') || lower.includes('0.8') || lower.includes('white')) {
    return EXPORT_PALETTE.lightBg;
  }
  return fallback;
}

/**
 * Sanitizes any complex CSS string (e.g. boxShadow, border, gradient) containing oklch
 */
export function sanitizeCssString(val) {
  if (!val || typeof val !== 'string') return val;
  if (!val.includes('oklch') && !val.includes('oklab') && !val.includes('color(')) {
    return val;
  }

  // Replace oklch(...) occurrences
  return val.replace(/oklch\([^)]+\)/gi, (match) => {
    return convertColorToStandard(match, 'rgba(16, 36, 58, 0.1)');
  }).replace(/oklab\([^)]+\)/gi, (match) => {
    return convertColorToStandard(match, 'rgba(16, 36, 58, 0.1)');
  });
}

/**
 * Deeply sanitizes the cloned document tree before html2canvas parses it.
 * This guarantees:
 * 1. clonedDoc.documentElement & clonedDoc.body have standard colors (#FFFFFF / #263445)
 * 2. All elements inside the invoice have resolved, supported RGB/HEX colors
 * 3. Box shadows, borders, text, and SVG fills avoid oklch
 */
export function sanitizeClonedInvoiceTree(clonedDoc, clonedElement) {
  if (!clonedDoc) return;

  const view = clonedDoc.defaultView || window;

  // 1. Sanitize document root and body background (critical for html2canvas initial parse)
  if (clonedDoc.documentElement) {
    clonedDoc.documentElement.style.backgroundColor = '#FFFFFF';
    clonedDoc.documentElement.style.color = '#263445';
  }
  if (clonedDoc.body) {
    clonedDoc.body.style.backgroundColor = '#FFFFFF';
    clonedDoc.body.style.color = '#263445';
  }

  // 2. Inject an explicit scoped stylesheet into clonedDoc head to override Tailwind oklch variables
  try {
    const styleOverride = clonedDoc.createElement('style');
    styleOverride.id = 'html2canvas-color-override';
    styleOverride.textContent = `
      :root, html, body {
        background-color: #FFFFFF !important;
        color: #263445 !important;
        --tw-shadow: 0 0 #0000 !important;
        --tw-shadow-colored: 0 0 #0000 !important;
        --tw-ring-color: #DCE3EA !important;
      }
      * {
        border-color: #DCE3EA;
        outline-color: #0D9488;
      }
      #printable-invoice, #invoice-capture-container {
        background-color: #FFFFFF !important;
        color: #263445 !important;
      }
    `;
    clonedDoc.head.appendChild(styleOverride);
  } catch (err) {
    console.warn('Failed to inject style override in clone:', err);
  }

  // 3. Ensure clonedElement is positioned at (0, 0) with unconstrained height
  if (clonedElement) {
    clonedElement.style.position = 'relative';
    clonedElement.style.left = '0';
    clonedElement.style.top = '0';
    clonedElement.style.width = '820px';
    clonedElement.style.maxWidth = '820px';
    clonedElement.style.height = 'auto';
    clonedElement.style.maxHeight = 'none';
    clonedElement.style.overflow = 'visible';
    clonedElement.style.margin = '0 auto';
  }

  // 4. Properties to inspect and sanitize on every element
  const colorProps = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'boxShadow',
    'textDecorationColor',
    'fill',
    'stroke',
  ];

  const targetRoot = clonedElement || clonedDoc.body;
  const elements = [targetRoot, ...Array.from(targetRoot.querySelectorAll('*'))];

  elements.forEach((el) => {
    if (!el || !el.style) return;

    try {
      const computed = view.getComputedStyle(el);
      if (!computed) return;

      // Check each color property
      colorProps.forEach((prop) => {
        const val = computed[prop] || el.style[prop];
        if (val && typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color('))) {
          const cleanVal = sanitizeCssString(val);
          el.style[prop] = cleanVal;
        }
      });

      // Neutralize any oklch in inline background gradient
      const bg = el.style.background || el.style.backgroundImage;
      if (bg && (bg.includes('oklch') || bg.includes('oklab'))) {
        el.style.backgroundImage = sanitizeCssString(bg);
      }

      // Neutralize any Tailwind box-shadow containing oklch
      const shadow = computed.boxShadow || el.style.boxShadow;
      if (shadow && (shadow.includes('oklch') || shadow.includes('oklab'))) {
        el.style.boxShadow = sanitizeCssString(shadow);
      }
    } catch {
      // Ignore individual element inspection error
    }
  });
}
