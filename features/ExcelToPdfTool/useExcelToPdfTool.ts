import { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

export const useExcelToPdfTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  
  const { displayMessage } = useAppContext();

  const processFiles = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length === 0) {
      displayMessage('warning', 'يرجى رفع ملفات Excel أولاً');
      return;
    }

    setIsProcessing(true);
    
    try {
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      
      for (const uploadedFile of uploadedFiles) {
        const file = uploadedFile.file;
        
        // التحقق من نوع الملف
        const isExcelFile = file.name.toLowerCase().endsWith('.xlsx') || 
                           file.name.toLowerCase().endsWith('.xls') ||
                           file.name.toLowerCase().endsWith('.csv') ||
                           file.type.includes('spreadsheet') ||
                           file.type.includes('excel');
        
        if (!isExcelFile) {
          displayMessage('warning', `الملف ${file.name} ليس ملف Excel صالح`);
          continue;
        }

        try {
          // هذا نموذج أولي - في التطبيق الحقيقي نحتاج مكتبة مثل SheetJS
          // لقراءة ملفات Excel واستخراج البيانات
          
          // إنشاء صفحات متعددة لمحاكاة أوراق العمل
          const sheetCount = Math.floor(Math.random() * 5) + 1; // محاكاة عدد أوراق العمل
          
          for (let sheetIndex = 0; sheetIndex < sheetCount; sheetIndex++) {
            const page = pdfDoc.addPage();
            const { height } = page.getSize();
            
            // إضافة عنوان ورقة العمل
            page.drawText(`ورقة العمل ${sheetIndex + 1} من ${file.name}`, {
              x: 50,
              y: height - 60,
              size: 16,
              color: rgb(0, 0, 0),
            });
            
            // إنشاء جدول وهمي
            const startY = height - 100;
            const rowHeight = 25;
            const colWidth = 100;
            
            // رسم رؤوس الأعمدة
            const headers = ['العمود أ', 'العمود ب', 'العمود ج', 'العمود د'];
            headers.forEach((header, colIndex) => {
              page.drawText(header, {
                x: 50 + (colIndex * colWidth),
                y: startY,
                size: 12,
                color: rgb(0, 0, 0),
              });
              
              // رسم خط تحت الرأس
              page.drawLine({
                start: { x: 50 + (colIndex * colWidth), y: startY - 5 },
                end: { x: 50 + (colIndex * colWidth) + 80, y: startY - 5 },
                thickness: 1,
                color: rgb(0.5, 0.5, 0.5),
              });
            });
            
            // إضافة بيانات وهمية
            for (let row = 0; row < 10; row++) {
              const y = startY - ((row + 1) * rowHeight);
              
              headers.forEach((_, colIndex) => {
                const cellData = `بيانات ${row + 1}-${colIndex + 1}`;
                page.drawText(cellData, {
                  x: 50 + (colIndex * colWidth),
                  y: y,
                  size: 10,
                  color: rgb(0.3, 0.3, 0.3),
                });
              });
            }
            
            // إضافة معلومات إضافية
            page.drawText('ملاحظة: هذا نموذج أولي للتحويل', {
              x: 50,
              y: 50,
              size: 8,
              color: rgb(0.6, 0.6, 0.6),
            });
            
            page.drawText(`تاريخ التحويل: ${new Date().toLocaleString('ar-SA')}`, {
              x: 50,
              y: 35,
              size: 8,
              color: rgb(0.6, 0.6, 0.6),
            });
          }
          
        } catch (error) {
          console.error(`خطأ في معالجة ملف Excel ${file.name}:`, error);
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
      setDownloadFileName(`converted-excel-${Date.now()}.pdf`);
      
      displayMessage('success', `تم تحويل ${uploadedFiles.length} ملف Excel إلى PDF بنجاح (${pdfDoc.getPageCount()} صفحة)`);
      displayMessage('info', 'هذا نموذج أولي. للحصول على تحويل كامل للبيانات، يرجى استخدام خدمات التحويل المتخصصة.', 8000);
      
    } catch (error) {
      console.error('خطأ في تحويل ملفات Excel إلى PDF:', error);
      displayMessage('error', 'فشل في تحويل ملفات Excel إلى PDF. يرجى المحاولة مرة أخرى.');
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