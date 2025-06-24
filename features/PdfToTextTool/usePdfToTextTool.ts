
import { useState } from 'react';
import { UploadedFile } from '../../types';
import { downloadFile } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const usePdfToTextTool = () => {
  const { displayMessage, areCoreServicesReady } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const handleConvertToText = async (uploadedFile: UploadedFile | undefined) => {
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
    setExtractedText(null);
    try {
      const pdfDoc = uploadedFile.pdfDoc;
      const pdfData = await pdfDoc.save();
      const pdfJsDoc = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
      const numPages = pdfJsDoc.numPages;
      let fullText = "";
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\\n\\n"; 
        page.cleanup(); 
      }
      setExtractedText(fullText.trim());
      displayMessage('success', "تم استخراج النص بنجاح.");
    } catch (err: any) {
      console.error("Error converting PDF to text:", err);
      displayMessage('error', `فشل استخراج النص: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadExtractedText = (originalFileName?: string) => {
    if (!extractedText) {
      displayMessage('warning', "لا يوجد نص مستخرج لتنزيله.");
      return;
    }
    const fileName = originalFileName?.replace(/\.[^/.]+$/, ".txt") || `extracted_text-${Date.now()}.txt`;
    downloadFile(new TextEncoder().encode(extractedText), fileName, 'text/plain;charset=utf-8');
    displayMessage('info', "بدء تنزيل الملف النصي.");
  };
  
  const clearExtractedText = () => {
    setExtractedText(null);
  };

  return {
    isProcessing,
    extractedText,
    handleConvertToText,
    downloadExtractedText,
    clearExtractedText,
  };
};
