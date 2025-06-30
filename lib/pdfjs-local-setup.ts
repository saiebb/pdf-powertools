// إعداد PDF.js المحلي للتطبيق
import * as pdfjsLib from 'pdfjs-dist';

// إعداد PDF.js للعمل مع Vite
export const setupLocalPdfjs = async () => {
  try {
    // تحديد مسار worker باستخدام import.meta.url
    let workerUrl: string;
    
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } else {
      // fallback إذا لم يكن import.meta متاح
      workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    
    // تعيين PDF.js على window للاستخدام العام
    (window as any).pdfjsLib = pdfjsLib;
    
    console.log('PDF.js setup completed locally');
    console.log('PDF.js version:', pdfjsLib.version);
    console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    return true;
  } catch (error) {
    console.error('Failed to setup PDF.js locally:', error);
    return false;
  }
};

// تصدير PDF.js للاستخدام المباشر
export { pdfjsLib };