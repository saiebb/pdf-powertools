
import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

// interface UseMergeToolProps {
//   displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
// }

export const useMergeTool = (/*{ displayMessage }: UseMergeToolProps*/) => {
  const { displayMessage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMergePdfs = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length < 2 || !uploadedFiles.every(f => f.pdfDoc)) {
      displayMessage('warning', "الرجاء رفع ملفين PDF على الأقل للدمج.");
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await pdfLib.PDFDocument.create();
      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile.pdfDoc) {
          const copiedPages = await mergedPdf.copyPages(uploadedFile.pdfDoc, uploadedFile.pdfDoc.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
      }
      const mergedPdfBytes = await mergedPdf.save();
      downloadPdf(mergedPdfBytes, `merged-${Date.now()}.pdf`);
      displayMessage('success', "تم دمج ملفات PDF بنجاح!");
    } catch (err: any) {
      console.error("Error merging PDFs:", err);
      displayMessage('error', `فشل دمج ملفات PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleMergePdfs,
  };
};