import { checkPdfJsStatus, isPdfJsReady, getPdfJsDebugInfo } from './pdfJsChecker';
import { setupLocalPdfjs } from './pdfjs-local-setup';
import { setupFallbackPdfjs } from './pdfjs-fallback-setup';
import { setupPdfJsWorkerWithFallback, quickFixPdfJsWorker } from './pdfjs-worker-fix';
import { pdfJsSetup } from './pdfjs-ultimate-setup';
import { forceFixPdfJsWorker, quickWorkerFix } from './pdfjs-force-fix';

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

// PDF.js URLs - matches the version in package.json (5.3.31)
const PDF_JS_URL = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.min.mjs';
const PDF_WORKER_URL = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';

// Track if we've already attempted to load PDF.js
let pdfJsLoadAttempted = false;
let pdfJsSetupCompleted = false;
let setupPromise: Promise<void> | null = null;

// Function to dynamically load PDF.js if not available
function loadPdfJsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${PDF_JS_URL}"]`) || 
                          document.querySelector(`script[src*="pdf.min.mjs"]`) ||
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
    script.type = 'module'; // Support for ES modules
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
      
      // Try ultimate setup first (comprehensive approach)
      console.log('setupPdfJsWorker: Attempting ultimate PDF.js setup...');
      const ultimateResult = await pdfJsSetup.setup();
      
      if (ultimateResult.success && isPdfJsReady()) {
        console.log(`setupPdfJsWorker: Ultimate setup successful with method: ${ultimateResult.method}`);
        pdfJsSetupCompleted = true;
        return;
      }
      
      console.log('setupPdfJsWorker: Ultimate setup failed, trying local setup...');
      
      // Try local setup as fallback
      const localSetupSuccess = await setupLocalPdfjs();
      
      if (localSetupSuccess && isPdfJsReady()) {
        console.log('setupPdfJsWorker: Local PDF.js setup successful!');
        pdfJsSetupCompleted = true;
        return;
      }
      
      console.log('setupPdfJsWorker: Local setup failed, trying worker fix...');
      
      // Try the comprehensive worker fix
      const workerFixSuccess = await setupPdfJsWorkerWithFallback();
      
      if (workerFixSuccess && isPdfJsReady()) {
        console.log('setupPdfJsWorker: Worker fix successful!');
        pdfJsSetupCompleted = true;
        return;
      }
      
      console.log('setupPdfJsWorker: Worker fix failed, trying fallback setup...');
      
      // Try fallback setup
      const fallbackSetupSuccess = await setupFallbackPdfjs();
      
      if (fallbackSetupSuccess && isPdfJsReady()) {
        console.log('setupPdfJsWorker: Fallback PDF.js setup successful!');
        pdfJsSetupCompleted = true;
        return;
      }
      
      console.log('setupPdfJsWorker: Fallback setup failed, trying dynamic loading...');
      
      // Check if PDF.js is loaded but worker not configured
      const status = checkPdfJsStatus();
      if (status.isAvailable && !status.workerConfigured) {
        console.log('setupPdfJsWorker: PDF.js loaded but worker not configured, applying quick fix...');
        quickFixPdfJsWorker();
        
        // Test if the quick fix worked
        if (isPdfJsReady()) {
          console.log('setupPdfJsWorker: Quick fix successful!');
          pdfJsSetupCompleted = true;
          return;
        }
        
        // If quick fix didn't work, try the original approach
        console.log('setupPdfJsWorker: Quick fix failed, trying original worker URL...');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
        console.log(`PDF.js worker path set to: ${PDF_WORKER_URL}`);
        pdfJsSetupCompleted = true;
        return;
      }

      // If PDF.js is not available, try to load it dynamically
      console.log('setupPdfJsWorker: PDF.js not ready, attempting dynamic loading...');
      await loadPdfJsScript();
      
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now check again with polling
      return new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 10; // Reduced from 15 to 10 (5 seconds total)

        const checkAndSetup = async () => {
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
            try {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
              console.log(`PDF.js worker path set to: ${PDF_WORKER_URL}`);
              pdfJsSetupCompleted = true;
              resolve();
              return;
            } catch (workerError) {
              console.error('Error setting PDF.js worker:', workerError);
              // Continue to next attempt instead of failing immediately
            }
          }

          if (attempts >= maxAttempts) {
            // Last resort: Try force fix before giving up
            console.log('setupPdfJsWorker: Max attempts reached, trying force fix as last resort...');
            try {
              const forceFixSuccess = await forceFixPdfJsWorker();
              if (forceFixSuccess && isPdfJsReady()) {
                console.log('setupPdfJsWorker: Force fix successful!');
                pdfJsSetupCompleted = true;
                resolve();
                return;
              }
            } catch (forceFixError) {
              console.error('setupPdfJsWorker: Force fix also failed:', forceFixError);
            }
            
            const errorMsg = "PDF.js library not available from CDN after multiple attempts. This might be due to network issues or CDN problems.";
            console.error(errorMsg);
            displayAppMessage('error', 'فشل تحميل مكتبة PDF.js. يرجى التحقق من اتصال الإنترنت وإعادة تحميل الصفحة.', 10000);
            // Instead of rejecting, resolve with a warning to prevent hanging
            console.warn('Resolving PDF.js setup with failure to prevent app hanging');
            pdfJsSetupCompleted = false; // Mark as failed but don't block the app
            resolve(); // Resolve instead of reject
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

