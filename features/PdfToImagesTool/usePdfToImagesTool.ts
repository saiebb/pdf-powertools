
import { useState, useCallback } from 'react';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const usePdfToImagesTool = () => {
  const { displayMessage, areCoreServicesReady } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedImageUrls, setConvertedImageUrls] = useState<Array<{ url: string, name: string }>>([]);

  const handleConvertPdfToImages = useCallback(async (uploadedFile: UploadedFile | undefined) => {
    if (!uploadedFile?.pdfDoc) {
      displayMessage('warning', "الرجاء رفع ملف PDF.");
      return;
    }
    if (!areCoreServicesReady) {
      displayMessage('error', "الخدمات الأساسية (PDF.js) غير جاهزة. يرجى المحاولة مرة أخرى.");
      return;
    }
    if (!window.pdfjsLib) {
      displayMessage('error', "مكتبة PDF.js ضرورية لهذه العملية وغير متاحة حاليًا.");
      return;
    }

    setIsProcessing(true);
    setConvertedImageUrls([]);

    try {
      const pdfDoc = uploadedFile.pdfDoc;
      const pdfData = await pdfDoc.save();
      const pdfJsDoc = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
      const numPages = pdfJsDoc.numPages;
      const urls: Array<{ url: string, name: string }> = [];

      for (let i = 0; i < numPages; i++) {
        const page = await pdfJsDoc.getPage(i + 1);
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          urls.push({
            url: canvas.toDataURL('image/png'),
            name: `${uploadedFile.file.name.replace(/\.pdf$/i, '')}_page_${i + 1}.png`
          });
        }
        page.cleanup(); 
      }

      setConvertedImageUrls(urls);
      if (urls.length > 0) {
        displayMessage('success', `تم تحويل ${urls.length} صفحات إلى صور بنجاح.`);
      } else {
        displayMessage('warning', "لم يتم تحويل أي صفحات.");
      }
    } catch (err: any) {
      console.error("Error converting PDF to images:", err);
      displayMessage('error', `فشل تحويل PDF إلى صور: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [displayMessage, areCoreServicesReady]);

  const clearConvertedImageUrls = useCallback(() => {
    setConvertedImageUrls([]);
  }, []);

  return {
    isProcessing,
    convertedImageUrls,
    handleConvertPdfToImages,
    clearConvertedImageUrls,
  };
};
