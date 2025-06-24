// Application Settings Configuration
export const appSettings = {
  // Application Info
  app: {
    name: 'PDF PowerTools',
    version: '2.0.0',
    description: 'أداة تعديل PDF احترافية بتصميم Adobe',
    author: 'PDF PowerTools Team',
    website: 'https://pdf-powertools.com',
    support: 'support@pdf-powertools.com'
  },

  // Default UI Settings
  ui: {
    defaultZoom: 100,
    defaultDisplayMode: 'continuousScroll' as 'singlePage' | 'continuousScroll',
    showThumbnailsByDefault: true,
    showPropertiesPanelByDefault: true,
    enableAnimations: true,
    enableSounds: false,
    language: 'ar',
    theme: 'light' as 'light' | 'dark' | 'auto',
    
    // Panel sizes
    thumbnailPanelWidth: 200,
    propertiesPanelWidth: 320,
    leftToolbarWidth: 60,
    headerHeight: 60,
    footerHeight: 50,
    
    // Auto-save settings
    autoSaveEnabled: true,
    autoSaveInterval: 30000, // 30 seconds
    
    // Performance settings
    maxThumbnailSize: 150,
    enableLazyLoading: true,
    maxUndoSteps: 50,
  },

  // Tool Settings
  tools: {
    defaultTextSize: 14,
    defaultTextColor: '#000000',
    defaultTextFont: 'Arial',
    defaultHighlightColor: '#FFFF00',
    defaultShapeColor: '#FF0000',
    defaultShapeBorderWidth: 2,
    defaultEraserSize: 10,
    
    // Comment settings
    defaultCommentColor: '#FFA500',
    showCommentAuthor: true,
    showCommentTimestamp: true,
    
    // Measurement settings
    defaultMeasurementUnit: 'cm' as 'mm' | 'cm' | 'in' | 'pt',
    measurementPrecision: 2,
  },

  // Export Settings
  export: {
    defaultFormat: 'pdf',
    supportedFormats: ['pdf', 'png', 'jpg', 'svg'],
    defaultQuality: 'high' as 'low' | 'medium' | 'high',
    includeAnnotations: true,
    includeComments: true,
    
    // PDF specific
    pdfVersion: '1.7',
    compressImages: true,
    optimizeForWeb: false,
  },

  // Security Settings
  security: {
    enablePasswordProtection: false,
    enableDigitalSignatures: false,
    allowPrinting: true,
    allowCopying: true,
    allowEditing: true,
    allowAnnotations: true,
  },

  // AI Assistant Settings
  ai: {
    enabled: true,
    provider: 'openai' as 'openai' | 'anthropic' | 'local',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    
    // Features
    enableSummarization: true,
    enableTranslation: true,
    enableGrammarCheck: true,
    enableContentSuggestions: true,
    
    // Privacy
    shareDataForImprovement: false,
    storeConversations: false,
  },

  // Collaboration Settings
  collaboration: {
    enabled: false,
    maxCollaborators: 5,
    allowGuestAccess: false,
    enableRealTimeSync: true,
    enableCommentNotifications: true,
    enableVersionHistory: true,
    maxVersions: 10,
  },

  // Cloud Storage Settings
  cloud: {
    enabled: false,
    provider: 'none' as 'none' | 'google' | 'dropbox' | 'onedrive' | 'aws',
    autoSync: false,
    syncInterval: 300000, // 5 minutes
    maxFileSize: 100 * 1024 * 1024, // 100MB
    enableOfflineMode: true,
  },

  // Accessibility Settings
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    largeText: false,
    screenReaderSupport: true,
    keyboardNavigation: true,
    focusIndicators: true,
    
    // Language and localization
    rightToLeft: true,
    dateFormat: 'dd/mm/yyyy',
    timeFormat: '24h' as '12h' | '24h',
    numberFormat: 'arabic' as 'arabic' | 'western',
  },

  // Performance Settings
  performance: {
    enableWebWorkers: true,
    enableWebAssembly: false,
    maxMemoryUsage: 512 * 1024 * 1024, // 512MB
    enableCaching: true,
    cacheSize: 50 * 1024 * 1024, // 50MB
    
    // Rendering
    enableHardwareAcceleration: true,
    maxCanvasSize: 4096,
    renderQuality: 'high' as 'low' | 'medium' | 'high',
  },

  // Debug Settings (for development)
  debug: {
    enabled: false,
    logLevel: 'warn' as 'error' | 'warn' | 'info' | 'debug',
    showPerformanceMetrics: false,
    enableDevTools: false,
    mockAI: false,
    mockCloud: false,
  },

  // Feature Flags
  features: {
    enableAI: true,
    enableCollaboration: false,
    enableCloudStorage: false,
    enableAdvancedExport: true,
    enableDigitalSignatures: false,
    enableOCR: false,
    enableBatchProcessing: false,
    enableAPIAccess: false,
  },

  // Limits and Quotas
  limits: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxPages: 1000,
    maxAnnotations: 10000,
    maxComments: 1000,
    maxUploadsPerDay: 100,
    maxAIRequestsPerDay: 50,
  },

  // Subscription and Billing
  subscription: {
    plan: 'free' as 'free' | 'basic' | 'pro' | 'enterprise',
    expiryDate: null as Date | null,
    features: [] as string[],
    usage: {
      filesProcessed: 0,
      aiRequestsUsed: 0,
      storageUsed: 0,
    },
    limits: {
      maxFiles: 10,
      maxAIRequests: 10,
      maxStorage: 100 * 1024 * 1024, // 100MB
    }
  }
};

// Helper functions for settings management
export const getSettingValue = (path: string, defaultValue?: any) => {
  const keys = path.split('.');
  let value = appSettings;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as any)[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};

export const updateSetting = (path: string, value: any) => {
  const keys = path.split('.');
  let current = appSettings;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof (current as any)[key] !== 'object') {
      (current as any)[key] = {};
    }
    current = (current as any)[key];
  }
  
  (current as any)[keys[keys.length - 1]] = value;
};

export const resetSettings = () => {
  // Reset to default values
  // This would typically involve reloading from a default configuration
  console.log('Settings reset to defaults');
};

export const exportSettings = () => {
  return JSON.stringify(appSettings, null, 2);
};

export const importSettings = (settingsJson: string) => {
  try {
    const imported = JSON.parse(settingsJson);
    Object.assign(appSettings, imported);
    return true;
  } catch (error) {
    console.error('Failed to import settings:', error);
    return false;
  }
};

export type AppSettings = typeof appSettings;