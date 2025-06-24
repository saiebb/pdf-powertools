import { useState, useCallback, useEffect } from 'react';
import { ToolType } from '../components/LeftToolbar';
import { ContextualToolType } from '../components/ContextualToolbar';

interface UIState {
  // Panel visibility
  showThumbnails: boolean;
  showPropertiesPanel: boolean;
  showSearchPanel: boolean;
  showAIAssistant: boolean;
  showNotifications: boolean;
  showUserProfile: boolean;
  showContextualToolbar: boolean;
  showShortcutsHelp: boolean;
  
  // Active states
  activeTool: ToolType;
  contextualToolbarType: ContextualToolType;
  
  // Positions and selections
  contextualToolbarPosition: { x: number; y: number };
  selectedElement: any;
  selectedColor: string;
  
  // View settings
  currentZoom: number;
  displayMode: 'singlePage' | 'continuousScroll';
  
  // Search state
  searchResults: any[];
  currentSearchResultIndex: number;
  
  // Notifications
  notifications: any[];
}

const initialState: UIState = {
  showThumbnails: true,
  showPropertiesPanel: true,
  showSearchPanel: false,
  showAIAssistant: false,
  showNotifications: false,
  showUserProfile: false,
  showContextualToolbar: false,
  showShortcutsHelp: false,
  
  activeTool: 'select',
  contextualToolbarType: 'text',
  
  contextualToolbarPosition: { x: 0, y: 0 },
  selectedElement: null,
  selectedColor: '#000000',
  
  currentZoom: 100,
  displayMode: 'continuousScroll',
  
  searchResults: [],
  currentSearchResultIndex: 0,
  
  notifications: [
    {
      id: '1',
      type: 'success' as const,
      title: 'تم حفظ المستند',
      message: 'تم حفظ التعديلات بنجاح',
      timestamp: new Date(Date.now() - 300000),
      isRead: false
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'ميزة جديدة',
      message: 'تم إضافة مساعد الذكاء الاصطناعي',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true
    }
  ],
};

export const useAdobeUI = () => {
  const [state, setState] = useState<UIState>(initialState);

  // Panel toggles
  const toggleThumbnails = useCallback(() => {
    setState(prev => ({ ...prev, showThumbnails: !prev.showThumbnails }));
  }, []);

  const togglePropertiesPanel = useCallback(() => {
    setState(prev => ({ ...prev, showPropertiesPanel: !prev.showPropertiesPanel }));
  }, []);

  const toggleSearchPanel = useCallback(() => {
    setState(prev => ({ ...prev, showSearchPanel: !prev.showSearchPanel }));
  }, []);

  const toggleAIAssistant = useCallback(() => {
    setState(prev => ({ ...prev, showAIAssistant: !prev.showAIAssistant }));
  }, []);

  const toggleNotifications = useCallback(() => {
    setState(prev => ({ ...prev, showNotifications: !prev.showNotifications }));
  }, []);

  const toggleUserProfile = useCallback(() => {
    setState(prev => ({ ...prev, showUserProfile: !prev.showUserProfile }));
  }, []);

  const toggleShortcutsHelp = useCallback(() => {
    setState(prev => ({ ...prev, showShortcutsHelp: !prev.showShortcutsHelp }));
  }, []);

  // Tool management
  const setActiveTool = useCallback((tool: ToolType) => {
    setState(prev => ({
      ...prev,
      activeTool: tool,
      // Auto-show properties panel for tools that need it
      showPropertiesPanel: tool === 'addText' || tool === 'image' ? true : prev.showPropertiesPanel
    }));
  }, []);

  const setSelectedColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, selectedColor: color }));
  }, []);

  // Contextual toolbar
  const displayContextualToolbar = useCallback((
    type: ContextualToolType,
    position: { x: number; y: number },
    element?: any
  ) => {
    setState(prev => ({
      ...prev,
      showContextualToolbar: true,
      contextualToolbarType: type,
      contextualToolbarPosition: position,
      selectedElement: element || null
    }));
  }, []);

  const hideContextualToolbar = useCallback(() => {
    setState(prev => ({
      ...prev,
      showContextualToolbar: false,
      selectedElement: null
    }));
  }, []);

  // View controls
  const setCurrentZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, currentZoom: zoom }));
  }, []);

  const setDisplayMode = useCallback((mode: 'singlePage' | 'continuousScroll') => {
    setState(prev => ({ ...prev, displayMode: mode }));
  }, []);

  // Search
  const setSearchResults = useCallback((results: any[]) => {
    setState(prev => ({ ...prev, searchResults: results, currentSearchResultIndex: 0 }));
  }, []);

  const setCurrentSearchResultIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentSearchResultIndex: index }));
  }, []);

  // Notifications
  const addNotification = useCallback((notification: Omit<any, 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications]
    }));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);

  // Close all panels (useful for Escape key)
  const closeAllPanels = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSearchPanel: false,
      showAIAssistant: false,
      showNotifications: false,
      showUserProfile: false,
      showContextualToolbar: false,
      showShortcutsHelp: false
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global shortcuts
      if (event.key === 'Escape') {
        closeAllPanels();
        return;
      }

      if (event.key === 'F1') {
        event.preventDefault();
        toggleShortcutsHelp();
        return;
      }

      // Tool shortcuts (only if no input is focused)
      if (document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        switch (event.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'e':
            setActiveTool('edit');
            break;
          case 'c':
            setActiveTool('comment');
            break;
          case 't':
            setActiveTool('addText');
            break;
          case 'd':
            setActiveTool('eraser');
            break;
        }
      }

      // Ctrl/Cmd shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'f':
            event.preventDefault();
            toggleSearchPanel();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, toggleSearchPanel, toggleShortcutsHelp, closeAllPanels]);

  return {
    // State
    ...state,
    
    // Panel toggles
    toggleThumbnails,
    togglePropertiesPanel,
    toggleSearchPanel,
    toggleAIAssistant,
    toggleNotifications,
    toggleUserProfile,
    toggleShortcutsHelp,
    
    // Tool management
    setActiveTool,
    setSelectedColor,
    
    // Contextual toolbar
    displayContextualToolbar,
    hideContextualToolbar,
    
    // View controls
    setCurrentZoom,
    setDisplayMode,
    
    // Search
    setSearchResults,
    setCurrentSearchResultIndex,
    
    // Notifications
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    
    // Utilities
    closeAllPanels,
  };
};