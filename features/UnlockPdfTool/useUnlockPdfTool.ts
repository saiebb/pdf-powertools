
import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

// interface UseUnlockPdfToolProps {
//   displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
// }

export const useUnlockPdfTool = (/*{ displayMessage }: UseUnlockPdfToolProps*/) => {
  const { displayMessage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUnlockPdf = async (uploadedFile: UploadedFile | undefined) => {
    if (!uploadedFile?.file) {
      displayMessage('warning', "الرجاء رفع ملف PDF أولاً.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const pdfDoc = uploadedFile.pdfDoc;
      if (!pdfDoc) {
        displayMessage('error', 'فشل تحميل الملف لمحاولة إزالة الحماية. قد يكون الملف تالفًا أو محميًا بشكل غير متوقع.');
        setIsProcessing(false);
        return;
      }

      const pdfBytes = await pdfDoc.save();
      downloadPdf(pdfBytes, `unlocked-${uploadedFile.file.name}`);
      displayMessage('success', "تمت محاولة إزالة حماية الملف. قد لا تزول جميع أنواع الحماية.");
    } catch (err: any) {
      console.error("Error unlocking PDF:", err);
      if (err instanceof pdfLib.EncryptedPDFError || err.message?.toLowerCase().includes('password')) {
        displayMessage('error', "الملف محمي بكلمة مرور مستخدم قوية تمنع الفتح أو التعديل.");
      } else {
        displayMessage('error', `فشل إزالة حماية الملف: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleUnlockPdf,
  };
};