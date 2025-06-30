// إصلاح قسري لمشكلة PDF.js worker
import { setupStablePdfJs } from './pdfjs-stable-setup';

// إصلاح قسري يتجاوز المشكلة الأساسية
export const forceFixPdfJsWorker = async (): Promise<boolean> => {
  console.log('🔧 تطبيق إصلاح قسري لـ PDF.js worker...');
  
  try {
    // أولاً: محاولة الإعداد المستقر (إصدار قديم ومجرب)
    console.log('🔧 محاولة الإعداد المستقر أولاً...');
    const stableSetupSuccess = await setupStablePdfJs();
    
    if (stableSetupSuccess) {
      console.log('✅ نجح الإعداد المستقر!');
      return true;
    }
    
    console.log('⚠️ فشل الإعداد المستقر، محاولة إصلاح PDF.js الحالي...');
    
    // إذا كان PDF.js موجود، نحاول إعادة تعيين كل شيء
    if (typeof window.pdfjsLib !== 'undefined') {
      // حفظ مرجع للمكتبة الحالية
      const currentPdfJs = window.pdfjsLib;
      
      // محاولة إعادة تعيين worker بطريقة قسرية
      if (currentPdfJs.GlobalWorkerOptions) {
        // تجربة عدة مسارات worker
        const workerPaths = [
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
          'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
          `${window.location.origin}/pdf.worker.min.js`
        ];
        
        for (const workerPath of workerPaths) {
          try {
            console.log(`🧪 تجربة worker path: ${workerPath}`);
            
            // إعادة تعيين worker
            currentPdfJs.GlobalWorkerOptions.workerSrc = workerPath;
            
            // محاولة إنشاء مستند بسيط للاختبار
            const testPdf = new Uint8Array([
              0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a,
              0x25, 0xc4, 0xe5, 0xf2, 0xe5, 0xeb, 0xa7, 0xf3, 0xa0, 0xd0, 0xc4, 0xc6, 0x0a,
              0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
              0x32, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2f, 0x4b, 0x69, 0x64, 0x73, 0x5b, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5d, 0x2f, 0x43, 0x6f, 0x75, 0x6e, 0x74, 0x20, 0x31, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
              0x33, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x2f, 0x50, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x2f, 0x4d, 0x65, 0x64, 0x69, 0x61, 0x42, 0x6f, 0x78, 0x5b, 0x30, 0x20, 0x30, 0x20, 0x36, 0x31, 0x32, 0x20, 0x37, 0x39, 0x32, 0x5d, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
              0x78, 0x72, 0x65, 0x66, 0x0a, 0x30, 0x20, 0x34, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x39, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x37, 0x34, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x32, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, 0x72, 0x0a, 0x3c, 0x3c, 0x2f, 0x53, 0x69, 0x7a, 0x65, 0x20, 0x34, 0x2f, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x32, 0x31, 0x39, 0x0a, 0x25, 0x25, 0x45, 0x4f, 0x46
            ]);
            
            const loadingTask = currentPdfJs.getDocument({ 
              data: testPdf,
              verbosity: 0,
              // إضافة خيارات إضافية لتجاوز المشكلة
              useWorkerFetch: false,
              isEvalSupported: false,
              useSystemFonts: false
            });
            
            const doc = await loadingTask.promise;
            await doc.destroy();
            
            console.log(`✅ نجح الإصلاح القسري مع worker: ${workerPath}`);
            return true;
            
          } catch (error: any) {
            console.warn(`❌ فشل worker path ${workerPath}:`, error.message);
            continue;
          }
        }
      }
    }
    
    // إذا فشل كل شيء، نحاول تحميل PDF.js من الصفر
    console.log('🔄 محاولة تحميل PDF.js من الصفر...');
    return await loadFreshPdfJs();
    
  } catch (error: any) {
    console.error('❌ فشل الإصلاح القسري:', error);
    return false;
  }
};

// تحميل PDF.js جديد من الصفر
const loadFreshPdfJs = async (): Promise<boolean> => {
  try {
    // إزالة PDF.js الحالي
    if (typeof window.pdfjsLib !== 'undefined') {
      delete (window as any).pdfjsLib;
    }
    
    // إزالة scripts الموجودة
    const existingScripts = document.querySelectorAll('script[src*="pdf"]');
    existingScripts.forEach(script => script.remove());
    
    // تحميل إصدار مستقر من PDF.js
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    
    // انتظار قصير للتأكد من التحميل
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (typeof window.pdfjsLib !== 'undefined') {
      // تعيين worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      console.log('✅ تم تحميل PDF.js جديد بنجاح');
      console.log('📦 الإصدار الجديد:', window.pdfjsLib.version);
      
      return true;
    }
    
    return false;
    
  } catch (error: any) {
    console.error('❌ فشل تحميل PDF.js جديد:', error);
    return false;
  }
};

// تحميل script
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
};

// إصلاح فوري بدون إعادة تحميل
export const quickWorkerFix = (): void => {
  if (typeof window.pdfjsLib !== 'undefined' && window.pdfjsLib.GlobalWorkerOptions) {
    // استخدام worker مستقر
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // محاولة تعطيل بعض الميزات التي قد تسبب مشاكل
    if (window.pdfjsLib.GlobalWorkerOptions.workerPort) {
      delete window.pdfjsLib.GlobalWorkerOptions.workerPort;
    }
    
    console.log('🚀 تم تطبيق إصلاح فوري للـ worker');
  }
};