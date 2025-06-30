// أدوات تشخيص PDF.js لحل المشاكل

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export interface PdfJsDiagnostics {
  isAvailable: boolean;
  version?: string;
  workerConfigured: boolean;
  workerSrc?: string;
  canCreateDocument: boolean;
  errors: string[];
  recommendations: string[];
}

export const runPdfJsDiagnostics = async (): Promise<PdfJsDiagnostics> => {
  const diagnostics: PdfJsDiagnostics = {
    isAvailable: false,
    workerConfigured: false,
    canCreateDocument: false,
    errors: [],
    recommendations: []
  };

  try {
    // فحص توفر PDF.js
    if (typeof window.pdfjsLib === 'undefined') {
      diagnostics.errors.push('PDF.js غير متاح على window.pdfjsLib');
      diagnostics.recommendations.push('تأكد من تحميل مكتبة PDF.js بشكل صحيح');
      return diagnostics;
    }

    diagnostics.isAvailable = true;
    diagnostics.version = window.pdfjsLib.version;

    // فحص إعداد Worker
    if (!window.pdfjsLib.GlobalWorkerOptions) {
      diagnostics.errors.push('GlobalWorkerOptions غير متاح');
      diagnostics.recommendations.push('تحديث إصدار PDF.js أو إعادة تحميل المكتبة');
    } else {
      const workerSrc = window.pdfjsLib.GlobalWorkerOptions.workerSrc;
      if (!workerSrc || workerSrc.length === 0) {
        diagnostics.errors.push('Worker source غير محدد');
        diagnostics.recommendations.push('تحديد مسار PDF.js worker');
      } else {
        diagnostics.workerConfigured = true;
        diagnostics.workerSrc = workerSrc;
      }
    }

    // فحص قدرة إنشاء المستندات
    if (typeof window.pdfjsLib.getDocument === 'function') {
      try {
        // إنشاء مستند PDF بسيط للاختبار
        const testPdf = new Uint8Array([
          0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc4, 0xe5, 0xf2, 0xe5, 0xeb, 0xa7, 0xf3, 0xa0, 0xd0, 0xc4, 0xc6, 0x0a
        ]);
        
        const loadingTask = window.pdfjsLib.getDocument({ data: testPdf });
        await loadingTask.promise;
        diagnostics.canCreateDocument = true;
      } catch (error: any) {
        diagnostics.errors.push(`فشل في إنشاء مستند PDF للاختبار: ${error.message}`);
        diagnostics.recommendations.push('التحقق من إعدادات PDF.js worker');
      }
    } else {
      diagnostics.errors.push('دالة getDocument غير متاحة');
      diagnostics.recommendations.push('إعادة تحميل مكتبة PDF.js');
    }

  } catch (error: any) {
    diagnostics.errors.push(`خطأ عام في التشخيص: ${error.message}`);
    diagnostics.recommendations.push('إعادة تحميل الصفحة والمحاولة مرة أخرى');
  }

  return diagnostics;
};

export const printPdfJsDiagnostics = async (): Promise<void> => {
  console.log('🔍 بدء تشخيص PDF.js...');
  
  const diagnostics = await runPdfJsDiagnostics();
  
  console.log('📊 نتائج التشخيص:');
  console.log(`✅ PDF.js متاح: ${diagnostics.isAvailable}`);
  
  if (diagnostics.version) {
    console.log(`📦 الإصدار: ${diagnostics.version}`);
  }
  
  console.log(`⚙️ Worker مُعد: ${diagnostics.workerConfigured}`);
  
  if (diagnostics.workerSrc) {
    console.log(`🔗 Worker source: ${diagnostics.workerSrc}`);
  }
  
  console.log(`📄 يمكن إنشاء مستندات: ${diagnostics.canCreateDocument}`);
  
  if (diagnostics.errors.length > 0) {
    console.log('❌ الأخطاء:');
    diagnostics.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.log('💡 التوصيات:');
    diagnostics.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  console.log('🔍 انتهاء التشخيص');
};