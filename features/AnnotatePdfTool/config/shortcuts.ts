// Keyboard Shortcuts Configuration
export const shortcuts = {
  // Global shortcuts
  global: {
    'Escape': {
      action: 'closeAllPanels',
      description: 'إغلاق جميع اللوحات المفتوحة',
      category: 'navigation'
    },
    'Ctrl+S': {
      action: 'save',
      description: 'حفظ المستند',
      category: 'file'
    },
    'Ctrl+Z': {
      action: 'undo',
      description: 'تراجع',
      category: 'edit'
    },
    'Ctrl+Y': {
      action: 'redo',
      description: 'إعادة',
      category: 'edit'
    },
    'Ctrl+F': {
      action: 'search',
      description: 'البحث في المستند',
      category: 'navigation'
    },
    'Ctrl+P': {
      action: 'print',
      description: 'طباعة',
      category: 'file'
    },
    'F11': {
      action: 'fullscreen',
      description: 'ملء الشاشة',
      category: 'view'
    },
    'F1': {
      action: 'help',
      description: 'عرض المساعدة والاختصارات',
      category: 'help'
    }
  },

  // Tool shortcuts
  tools: {
    'V': {
      action: 'selectTool',
      tool: 'select',
      description: 'أداة التحديد',
      category: 'tools'
    },
    'E': {
      action: 'editTool',
      tool: 'edit',
      description: 'تعديل النصوص والصور',
      category: 'tools'
    },
    'C': {
      action: 'commentTool',
      tool: 'comment',
      description: 'إضافة تعليق',
      category: 'tools'
    },
    'T': {
      action: 'addTextTool',
      tool: 'addText',
      description: 'إضافة نص',
      category: 'tools'
    },
    'S': {
      action: 'fillSignTool',
      tool: 'fillSign',
      description: 'تعبئة وتوقيع',
      category: 'tools'
    },
    'R': {
      action: 'shapesTool',
      tool: 'shapes',
      description: 'إضافة أشكال',
      category: 'tools'
    },
    'M': {
      action: 'measureTool',
      tool: 'measure',
      description: 'أداة القياس',
      category: 'tools'
    },
    'D': {
      action: 'eraserTool',
      tool: 'eraser',
      description: 'ممحاة',
      category: 'tools'
    }
  },

  // Navigation shortcuts
  navigation: {
    'PageUp': {
      action: 'previousPage',
      description: 'الصفحة السابقة',
      category: 'navigation'
    },
    'PageDown': {
      action: 'nextPage',
      description: 'الصفحة التالية',
      category: 'navigation'
    },
    'Home': {
      action: 'firstPage',
      description: 'الصفحة الأولى',
      category: 'navigation'
    },
    'End': {
      action: 'lastPage',
      description: 'الصفحة الأخيرة',
      category: 'navigation'
    },
    'Ctrl+Plus': {
      action: 'zoomIn',
      description: 'تكبير',
      category: 'view'
    },
    'Ctrl+Minus': {
      action: 'zoomOut',
      description: 'تصغير',
      category: 'view'
    },
    'Ctrl+0': {
      action: 'zoomFit',
      description: 'ملائمة الصفحة',
      category: 'view'
    }
  },

  // Panel shortcuts
  panels: {
    'Ctrl+1': {
      action: 'toggleThumbnails',
      description: 'إظهار/إخفاء المصغرات',
      category: 'panels'
    },
    'Ctrl+2': {
      action: 'toggleProperties',
      description: 'إظهار/إخفاء لوحة الخصائص',
      category: 'panels'
    },
    'Ctrl+3': {
      action: 'toggleSearch',
      description: 'إظهار/إخفاء البحث',
      category: 'panels'
    },
    'Ctrl+4': {
      action: 'toggleAI',
      description: 'إظهار/إخفاء مساعد AI',
      category: 'panels'
    }
  },

  // Text editing shortcuts (when text tool is active)
  textEditing: {
    'Ctrl+B': {
      action: 'bold',
      description: 'عريض',
      category: 'formatting'
    },
    'Ctrl+I': {
      action: 'italic',
      description: 'مائل',
      category: 'formatting'
    },
    'Ctrl+U': {
      action: 'underline',
      description: 'تسطير',
      category: 'formatting'
    },
    'Ctrl+L': {
      action: 'alignLeft',
      description: 'محاذاة لليسار',
      category: 'formatting'
    },
    'Ctrl+E': {
      action: 'alignCenter',
      description: 'محاذاة للوسط',
      category: 'formatting'
    },
    'Ctrl+R': {
      action: 'alignRight',
      description: 'محاذاة لليمين',
      category: 'formatting'
    }
  }
};

// Helper function to get shortcut description
export const getShortcutDescription = (key: string): string => {
  // Search in all shortcut categories
  const allShortcuts: Record<string, { action: string; description: string; category: string; tool?: string }> = {
    ...shortcuts.global,
    ...shortcuts.tools,
    ...shortcuts.navigation,
    ...shortcuts.panels,
    ...shortcuts.textEditing
  };

  return allShortcuts[key]?.description || '';
};

// Helper function to get shortcuts by category
export const getShortcutsByCategory = (category: string) => {
  const result: Record<string, any> = {};
  
  Object.entries(shortcuts).forEach(([, section]) => {
    Object.entries(section).forEach(([key, shortcut]) => {
      if (shortcut.category === category) {
        result[key] = shortcut;
      }
    });
  });
  
  return result;
};

// Helper function to format shortcut key for display
export const formatShortcutKey = (key: string): string => {
  return key
    .replace('Ctrl+', 'Ctrl + ')
    .replace('Alt+', 'Alt + ')
    .replace('Shift+', 'Shift + ')
    .replace('Plus', '+')
    .replace('Minus', '-');
};

// Categories for organizing shortcuts in help
export const shortcutCategories = {
  file: 'ملف',
  edit: 'تعديل',
  view: 'عرض',
  navigation: 'تنقل',
  tools: 'أدوات',
  panels: 'لوحات',
  formatting: 'تنسيق',
  help: 'مساعدة'
};