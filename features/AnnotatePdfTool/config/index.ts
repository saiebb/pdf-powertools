// Import for internal use
import { adobeTheme } from './adobeTheme';
import { shortcuts } from './shortcuts';
import { appSettings } from './settings';

// Configuration exports
export { adobeTheme, type AdobeTheme } from './adobeTheme';
export { 
  shortcuts, 
  shortcutCategories, 
  getShortcutDescription, 
  getShortcutsByCategory, 
  formatShortcutKey 
} from './shortcuts';
export { 
  appSettings, 
  getSettingValue, 
  updateSetting, 
  resetSettings, 
  exportSettings, 
  importSettings,
  type AppSettings 
} from './settings';

// Combined configuration object
export const config = {
  theme: adobeTheme,
  shortcuts,
  settings: appSettings,
};

export type Config = typeof config;