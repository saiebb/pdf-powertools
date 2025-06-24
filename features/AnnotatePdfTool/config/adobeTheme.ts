// Adobe Theme Configuration
export const adobeTheme = {
  colors: {
    primary: '#1A82E2',        // Adobe Blue
    secondary: '#ECECEC',      // Light Gray
    background: '#F9F9F9',     // Very Light Gray
    text: '#333333',           // Dark Gray
    textMuted: '#666666',      // Medium Gray
    textLight: '#999999',      // Light Gray
    border: '#D1D1D1',         // Border Gray
    icon: '#555555',           // Icon Gray
    success: '#28A745',        // Green
    warning: '#FFC107',        // Yellow
    error: '#DC3545',          // Red
    info: '#17A2B8',           // Cyan
    aiAssistant: '#7B29FF',    // Purple for AI
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    document: '0 10px 25px rgba(0,0,0,0.15)',
  },
  
  transitions: {
    fast: '0.1s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
  },
  
  zIndex: {
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  
  layout: {
    header: {
      height: '60px',
      background: 'linear-gradient(135deg, #f9f9f9 0%, #ececec 100%)',
    },
    sidebar: {
      width: '60px',
      expandedWidth: '240px',
    },
    thumbnailPanel: {
      width: '200px',
      minWidth: '150px',
      maxWidth: '300px',
    },
    propertiesPanel: {
      width: '320px',
      minWidth: '280px',
      maxWidth: '400px',
    },
    footer: {
      height: '50px',
    },
  },
  
  animations: {
    slideInLeft: 'slideInFromLeft 0.3s ease-out',
    slideInRight: 'slideInFromRight 0.3s ease-out',
    slideInTop: 'slideInFromTop 0.3s ease-out',
    fadeIn: 'fadeIn 0.2s ease-in-out',
    scaleIn: 'scaleIn 0.2s ease-in-out',
  },
  
  toolbar: {
    tools: [
      {
        id: 'select',
        name: 'أداة التحديد',
        shortcut: 'V',
        icon: 'cursor-arrow',
        category: 'basic',
      },
      {
        id: 'edit',
        name: 'تعديل النصوص والصور',
        shortcut: 'E',
        icon: 'edit',
        category: 'edit',
      },
      {
        id: 'comment',
        name: 'إضافة تعليق',
        shortcut: 'C',
        icon: 'message-square',
        category: 'annotation',
        subTools: [
          { id: 'highlight', name: 'تمييز النص', icon: 'highlighter' },
          { id: 'underline', name: 'تسطير النص', icon: 'underline' },
          { id: 'freehand', name: 'رسم حر', icon: 'pencil' },
        ],
      },
      {
        id: 'fillSign',
        name: 'تعبئة وتوقيع',
        shortcut: 'S',
        icon: 'signature',
        category: 'form',
      },
      {
        id: 'shapes',
        name: 'إضافة أشكال',
        shortcut: 'R',
        icon: 'shapes',
        category: 'draw',
      },
      {
        id: 'measure',
        name: 'أداة القياس',
        shortcut: 'M',
        icon: 'ruler',
        category: 'measure',
      },
      {
        id: 'addText',
        name: 'إضافة نص',
        shortcut: 'T',
        icon: 'type',
        category: 'text',
        featured: true,
      },
      {
        id: 'eraser',
        name: 'ممحاة',
        shortcut: 'D',
        icon: 'eraser',
        category: 'edit',
      },
    ],
  },
  
  contextualToolbars: {
    text: {
      tools: ['bold', 'italic', 'underline', 'alignLeft', 'alignCenter', 'alignRight', 'fontSize', 'textColor'],
    },
    image: {
      tools: ['rotate', 'resize', 'opacity', 'border'],
    },
    shape: {
      tools: ['fillColor', 'borderColor', 'borderWidth', 'opacity'],
    },
    comment: {
      tools: ['reply', 'resolve', 'edit', 'delete'],
    },
  },
  
  shortcuts: {
    global: {
      'Ctrl+S': 'save',
      'Ctrl+Z': 'undo',
      'Ctrl+Y': 'redo',
      'Ctrl+F': 'search',
      'Escape': 'closePanel',
    },
    tools: {
      'V': 'select',
      'E': 'edit',
      'C': 'comment',
      'S': 'fillSign',
      'R': 'shapes',
      'M': 'measure',
      'T': 'addText',
      'D': 'eraser',
    },
  },
};

export type AdobeTheme = typeof adobeTheme;