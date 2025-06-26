import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

export const useJpgToPdfTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  
  const { displayMessage } = useAppContext();

  const processFiles = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length === 0) {
      displayMessage('warning', 'يرجى رفع صور أولاً');
      return;
    }

    setIsProcessing(true);
    
    try {
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      
      for (const uploadedFile of uploadedFiles) {
        const file = uploadedFile.file;
        
        // التأكد من أن الملف صورة
        if (!file.type.startsWith('image/')) {
          displayMessage('warning', `الملف ${file.name} ليس صورة صالحة`);
          continue;
        }

        try {
          // قراءة الصورة
          const imageBytes = await file.arrayBuffer();
          
          let image;
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes);
          } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            displayMessage('warning', `نوع الصورة ${file.type} غير مدعوم للملف ${file.name}`);
            continue;
          }

          // إنشاء صفحة جديدة بحجم الصورة
          const page = pdfDoc.addPage([image.width, image.height]);
          
          // إضافة الصورة إلى الصفحة
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
          
        } catch (error) {
          console.error(`خطأ في معالجة الصورة ${file.name}:`, error);
          displayMessage('error', `فشل في معالجة الصورة ${file.name}`);
        }
      }

      // التأكد من وجود صفحات في المستند
      if (pdfDoc.getPageCount() === 0) {
        displayMessage('error', 'لم يتم إضافة أي صور صالحة إلى PDF');
        return;
      }

      // حفظ PDF
      const pdfBytes = await pdfDoc.save();
      
      // إنشاء رابط التحميل
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setDownloadFileName(`converted-images-${Date.now()}.pdf`);
      
      displayMessage('success', `تم تحويل ${pdfDoc.getPageCount()} صورة إلى PDF بنجاح`);
      
    } catch (error) {
      console.error('خطأ في تحويل الصور إلى PDF:', error);
      displayMessage('error', 'فشل في تحويل الصور إلى PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResults = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
    setDownloadFileName(null);
  };

  return {
    isProcessing,
    processFiles,
    downloadUrl,
    downloadFileName,
    clearResults
  };
};