
import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

// interface UseCompressPdfToolProps {
//   displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
// }

export const useCompressPdfTool = (/*{ displayMessage }: UseCompressPdfToolProps*/) => {
  const { displayMessage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCompressPdf = async (uploadedFile: UploadedFile | undefined) => {
    if (!uploadedFile?.pdfDoc) {
      displayMessage('warning', "الرجاء رفع ملف PDF أولاً.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = uploadedFile.pdfDoc;
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      
      downloadPdf(pdfBytes, `compressed-${uploadedFile.file.name}`);
      displayMessage('success', "تمت محاولة ضغط الملف. قد يختلف الحجم الفعلي بشكل طفيف.");
    } catch (err: any) {
      console.error("Error compressing PDF:", err);
      displayMessage('error', `فشل ضغط الملف: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleCompressPdf,
  };
};