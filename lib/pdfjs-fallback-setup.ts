// إعداد PDF.js البديل باستخدام CDN مع إصدار مستقر
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// استخدام إصدار مستقر ومجرب من PDF.js
const FALLBACK_PDF_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const FALLBACK_PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export const setupFallbackPdfjs = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // التحقق من وجود PDF.js مسبقاً
    if (typeof window.pdfjsLib !== 'undefined') {
      console.log('PDF.js already available, configuring worker...');
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = FALLBACK_PDF_WORKER_URL;
        console.log('Fallback PDF.js worker configured successfully');
        resolve(true);
        return;
      } catch (error) {
        console.error('Failed to configure existing PDF.js worker:', error);
      }
    }

    // تحميل PDF.js من CDN
    console.log('Loading fallback PDF.js from CDN...');
    const script = document.createElement('script');
    script.src = FALLBACK_PDF_JS_URL;
    script.onload = () => {
      console.log('Fallback PDF.js loaded successfully');
      
      // انتظار قصير للتأكد من تحميل المكتبة
      setTimeout(() => {
        try {
          if (typeof window.pdfjsLib !== 'undefined') {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = FALLBACK_PDF_WORKER_URL;
            console.log('Fallback PDF.js worker configured');
            console.log('PDF.js version:', window.pdfjsLib.version);
            resolve(true);
          } else {
            console.error('PDF.js not available after loading script');
            resolve(false);
          }
        } catch (error) {
          console.error('Error configuring fallback PDF.js:', error);
          resolve(false);
        }
      }, 500);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load fallback PDF.js:', error);
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};