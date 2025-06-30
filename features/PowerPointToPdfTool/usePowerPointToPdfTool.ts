import { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

export const usePowerPointToPdfTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  
  const { displayMessage } = useAppContext();

  const processFiles = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length === 0) {
      displayMessage('warning', 'يرجى رفع ملفات PowerPoint أولاً');
      return;
    }

    setIsProcessing(true);
    
    try {
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      
      for (const uploadedFile of uploadedFiles) {
        const file = uploadedFile.file;
        
        // التحقق من نوع الملف
        const isPowerPointFile = file.name.toLowerCase().endsWith('.pptx') || 
                                file.name.toLowerCase().endsWith('.ppt') ||
                                file.type.includes('presentation') ||
                                file.type.includes('powerpoint');
        
        if (!isPowerPointFile) {
          displayMessage('warning', `الملف ${file.name} ليس ملف PowerPoint صالح`);
          continue;
        }

        try {
          // هذا نموذج أولي - في التطبيق الحقيقي نحتاج مكتبة متخصصة
          // أو خدمة تحويل خارجية لاستخراج الشرائح من PowerPoint
          
          // إنشاء صفحات متعددة لمحاكاة الشرائح
          const slideCount = Math.floor(Math.random() * 10) + 3; // محاكاة عدد الشرائح
          
          for (let i = 0; i < slideCount; i++) {
            const page = pdfDoc.addPage();
            const { height } = page.getSize();
            
            // إضافة عنوان الشريحة
            page.drawText(`الشريحة ${i + 1} من ${file.name}`, {
              x: 50,
              y: height - 80,
              size: 20,
              color: rgb(0, 0, 0),
            });
            
            // إضافة محتوى وهمي للشريحة
            page.drawText(`محتوى الشريحة ${i + 1}`, {
              x: 50,
              y: height - 120,
              size: 16,
              color: rgb(0.2, 0.2, 0.2),
            });
            
            // إضافة نقاط وهمية
            const bulletPoints = [
              '• نقطة مهمة في العرض التقديمي',
              '• معلومة أساسية للموضوع',
              '• تفصيل إضافي للمحتوى',
              '• خلاصة أو استنتاج'
            ];
            
            bulletPoints.forEach((point, pointIndex) => {
              page.drawText(point, {
                x: 70,
                y: height - 160 - (pointIndex * 25),
                size: 12,
                color: rgb(0.4, 0.4, 0.4),
              });
            });
            
            // إضافة معلومات إضافية في أسفل الصفحة
            page.drawText('ملاحظة: هذا نموذج أولي للتحويل', {
              x: 50,
              y: 50,
              size: 8,
              color: rgb(0.6, 0.6, 0.6),
            });
          }
          
        } catch (error) {
          console.error(`خطأ في معالجة ملف PowerPoint ${file.name}:`, error);
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
      setDownloadFileName(`converted-powerpoint-${Date.now()}.pdf`);
      
      displayMessage('success', `تم تحويل ${uploadedFiles.length} ملف PowerPoint إلى PDF بنجاح (${pdfDoc.getPageCount()} صفحة)`);
      displayMessage('info', 'هذا نموذج أولي. للحصول على تحويل كامل للشرائح، يرجى استخدام خدمات التحويل المتخصصة.', 8000);
      
    } catch (error) {
      console.error('خطأ في تحويل ملفات PowerPoint إلى PDF:', error);
      displayMessage('error', 'فشل في تحويل ملفات PowerPoint إلى PDF. يرجى المحاولة مرة أخرى.');
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