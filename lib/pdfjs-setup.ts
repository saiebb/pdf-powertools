import * as pdfjsLib from 'pdfjs-dist';

// إعداد PDF.js للعمل في المتصفح
export const setupPdfjs = () => {
  // تحديد مسار worker لـ PDF.js - استخدام مسار محلي أكثر أماناً
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url
      ).toString();
    } else {
      throw new Error('import.meta.url not available');
    }
  } catch (error) {
    // fallback للـ CDN في حالة فشل المسار المحلي
    console.warn('فشل في تحميل PDF.js worker محلياً، استخدام CDN:', error);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
};

// تصدير PDF.js للاستخدام في التطبيق
export { pdfjsLib };