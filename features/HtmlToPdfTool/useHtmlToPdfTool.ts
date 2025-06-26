import { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

export const useHtmlToPdfTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  
  const { displayMessage } = useAppContext();

  const processFiles = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length === 0) {
      displayMessage('warning', 'يرجى رفع ملفات HTML أولاً');
      return;
    }

    setIsProcessing(true);
    
    try {
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      
      for (const uploadedFile of uploadedFiles) {
        const file = uploadedFile.file;
        
        // التحقق من نوع الملف
        const isHtmlFile = file.name.toLowerCase().endsWith('.html') || 
                          file.name.toLowerCase().endsWith('.htm') ||
                          file.type.includes('html');
        
        if (!isHtmlFile) {
          displayMessage('warning', `الملف ${file.name} ليس ملف HTML صالح`);
          continue;
        }

        try {
          // قراءة محتوى HTML
          const htmlContent = await file.text();
          
          // هذا نموذج أولي - في التطبيق الحقيقي نحتاج محرك عرض
          // مثل Puppeteer أو html2canvas + jsPDF
          
          // استخراج النص من HTML (بطريقة بسيطة)
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          
          // استخراج العنوان
          const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : file.name;
          
          // إنشاء صفحة جديدة
          const page = pdfDoc.addPage();
          const { width, height } = page.getSize();
          
          // إضافة العنوان
          page.drawText(title, {
            x: 50,
            y: height - 80,
            size: 18,
            color: rgb(0, 0, 0),
          });
          
          // إضافة خط تحت العنوان
          page.drawLine({
            start: { x: 50, y: height - 90 },
            end: { x: width - 50, y: height - 90 },
            thickness: 1,
            color: rgb(0.5, 0.5, 0.5),
          });
          
          // إضافة المحتوى النصي
          const lines = textContent.split('\n').filter(line => line.trim());
          let currentY = height - 120;
          const lineHeight = 15;
          const maxWidth = width - 100;
          
          for (const line of lines) {
            if (currentY < 50) {
              // إنشاء صفحة جديدة إذا انتهت المساحة
              const newPage = pdfDoc.addPage();
              currentY = newPage.getSize().height - 50;
              
              newPage.drawText(line.trim(), {
                x: 50,
                y: currentY,
                size: 11,
                color: rgb(0.2, 0.2, 0.2),
                maxWidth: maxWidth,
              });
            } else {
              page.drawText(line.trim(), {
                x: 50,
                y: currentY,
                size: 11,
                color: rgb(0.2, 0.2, 0.2),
                maxWidth: maxWidth,
              });
            }
            
            currentY -= lineHeight;
          }
          
          // إضافة معلومات إضافية في أسفل الصفحة
          page.drawText('ملاحظة: هذا نموذج أولي لتحويل HTML إلى PDF', {
            x: 50,
            y: 30,
            size: 8,
            color: rgb(0.6, 0.6, 0.6),
          });
          
          page.drawText(`المصدر: ${file.name}`, {
            x: 50,
            y: 15,
            size: 8,
            color: rgb(0.6, 0.6, 0.6),
          });
          
        } catch (error) {
          console.error(`خطأ في معالجة ملف HTML ${file.name}:`, error);
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
      setDownloadFileName(`converted-html-${Date.now()}.pdf`);
      
      displayMessage('success', `تم تحويل ${uploadedFiles.length} ملف HTML إلى PDF بنجاح (${pdfDoc.getPageCount()} صفحة)`);
      displayMessage('info', 'هذا نموذج أولي. للحصول على تحويل كامل مع التنسيق، يرجى استخدام أدوات متخصصة.', 8000);
      
    } catch (error) {
      console.error('خطأ في تحويل ملفات HTML إلى PDF:', error);
      displayMessage('error', 'فشل في تحويل ملفات HTML إلى PDF. يرجى المحاولة مرة أخرى.');
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