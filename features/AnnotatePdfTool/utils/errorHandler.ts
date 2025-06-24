// معالج الأخطاء المحسن لأداة تعديل PDF
export class AnnotateErrorHandler {
  private static instance: AnnotateErrorHandler;
  private errorCount = 0;
  private lastErrorTime = 0;
  private readonly MAX_ERRORS_PER_MINUTE = 10;
  private readonly ERROR_RESET_TIME = 60000; // دقيقة واحدة

  static getInstance(): AnnotateErrorHandler {
    if (!AnnotateErrorHandler.instance) {
      AnnotateErrorHandler.instance = new AnnotateErrorHandler();
    }
    return AnnotateErrorHandler.instance;
  }

  private constructor() {
    // معالج الأخطاء العام للتطبيق
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // معالج أخطاء JavaScript العامة
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Global Error');
    });

    // معالج أخطاء Promise المرفوضة
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection');
      
      // منع ظهور الخطأ في الكونسول إذا كان خطأ "Receiving end does not exist"
      if (this.isExtensionError(event.reason)) {
        event.preventDefault();
        console.warn('تم تجاهل خطأ إضافة المتصفح:', event.reason?.message);
      }
    });
  }

  private isExtensionError(error: any): boolean {
    if (!error || typeof error.message !== 'string') return false;
    
    const extensionErrorPatterns = [
      'Could not establish connection. Receiving end does not exist',
      'Extension context invalidated',
      'The message port closed before a response was received',
      'chrome-extension://',
      'moz-extension://',
    ];

    return extensionErrorPatterns.some(pattern => 
      error.message.includes(pattern)
    );
  }

  handleError(error: any, context: string = 'Unknown'): boolean {
    const now = Date.now();
    
    // إعادة تعيين العداد إذا مر وقت كافٍ
    if (now - this.lastErrorTime > this.ERROR_RESET_TIME) {
      this.errorCount = 0;
    }

    this.lastErrorTime = now;
    this.errorCount++;

    // تجاهل أخطاء إضافات المتصفح
    if (this.isExtensionError(error)) {
      console.warn(`[${context}] تم تجاهل خطأ إضافة المتصفح:`, error?.message);
      return true; // تم التعامل مع الخطأ
    }

    // تسجيل الأخطاء الأخرى فقط إذا لم نتجاوز الحد الأقصى
    if (this.errorCount <= this.MAX_ERRORS_PER_MINUTE) {
      console.error(`[${context}] خطأ في التطبيق:`, error);
    } else if (this.errorCount === this.MAX_ERRORS_PER_MINUTE + 1) {
      console.warn('تم تجاوز الحد الأقصى للأخطاء في الدقيقة الواحدة. سيتم تجاهل الأخطاء الإضافية.');
    }

    return false; // لم يتم التعامل مع الخطأ
  }

  // دالة لتنظيف الموارد
  cleanup() {
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }
}

// تهيئة معالج الأخطاء
export const errorHandler = AnnotateErrorHandler.getInstance();