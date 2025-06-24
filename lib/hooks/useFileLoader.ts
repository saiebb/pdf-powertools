
import { useState, useCallback } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile, Tool, ToolId } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

// Props are no longer needed as context is used
// interface UseFileLoaderProps {
//   displayMessage: AppDisplayMessageFn;
//   setAppIsLoading: (isLoading: boolean) => void;
// }

interface UseFileLoaderReturn {
  loadedFiles: UploadedFile[];
  processAndStoreFiles: (rawFiles: File[], currentTool: Tool) => Promise<void>;
  clearStoredFiles: () => void;
}

export const useFileLoader = (): UseFileLoaderReturn => {
  const { displayMessage, setGlobalLoading } = useAppContext();
  const [loadedFiles, setLoadedFiles] = useState<UploadedFile[]>([]);

  const processAndStoreFiles = useCallback(async (rawFiles: File[], currentTool: Tool) => {
    if (!currentTool) {
      displayMessage('error', 'الأداة الحالية غير محددة.');
      return;
    }

    if (!currentTool.acceptMultipleFiles && rawFiles.length > 1) {
      displayMessage('error', `أداة "${currentTool.name}" تقبل ملفًا واحدًا فقط.`);
      setLoadedFiles([]); 
      return;
    }
    if (rawFiles.length === 0) {
      setLoadedFiles([]);
      return;
    }

    setGlobalLoading(true);
    let processedFiles: UploadedFile[] = [];
    try {
      processedFiles = await Promise.all(
        rawFiles.map(async (file, index) => {
          const fileId = `${file.name}-${index}-${Date.now()}`;
          const acceptedTypes = currentTool.acceptMimeType.split(',');
          if (!acceptedTypes.includes(file.type) && !acceptedTypes.includes("*/*") && !acceptedTypes.includes("image/*") && !acceptedTypes.includes("application/pdf")) {
            if (currentTool.acceptMimeType !== "*" && !file.type.startsWith(currentTool.acceptMimeType.replace(/\/\*$/, ''))) {
                 throw new Error(`نوع الملف غير مدعوم للأداة الحالية: ${file.type} لملف ${file.name}. المتوقع: ${currentTool.acceptMimeType}`);
            }
          }

          if (currentTool.id === ToolId.IMAGE_TO_PDF && file.type.startsWith('image/')) {
            return { id: fileId, file, imagePreviewUrl: URL.createObjectURL(file) };
          } else if (file.type === "application/pdf") {
            const arrayBuffer = await file.arrayBuffer();
            let pdfDoc;
            try {
              pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer, { 
                ignoreEncryption: currentTool.id === ToolId.UNLOCK_PDF || currentTool.id === ToolId.ANNOTATE_PDF || currentTool.id === ToolId.ORGANIZE || currentTool.id === ToolId.EXTRACT_PAGES || currentTool.id === ToolId.SPLIT_PDF || currentTool.id === ToolId.PDF_TO_IMAGES || currentTool.id === ToolId.PDF_TO_TEXT || currentTool.id === ToolId.COMPRESS_PDF
              });
            } catch (loadErr: any) {
              console.error(`Error loading PDF document ${file.name}:`, loadErr);
              if (loadErr.message?.toLowerCase().includes('password') && (currentTool.id !== ToolId.UNLOCK_PDF && currentTool.id !== ToolId.ANNOTATE_PDF)) {
                 throw new Error(`الملف ${file.name} محمي بكلمة مرور. أداة "${currentTool.name}" لا يمكنها التعامل مع الملفات المحمية. جرب أداة فك الحماية أولاً.`);
              }
              throw new Error(`فشل تحميل ملف PDF (${file.name}): ${loadErr.message}. قد يكون الملف تالفًا أو محميًا بشكل غير متوقع.`);
            }
            return { id: fileId, file, pdfDoc };
          }
          if (currentTool.acceptMimeType === "*") {
             return { id: fileId, file };
          }
          throw new Error(`نوع ملف غير مدعوم (${file.type}) للأداة "${currentTool.name}".`);
        })
      );
      setLoadedFiles(processedFiles);
      displayMessage('success', `تم رفع ${processedFiles.length} ملف(ات) بنجاح.`);
    } catch (err: any) {
      console.error("Error processing uploaded file(s):", err);
      let errMsg = err.message || 'فشل تحميل الملفات.';
      displayMessage('error', errMsg);
      setLoadedFiles([]); 
    } finally {
      setGlobalLoading(false);
    }
  }, [displayMessage, setGlobalLoading]);

  const clearStoredFiles = useCallback(() => {
    setLoadedFiles([]);
    loadedFiles.forEach(f => {
      if (f.imagePreviewUrl) URL.revokeObjectURL(f.imagePreviewUrl);
    });
  }, [loadedFiles]);

  return {
    loadedFiles,
    processAndStoreFiles,
    clearStoredFiles,
  };
};