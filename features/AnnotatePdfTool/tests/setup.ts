// Test setup for PDF annotation tool
// This file provides mock implementations for browser APIs during testing

// Mock for browser APIs
(global as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16);
(global as any).cancelAnimationFrame = () => {};

// Mock for Canvas API
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Array(4) }),
    putImageData: () => {},
    createImageData: () => ({ data: new Array(4) }),
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  } as any);

  HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,test';
}

// Mock for PDF.js
if (typeof window !== 'undefined') {
  (window as any).pdfjsLib = {
    getDocument: () => ({
      promise: Promise.resolve({
        getPage: () => Promise.resolve({
          getViewport: () => ({ width: 100, height: 100 }),
          render: () => ({ promise: Promise.resolve() }),
          cleanup: () => {},
        }),
        destroy: () => {},
      }),
    }),
  };
}

// Mock for Performance API
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 50, // 50MB
      totalJSHeapSize: 1024 * 1024 * 100, // 100MB
      jsHeapSizeLimit: 1024 * 1024 * 2048, // 2GB
    },
  };
}

// Mock for requestIdleCallback
if (typeof requestIdleCallback === 'undefined') {
  (global as any).requestIdleCallback = (cb: IdleRequestCallback) => setTimeout(cb as any, 0);
  (global as any).cancelIdleCallback = () => {};
}

// Mock for URL API
if (typeof URL !== 'undefined') {
  URL.createObjectURL = () => 'blob:test';
  URL.revokeObjectURL = () => {};
}

// Mock for File API
if (typeof File === 'undefined') {
  (global as any).File = class MockFile {
    constructor(
      public chunks: any[],
      public name: string,
      public options: any = {}
    ) {}
    
    get size() { return 1024; }
    get type() { return 'application/pdf'; }
    get lastModified() { return Date.now(); }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(1024));
    }
    
    text() {
      return Promise.resolve('test');
    }
  };
}

// Mock for Blob API
if (typeof Blob === 'undefined') {
  (global as any).Blob = class MockBlob {
    constructor(public chunks: any[], public options: any = {}) {}
    
    get size() { return 1024; }
    get type() { return this.options.type || ''; }
  };
}

// Console cleanup for tests
const originalConsole = { ...console };
(global as any).console = {
  ...console,
  log: () => {},
  warn: () => {},
  error: () => {},
  info: () => {},
};

// Restore console after tests (if using a test framework)
// This would be used if we had a test framework like Jest or Vitest
// For now, we'll just export a cleanup function
export const restoreConsole = () => {
  (global as any).console = originalConsole;
};