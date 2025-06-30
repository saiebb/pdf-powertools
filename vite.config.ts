import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      preview: {
        allowedHosts: ['pdf-powertools.onrender.com']
      },
      // إضافة دعم أفضل لـ PDF.js
      optimizeDeps: {
        include: ['pdfjs-dist'],
        exclude: ['pdfjs-dist/build/pdf.worker.min.mjs']
      },
      worker: {
        format: 'es'
      },
      build: {
        rollupOptions: {
          output: {
            // تحسين تقسيم الكود
            manualChunks: {
              'pdfjs': ['pdfjs-dist'],
              'pdf-lib': ['pdf-lib']
            }
          }
        },
        // إضافة دعم للـ workers
        target: 'esnext'
      },
      // إعدادات إضافية لدعم PDF.js
      assetsInclude: ['**/*.worker.js', '**/*.worker.mjs']
    };
});
