import { useState } from 'react';
import { pdfjsLib, setupPdfjs } from '../../lib/pdfjs-setup';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

// إعداد PDF.js عند تحميل الوحدة
setupPdfjs();

export const usePdfToWordTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  
  const { displayMessage } = useAppContext();

  const processFile = async (uploadedFile: UploadedFile) => {
    if (!uploadedFile) {
      displayMessage('warning', 'يرجى رفع ملف PDF أولاً');
      return;
    }

    setIsProcessing(true);
    
    try {
      // قراءة ملف PDF
      const arrayBuffer = await uploadedFile.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let extractedText = '';
      
      // استخراج النص من كل صفحة
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // تجميع النصوص من الصفحة
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          extractedText += `\n\n--- صفحة ${pageNum} ---\n\n${pageText}`;
          
        } catch (error) {
          console.error(`خطأ في استخراج النص من الصفحة ${pageNum}:`, error);
          extractedText += `\n\n--- صفحة ${pageNum} ---\n\n[خطأ في استخراج النص من هذه الصفحة]`;
        }
      }
      
      if (!extractedText.trim()) {
        displayMessage('error', 'لم يتم العثور على نصوص قابلة للاستخراج في ملف PDF');
        return;
      }
      
      // إنشاء محتوى HTML بسيط لمحاكاة مستند Word
      const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مستند محول من PDF</title>
    <style>
        body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            line-height: 1.6;
            margin: 2cm;
            direction: rtl;
            text-align: right;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .page-break {
            page-break-before: always;
            margin-top: 2em;
            padding-top: 1em;
            border-top: 1px solid #ddd;
        }
        .metadata {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>مستند محول من PDF</h1>
    
    <div class="metadata">
        <p><strong>اسم الملف الأصلي:</strong> ${uploadedFile.file.name}</p>
        <p><strong>تاريخ التحويل:</strong> ${new Date().toLocaleString('ar-SA')}</p>
        <p><strong>عدد الصفحات:</strong> ${pdf.numPages}</p>
        <p><strong>ملاحظة:</strong> هذا نموذج أولي لتحويل PDF إلى Word. للحصول على تحويل كامل مع الحفاظ على التنسيق، يرجى استخدام خدمات التحويل المتخصصة.</p>
    </div>
    
    <div class="content">
        ${extractedText.split('\n').map(line => {
          if (line.includes('--- صفحة')) {
            return `<h2 class="page-break">${line}</h2>`;
          }
          return line.trim() ? `<p>${line}</p>` : '';
        }).join('')}
    </div>
</body>
</html>`;
      
      // إنشاء blob للتحميل (HTML يمكن فتحه في Word)
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setDownloadFileName(`converted-${uploadedFile.file.name.replace('.pdf', '')}.doc`);
      
      displayMessage('success', `تم استخراج النصوص من ${pdf.numPages} صفحة وتحويلها إلى مستند Word`);
      displayMessage('info', 'هذا نموذج أولي. للحصول على تحويل كامل مع التنسيق، يرجى استخدام خدمات التحويل المتخصصة.', 8000);
      
    } catch (error) {
      console.error('خطأ في تحويل PDF إلى Word:', error);
      displayMessage('error', 'فشل في تحويل PDF إلى Word. يرجى المحاولة مرة أخرى.');
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
    processFile,
    downloadUrl,
    downloadFileName,
    clearResults
  };
};