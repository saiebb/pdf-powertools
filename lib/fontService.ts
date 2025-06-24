
let arabicFontBufferSingleton: ArrayBuffer | null = null;

type DisplayMessageFn = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
let displayAppMessage: DisplayMessageFn = () => {}; // No-op default

export function setDisplayAppMessageFn(fn: DisplayMessageFn) {
  displayAppMessage = fn;
}

export async function fetchArabicFont(): Promise<ArrayBuffer | null> {
  if (arabicFontBufferSingleton) {
    return arabicFontBufferSingleton;
  }
  try {
    // No longer ensureFontkitIsLoaded, as fontkit is removed.
    const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/fontsource-noto-sans-arabic/5.0.12/files/noto-sans-arabic-arabic-400-normal.woff2';
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error(`Failed to fetch font: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    arabicFontBufferSingleton = buffer;
    console.log("Arabic font (Noto Sans Arabic WOFF2) loaded successfully.");
    return buffer;
  } catch (err) {
    console.error("Error loading Arabic font:", err);
    displayAppMessage('warning', "لم يتم تحميل الخط العربي، قد لا تظهر النصوص العربية بشكل صحيح في التعليقات.", 10000);
    return null;
  }
}

export function getArabicFontBuffer(): ArrayBuffer | null {
    return arabicFontBufferSingleton;
}

// Removed: ensureFontkitIsLoaded, registerFontkitWithPdfLib, getFontkitInstance
// PDFLib.PDFDocument.registerFontkit will no longer be called.
// pdf-lib will attempt to embed fonts directly.
