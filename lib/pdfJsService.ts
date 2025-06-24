import { checkPdfJsStatus, isPdfJsReady, getPdfJsDebugInfo } from './pdfJsChecker';

// Declare pdfjsLib on the window object for TypeScript
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

type DisplayMessageFn = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
let displayAppMessage: DisplayMessageFn = () => {}; // No-op default

export function setDisplayAppMessageFn(fn: DisplayMessageFn) {
  displayAppMessage = fn;
}

// PDF.js URLs - matches the version loaded in HTML
const PDF_JS_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
const PDF_WORKER_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

// Track if we've already attempted to load PDF.js
let pdfJsLoadAttempted = false;
let pdfJsSetupCompleted = false;
let setupPromise: Promise<void> | null = null;

// Function to dynamically load PDF.js if not available
function loadPdfJsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${PDF_JS_URL}"]`) || 
                          document.querySelector(`script[src*="pdf.min.js"]`);
    if (existingScript) {
      console.log('PDF.js script already exists in DOM');
      resolve();
      return;
    }

    // Check if we've already attempted to load
    if (pdfJsLoadAttempted) {
      console.log('PDF.js load already attempted, waiting for existing process...');
      // Wait a bit and resolve (the existing load process should handle it)
      setTimeout(() => resolve(), 1000);
      return;
    }

    pdfJsLoadAttempted = true;
    console.log('Loading PDF.js script dynamically...');
    
    const script = document.createElement('script');
    script.src = PDF_JS_URL;
    script.onload = () => {
      console.log('PDF.js script loaded successfully');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Failed to load PDF.js script:', error);
      pdfJsLoadAttempted = false; // Reset flag on error to allow retry
      reject(new Error('Failed to load PDF.js script'));
    };
    
    document.head.appendChild(script);
  });
}

export function setupPdfJsWorker(): Promise<void> {
  console.log('setupPdfJsWorker: Called');
  console.log(getPdfJsDebugInfo());
  
  // If there's already a setup in progress, return that promise
  if (setupPromise) {
    console.log('setupPdfJsWorker: Setup already in progress, returning existing promise');
    return setupPromise;
  }
  
  // Check if setup is already completed
  if (pdfJsSetupCompleted && isPdfJsReady()) {
    console.log('setupPdfJsWorker: PDF.js setup already completed and ready!');
    return Promise.resolve();
  }
  
  // Create and store the setup promise
  setupPromise = (async () => {
    try {
      console.log('setupPdfJsWorker: Starting setup process...');
      
      // First, check if PDF.js is already available and ready
      if (isPdfJsReady()) {
        console.log('setupPdfJsWorker: PDF.js is already ready!');
        console.log('PDF.js version:', window.pdfjsLib.version);
        pdfJsSetupCompleted = true;
        return;
      }
      
      // Check if PDF.js is loaded but worker not configured
      const status = checkPdfJsStatus();
      if (status.isAvailable && !status.workerConfigured) {
        console.log('setupPdfJsWorker: PDF.js loaded but worker not configured, setting up worker...');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
        console.log(`PDF.js worker path set to: ${PDF_WORKER_URL}`);
        pdfJsSetupCompleted = true;
        return;
      }

      // If PDF.js is not available, try to load it dynamically
      console.log('setupPdfJsWorker: PDF.js not ready, attempting to load...');
      await loadPdfJsScript();
      
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now check again with polling
      return new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 15; // 15 * 500ms = 7.5 seconds total

        const checkAndSetup = () => {
          attempts++;
          
          console.log(`setupPdfJsWorker: Polling attempt ${attempts}/${maxAttempts}`);
          console.log(getPdfJsDebugInfo());
          
          // Check if PDF.js is ready
          if (isPdfJsReady()) {
            console.log('setupPdfJsWorker: PDF.js is ready!');
            console.log('PDF.js version:', window.pdfjsLib.version);
            pdfJsSetupCompleted = true;
            resolve();
            return;
          }
          
          // Check if PDF.js is loaded but worker not configured
          const status = checkPdfJsStatus();
          if (status.isAvailable && !status.workerConfigured) {
            console.log('setupPdfJsWorker: PDF.js loaded, configuring worker...');
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
            console.log(`PDF.js worker path set to: ${PDF_WORKER_URL}`);
            pdfJsSetupCompleted = true;
            resolve();
            return;
          }

          if (attempts >= maxAttempts) {
            const errorMsg = "PDF.js library not available from CDN after multiple attempts. This might be due to network issues or CDN problems.";
            console.error(errorMsg);
            displayAppMessage('error', 'فشل تحميل مكتبة PDF.js. يرجى التحقق من اتصال الإنترنت وإعادة تحميل الصفحة.', 10000);
            reject(new Error(errorMsg));
            return;
          }

          setTimeout(checkAndSetup, 500); // Check every 500ms
        };

        checkAndSetup();
      });
      
    } catch (error) {
      console.error('setupPdfJsWorker: Failed to setup PDF.js:', error);
      displayAppMessage('error', 'فشل تحميل مكتبة PDF.js. يرجى التحقق من اتصال الإنترنت وإعادة تحميل الصفحة.', 10000);
      throw error;
    } finally {
      // Clear the setup promise when done (success or failure)
      setupPromise = null;
    }
  })();
  
  return setupPromise;
}

// Function to reset PDF.js setup state (for debugging/recovery)
export function resetPdfJsSetup(): void {
  console.log('resetPdfJsSetup: Resetting PDF.js setup state');
  pdfJsLoadAttempted = false;
  pdfJsSetupCompleted = false;
  setupPromise = null;
}

// Function to check PDF.js status
export function getPdfJsStatus(): { loaded: boolean; setupCompleted: boolean; version?: string } {
  return {
    loaded: typeof window.pdfjsLib !== 'undefined',
    setupCompleted: pdfJsSetupCompleted,
    version: window.pdfjsLib?.version
  };
}

