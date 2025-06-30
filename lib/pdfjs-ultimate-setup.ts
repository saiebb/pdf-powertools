// الإعداد النهائي والشامل لـ PDF.js

interface SetupResult {
  success: boolean;
  method: string;
  error?: string;
  workerSrc?: string;
}

// قائمة شاملة بجميع الطرق الممكنة لإعداد PDF.js
export class PdfJsUltimateSetup {
  private static instance: PdfJsUltimateSetup;
  private setupCompleted = false;
  private lastSuccessfulMethod = '';

  static getInstance(): PdfJsUltimateSetup {
    if (!PdfJsUltimateSetup.instance) {
      PdfJsUltimateSetup.instance = new PdfJsUltimateSetup();
    }
    return PdfJsUltimateSetup.instance;
  }

  // الطريقة الرئيسية للإعداد
  async setup(): Promise<SetupResult> {
    if (this.setupCompleted && this.isReady()) {
      return {
        success: true,
        method: this.lastSuccessfulMethod,
        workerSrc: window.pdfjsLib?.GlobalWorkerOptions?.workerSrc
      };
    }

    console.log('🚀 بدء الإعداد الشامل لـ PDF.js...');

    // قائمة الطرق بالترتيب من الأفضل للأسوأ
    const setupMethods = [
      () => this.setupWithLocalWorker(),
      () => this.setupWithCdnStable(),
      () => this.setupWithCdnLatest(),
      () => this.setupWithUnpkg(),
      () => this.setupWithJsdelivr(),
      () => this.setupWithDynamicImport(),
      () => this.setupWithFallbackScript()
    ];

    for (const method of setupMethods) {
      try {
        const result = await method();
        if (result.success) {
          this.setupCompleted = true;
          this.lastSuccessfulMethod = result.method;
          console.log(`✅ نجح الإعداد باستخدام: ${result.method}`);
          return result;
        }
      } catch (error: any) {
        console.warn(`⚠️ فشلت طريقة الإعداد: ${error.message}`);
      }
    }

    return {
      success: false,
      method: 'none',
      error: 'فشل جميع طرق الإعداد'
    };
  }

  // التحقق من جاهزية PDF.js
  isReady(): boolean {
    return typeof window.pdfjsLib !== 'undefined' &&
           typeof window.pdfjsLib.getDocument === 'function' &&
           typeof window.pdfjsLib.GlobalWorkerOptions !== 'undefined' &&
           typeof window.pdfjsLib.GlobalWorkerOptions.workerSrc === 'string' &&
           window.pdfjsLib.GlobalWorkerOptions.workerSrc.length > 0;
  }

  // اختبار PDF.js بإنشاء مستند بسيط
  async test(): Promise<boolean> {
    if (!this.isReady()) return false;

    try {
      const testPdf = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a,
        0x25, 0xc4, 0xe5, 0xf2, 0xe5, 0xeb, 0xa7, 0xf3, 0xa0, 0xd0, 0xc4, 0xc6, 0x0a,
        0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
        0x32, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2f, 0x4b, 0x69, 0x64, 0x73, 0x5b, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5d, 0x2f, 0x43, 0x6f, 0x75, 0x6e, 0x74, 0x20, 0x31, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
        0x33, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x2f, 0x50, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x2f, 0x4d, 0x65, 0x64, 0x69, 0x61, 0x42, 0x6f, 0x78, 0x5b, 0x30, 0x20, 0x30, 0x20, 0x36, 0x31, 0x32, 0x20, 0x37, 0x39, 0x32, 0x5d, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
        0x78, 0x72, 0x65, 0x66, 0x0a, 0x30, 0x20, 0x34, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x39, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x37, 0x34, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x32, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, 0x72, 0x0a, 0x3c, 0x3c, 0x2f, 0x53, 0x69, 0x7a, 0x65, 0x20, 0x34, 0x2f, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x32, 0x31, 0x39, 0x0a, 0x25, 0x25, 0x45, 0x4f, 0x46
      ]);

      const loadingTask = window.pdfjsLib.getDocument({ data: testPdf, verbosity: 0 });
      const doc = await loadingTask.promise;
      await doc.destroy();
      return true;
    } catch (error) {
      console.error('فشل اختبار PDF.js:', error);
      return false;
    }
  }

  // الطرق المختلفة للإعداد

  private async setupWithLocalWorker(): Promise<SetupResult> {
    if (typeof window.pdfjsLib === 'undefined') {
      throw new Error('PDF.js غير محمل');
    }

    const workerSrc = `${window.location.origin}/pdf.worker.min.js`;
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const testResult = await this.test();
    return {
      success: testResult,
      method: 'Local Worker',
      workerSrc
    };
  }

  private async setupWithCdnStable(): Promise<SetupResult> {
    if (typeof window.pdfjsLib === 'undefined') {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    }

    const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const testResult = await this.test();
    return {
      success: testResult,
      method: 'CDN Stable (3.11.174)',
      workerSrc
    };
  }

  private async setupWithCdnLatest(): Promise<SetupResult> {
    if (typeof window.pdfjsLib === 'undefined') {
      await this.loadScript('https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.min.mjs');
    }

    const workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const testResult = await this.test();
    return {
      success: testResult,
      method: 'CDN Latest (5.3.31)',
      workerSrc
    };
  }

  private async setupWithUnpkg(): Promise<SetupResult> {
    if (typeof window.pdfjsLib === 'undefined') {
      await this.loadScript('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js');
    }

    const workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const testResult = await this.test();
    return {
      success: testResult,
      method: 'Unpkg CDN',
      workerSrc
    };
  }

  private async setupWithJsdelivr(): Promise<SetupResult> {
    if (typeof window.pdfjsLib === 'undefined') {
      await this.loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js');
    }

    const workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const testResult = await this.test();
    return {
      success: testResult,
      method: 'jsDelivr CDN',
      workerSrc
    };
  }

  private async setupWithDynamicImport(): Promise<SetupResult> {
    try {
      const pdfjs = await import('pdfjs-dist');
      (window as any).pdfjsLib = pdfjs;

      const workerSrc = typeof import.meta !== 'undefined' && import.meta.url 
        ? new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
        : 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

      const testResult = await this.test();
      return {
        success: testResult,
        method: 'Dynamic Import',
        workerSrc
      };
    } catch (error: any) {
      throw new Error(`Dynamic import failed: ${error.message}`);
    }
  }

  private async setupWithFallbackScript(): Promise<SetupResult> {
    // آخر محاولة - تحميل من مصدر بديل
    if (typeof window.pdfjsLib === 'undefined') {
      await this.loadScript('https://mozilla.github.io/pdf.js/build/pdf.min.js');
    }

    const workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.min.js';
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

    const testResult = await this.test();
    return {
      success: testResult,
      method: 'Mozilla Fallback',
      workerSrc
    };
  }

  // تحميل script خارجي
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // التحقق من وجود script مسبقاً
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  // إعادة تعيين الحالة
  reset(): void {
    this.setupCompleted = false;
    this.lastSuccessfulMethod = '';
  }

  // الحصول على معلومات الحالة الحالية
  getStatus(): {
    isReady: boolean;
    setupCompleted: boolean;
    lastMethod: string;
    version?: string;
    workerSrc?: string;
  } {
    return {
      isReady: this.isReady(),
      setupCompleted: this.setupCompleted,
      lastMethod: this.lastSuccessfulMethod,
      version: window.pdfjsLib?.version,
      workerSrc: window.pdfjsLib?.GlobalWorkerOptions?.workerSrc
    };
  }
}

// تصدير instance واحد للاستخدام العام
export const pdfJsSetup = PdfJsUltimateSetup.getInstance();