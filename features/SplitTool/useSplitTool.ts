
import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

// interface UseSplitToolProps {
//   displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
// }

export const useSplitTool = (/*{ displayMessage }: UseSplitToolProps*/) => {
  const { displayMessage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSplitPdf = async (uploadedFile: UploadedFile | undefined) => {
    if (!uploadedFile?.pdfDoc) {
      displayMessage('warning', "الرجاء رفع ملف PDF أولاً.");
      return;
    }

    setIsProcessing(true);
    try {
      const sourcePdfDoc = uploadedFile.pdfDoc;
      const pageCount = sourcePdfDoc.getPageCount();

      if (pageCount <= 1) {
        displayMessage('info', "الملف يحتوي على صفحة واحدة فقط، لا يمكن تقسيمه.");
        setIsProcessing(false);
        return;
      }

      for (let i = 0; i < pageCount; i++) {
        const newPdfDoc = await pdfLib.PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
        const pdfBytes = await newPdfDoc.save();
        downloadPdf(pdfBytes, `${uploadedFile.file.name.replace(/\.pdf$/i, '')}_page_${i + 1}.pdf`);
      }
      displayMessage('success', `تم تقسيم الملف إلى ${pageCount} ملفات.`);
    } catch (err: any) {
      console.error("Error splitting PDF:", err);
      displayMessage('error', `فشل تقسيم الملف: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleSplitPdf,
  };
};