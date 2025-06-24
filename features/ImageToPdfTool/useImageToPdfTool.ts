
import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

// interface UseImageToPdfToolProps {
//   displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
// }

export const useImageToPdfTool = (/*{ displayMessage }: UseImageToPdfToolProps*/) => {
  const { displayMessage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageToPdf = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length === 0 || !uploadedFiles.every(f => f.file.type.startsWith('image/'))) {
      displayMessage('warning', "الرجاء رفع ملف صورة واحد على الأقل.");
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await pdfLib.PDFDocument.create();
      for (const uploadedFile of uploadedFiles) {
        if (!uploadedFile.file.type.startsWith('image/')) continue;
        
        const imageBytes = await uploadedFile.file.arrayBuffer();
        let image: pdfLib.PDFImage;

        if (uploadedFile.file.type === 'image/jpeg' || uploadedFile.file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (uploadedFile.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          displayMessage('warning', `تنسيق الصورة غير مدعوم: ${uploadedFile.file.name}`);
          continue;
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      if (pdfDoc.getPageCount() === 0) {
        displayMessage('error', "لم يتم إضافة أي صور صالحة.");
        setIsProcessing(false);
        return;
      }

      const pdfBytes = await pdfDoc.save();
      downloadPdf(pdfBytes, `images-to-pdf-${Date.now()}.pdf`);
      displayMessage('success', "تم تحويل الصور إلى PDF بنجاح!");
    } catch (err: any) {
      console.error("Error converting images to PDF:", err);
      displayMessage('error', `فشل تحويل الصور إلى PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleImageToPdf,
  };
};