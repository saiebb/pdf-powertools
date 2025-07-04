// إعداد PDF.js باستخدام إصدار مستقر ومجرب
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// استخدام إصدار مستقر من PDF.js (2.16.105) - إصدار قديم ومستقر
const STABLE_PDF_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
const STABLE_PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export const setupStablePdfJs = async (): Promise<boolean> => {
  console.log('🔧 إعداد PDF.js باستخدام إصدار مستقر (2.16.105)...');
  
  try {
    // إزالة PDF.js الحالي إذا كان موجود
    if (typeof window.pdfjsLib !== 'undefined') {
      console.log('🗑️ إزالة PDF.js الحالي...');
      delete (window as any).pdfjsLib;
    }
    
    // إزالة scripts الموجودة
    const existingScripts = document.querySelectorAll('script[src*="pdf"]');
    existingScripts.forEach(script => {
      console.log('🗑️ إزالة script:', script.getAttribute('src'));
      script.remove();
    });
    
    // انتظار قصير للتأكد من التنظيف
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // تحميل الإصدار المستقر
    console.log('📥 تحميل PDF.js الإصدار المستقر...');
    await loadScript(STABLE_PDF_JS_URL);
    
    // انتظار للتأكد من التحميل
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (typeof window.pdfjsLib === 'undefined') {
      throw new Error('فشل تحميل PDF.js المستقر');
    }
    
    // تعيين worker
    console.log('⚙️ تعيين worker للإصدار المستقر...');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = STABLE_PDF_WORKER_URL;
    
    // اختبار PDF.js
    console.log('🧪 اختبار PDF.js المستقر...');
    const testResult = await testPdfJs();
    
    if (testResult) {
      console.log('✅ نجح إعداد PDF.js المستقر!');
      console.log('📦 الإصدار:', window.pdfjsLib.version);
      console.log('🔗 Worker:', window.pdfjsLib.GlobalWorkerOptions.workerSrc);
      return true;
    } else {
      throw new Error('فشل اختبار PDF.js المستقر');
    }
    
  } catch (error: any) {
    console.error('❌ فشل إعداد PDF.js المستقر:', error);
    return false;
  }
};

// تحميل script
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      console.log('✅ تم تحميل:', src);
      resolve();
    };
    script.onerror = (error) => {
      console.error('❌ فشل تحميل:', src, error);
      reject(new Error(`Failed to load: ${src}`));
    };
    document.head.appendChild(script);
  });
};

// اختبار PDF.js
const testPdfJs = async (): Promise<boolean> => {
  try {
    if (typeof window.pdfjsLib === 'undefined') {
      return false;
    }
    
    // إنشاء PDF بسيط للاختبار
    const testPdf = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a,
      0x25, 0xc4, 0xe5, 0xf2, 0xe5, 0xeb, 0xa7, 0xf3, 0xa0, 0xd0, 0xc4, 0xc6, 0x0a,
      0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
      0x32, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2f, 0x4b, 0x69, 0x64, 0x73, 0x5b, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5d, 0x2f, 0x43, 0x6f, 0x75, 0x6e, 0x74, 0x20, 0x31, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
      0x33, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x2f, 0x50, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x2f, 0x4d, 0x65, 0x64, 0x69, 0x61, 0x42, 0x6f, 0x78, 0x5b, 0x30, 0x20, 0x30, 0x20, 0x36, 0x31, 0x32, 0x20, 0x37, 0x39, 0x32, 0x5d, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
      0x78, 0x72, 0x65, 0x66, 0x0a, 0x30, 0x20, 0x34, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x39, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x37, 0x34, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x32, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, 0x72, 0x0a, 0x3c, 0x3c, 0x2f, 0x53, 0x69, 0x7a, 0x65, 0x20, 0x34, 0x2f, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x32, 0x31, 0x39, 0x0a, 0x25, 0x25, 0x45, 0x4f, 0x46
    ]);
    
    const loadingTask = window.pdfjsLib.getDocument({ 
      data: testPdf,
      verbosity: 0 
    });
    
    const doc = await loadingTask.promise;
    await doc.destroy();
    
    console.log('✅ اختبار PDF.js المستقر نجح');
    return true;
    
  } catch (error: any) {
    console.error('❌ فشل اختبار PDF.js المستقر:', error);
    return false;
  }
};