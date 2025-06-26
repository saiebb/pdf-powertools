import { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

export const useWordToPdfTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  
  const { displayMessage } = useAppContext();

  const processFiles = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length === 0) {
      displayMessage('warning', 'يرجى رفع ملفات Word أولاً');
      return;
    }

    setIsProcessing(true);
    
    try {
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      
      for (const uploadedFile of uploadedFiles) {
        const file = uploadedFile.file;
        
        // التحقق من نوع الملف
        const isWordFile = file.name.toLowerCase().endsWith('.docx') || 
                          file.name.toLowerCase().endsWith('.doc') ||
                          file.type.includes('word') ||
                          file.type.includes('document');
        
        if (!isWordFile) {
          displayMessage('warning', `الملف ${file.name} ليس ملف Word صالح`);
          continue;
        }

        try {
          // هذا نموذج أولي - في التطبيق الحقيقي نحتاج مكتبة متخصصة
          // مثل mammoth.js لاستخراج النص من Word أو خدمة تحويل خارجية
          
          // إنشاء صفحة جديدة
          const page = pdfDoc.addPage();
          const { width, height } = page.getSize();
          
          // إضافة نص توضيحي (في التطبيق الحقيقي سيكون المحتوى الفعلي)
          page.drawText(`تم تحويل الملف: ${file.name}`, {
            x: 50,
            y: height - 100,
            size: 16,
            color: rgb(0, 0, 0),
          });
          
          page.drawText('ملاحظة: هذا نموذج أولي للتحويل', {
            x: 50,
            y: height - 130,
            size: 12,
            color: rgb(0.5, 0.5, 0.5),
          });
          
          page.drawText('في التطبيق الحقيقي، سيتم استخراج المحتوى الفعلي من ملف Word', {
            x: 50,
            y: height - 150,
            size: 10,
            color: rgb(0.7, 0.7, 0.7),
          });
          
          page.drawText(`حجم الملف: ${(file.size / 1024 / 1024).toFixed(2)} MB`, {
            x: 50,
            y: height - 180,
            size: 10,
            color: rgb(0.7, 0.7, 0.7),
          });
          
          page.drawText(`تاريخ التحويل: ${new Date().toLocaleString('ar-SA')}`, {
            x: 50,
            y: height - 200,
            size: 10,
            color: rgb(0.7, 0.7, 0.7),
          });
          
        } catch (error) {
          console.error(`خطأ في معالجة ملف Word ${file.name}:`, error);
          displayMessage('error', `فشل في معالجة الملف ${file.name}`);
        }
      }

      // التأكد من وجود صفحات في المستند
      if (pdfDoc.getPageCount() === 0) {
        displayMessage('error', 'لم يتم إضافة أي ملفات صالحة إلى PDF');
        return;
      }

      // حفظ PDF
      const pdfBytes = await pdfDoc.save();
      
      // إنشاء رابط التحميل
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setDownloadFileName(`converted-word-${Date.now()}.pdf`);
      
      displayMessage('success', `تم تحويل ${pdfDoc.getPageCount()} ملف Word إلى PDF بنجاح`);
      displayMessage('info', 'هذا نموذج أولي. للحصول على تحويل كامل، يرجى استخدام خدمات التحويل المتخصصة.', 8000);
      
    } catch (error) {
      console.error('خطأ في تحويل ملفات Word إلى PDF:', error);
      displayMessage('error', 'فشل في تحويل ملفات Word إلى PDF. يرجى المحاولة مرة أخرى.');
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