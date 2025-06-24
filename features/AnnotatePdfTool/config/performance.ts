// إعدادات الأداء لأداة تعديل PDF

export const PERFORMANCE_CONFIG = {
  // إعدادات المصغرات
  THUMBNAILS: {
    MAX_PAGES: 20,           // الحد الأقصى للصفحات
    SCALE: 0.15,             // مقياس التصغير
    QUALITY: 0.6,            // جودة JPEG
    CHUNK_SIZE: 3,           // عدد الصفحات في كل مجموعة
    CHUNK_DELAY: 50,         // التأخير بين المجموعات (ms)
    RENDER_TIMEOUT: 3000,    // مهلة التصيير (ms)
  },

  // إعدادات المعاينة
  PREVIEW: {
    SCALE: 1.2,              // مقياس المعاينة
    RENDER_TIMEOUT: 8000,    // مهلة التصيير (ms)
    DEBOUNCE_DELAY: 50,      // تأخير التصيير (ms)
  },

  // إعدادات تحسين الأداء
  OPTIMIZATION: {
    DEBOUNCE_MS: 500,        // تأخير Debounce
    THROTTLE_MS: 200,        // تأخير Throttle
    MAX_CONCURRENT: 2,       // العمليات المتزامنة القصوى
  },

  // إعدادات معالجة الأخطاء
  ERROR_HANDLING: {
    MAX_ERRORS_PER_MINUTE: 10,  // الحد الأقصى للأخطاء في الدقيقة
    ERROR_RESET_TIME: 60000,    // وقت إعادة تعيين العداد (ms)
  },

  // أنماط أخطاء الإضافات المتجاهلة
  IGNORED_ERROR_PATTERNS: [
    'Could not establish connection. Receiving end does not exist',
    'Extension context invalidated',
    'The message port closed before a response was received',
    'chrome-extension://',
    'moz-extension://',
  ],

  // إعدادات المراقبة
  MONITORING: {
    UPDATE_INTERVAL: 1000,   // فترة تحديث المقاييس (ms)
    SHOW_IN_PRODUCTION: false, // إظهار المراقب في الإنتاج
  },
} as const;

// دالة للحصول على الإعدادات حسب حجم الملف
export const getOptimizedConfig = (fileSize: number) => {
  const sizeMB = fileSize / (1024 * 1024);
  
  if (sizeMB > 50) {
    // ملفات كبيرة جداً
    return {
      ...PERFORMANCE_CONFIG,
      THUMBNAILS: {
        ...PERFORMANCE_CONFIG.THUMBNAILS,
        MAX_PAGES: 10,
        SCALE: 0.1,
        CHUNK_SIZE: 2,
        CHUNK_DELAY: 100,
      },
    };
  } else if (sizeMB > 20) {
    // ملفات كبيرة
    return {
      ...PERFORMANCE_CONFIG,
      THUMBNAILS: {
        ...PERFORMANCE_CONFIG.THUMBNAILS,
        MAX_PAGES: 15,
        SCALE: 0.12,
        CHUNK_SIZE: 2,
        CHUNK_DELAY: 75,
      },
    };
  }
  
  // ملفات عادية
  return PERFORMANCE_CONFIG;
};

// دالة للتحقق من قدرات المتصفح
export const getBrowserCapabilities = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  return {
    webGL: !!gl,
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    webWorkers: typeof Worker !== 'undefined',
    memoryInfo: !!(performance as any).memory,
    requestIdleCallback: typeof requestIdleCallback !== 'undefined',
  };
};

// دالة لتحسين الإعدادات حسب قدرات المتصفح
export const getAdaptiveConfig = (fileSize: number) => {
  const baseConfig = getOptimizedConfig(fileSize);
  const capabilities = getBrowserCapabilities();
  
  // تحسينات إضافية حسب قدرات المتصفح
  if (!capabilities.webGL) {
    // تقليل الجودة إذا لم يكن WebGL متاحاً
    baseConfig.THUMBNAILS.QUALITY = 0.4;
    baseConfig.THUMBNAILS.SCALE = 0.1;
  }
  
  if (!capabilities.requestIdleCallback) {
    // زيادة التأخير إذا لم يكن requestIdleCallback متاحاً
    baseConfig.THUMBNAILS.CHUNK_DELAY *= 2;
  }
  
  return baseConfig;
};