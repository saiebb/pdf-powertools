// PDF.js Status Checker Utility

export interface PdfJsStatus {
  isAvailable: boolean;
  version?: string;
  workerConfigured: boolean;
  error?: string;
}

export function checkPdfJsStatus(): PdfJsStatus {
  try {
    // Check if pdfjsLib is available on window
    if (typeof window === 'undefined') {
      return {
        isAvailable: false,
        workerConfigured: false,
        error: 'Window object not available (SSR environment)'
      };
    }

    if (typeof window.pdfjsLib === 'undefined') {
      return {
        isAvailable: false,
        workerConfigured: false,
        error: 'PDF.js library not loaded'
      };
    }

    // Check if essential properties are available
    const hasGlobalWorkerOptions = typeof window.pdfjsLib.GlobalWorkerOptions !== 'undefined';
    const hasGetDocument = typeof window.pdfjsLib.getDocument === 'function';
    const hasVersion = typeof window.pdfjsLib.version === 'string';

    if (!hasGlobalWorkerOptions || !hasGetDocument || !hasVersion) {
      return {
        isAvailable: false,
        workerConfigured: false,
        error: `PDF.js incomplete - GlobalWorkerOptions: ${hasGlobalWorkerOptions}, getDocument: ${hasGetDocument}, version: ${hasVersion}`
      };
    }

    // Check if worker is configured
    const workerConfigured = typeof window.pdfjsLib.GlobalWorkerOptions.workerSrc === 'string' && 
                             window.pdfjsLib.GlobalWorkerOptions.workerSrc.length > 0;

    return {
      isAvailable: true,
      version: window.pdfjsLib.version,
      workerConfigured,
      error: workerConfigured ? undefined : 'Worker not configured'
    };

  } catch (error) {
    return {
      isAvailable: false,
      workerConfigured: false,
      error: `Error checking PDF.js status: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export function isPdfJsReady(): boolean {
  const status = checkPdfJsStatus();
  return status.isAvailable && status.workerConfigured;
}

export function getPdfJsDebugInfo(): string {
  const status = checkPdfJsStatus();
  
  let info = `PDF.js Status Check:\n`;
  info += `- Available: ${status.isAvailable}\n`;
  info += `- Version: ${status.version || 'N/A'}\n`;
  info += `- Worker Configured: ${status.workerConfigured}\n`;
  
  if (status.error) {
    info += `- Error: ${status.error}\n`;
  }
  
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    info += `- Worker Source: ${window.pdfjsLib.GlobalWorkerOptions?.workerSrc || 'Not set'}\n`;
  }
  
  return info;
}

// Function to wait for PDF.js to be ready
export function waitForPdfJs(timeoutMs: number = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (isPdfJsReady()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeoutMs) {
        const status = checkPdfJsStatus();
        reject(new Error(`PDF.js not ready after ${timeoutMs}ms. Status: ${status.error || 'Unknown'}`));
        return;
      }
      
      setTimeout(check, 100);
    };
    
    check();
  });
}