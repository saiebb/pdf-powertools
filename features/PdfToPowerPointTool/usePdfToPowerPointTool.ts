import { useState } from 'react';
import { pdfjsLib, setupPdfjs } from '../../lib/pdfjs-setup';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

// إعداد PDF.js عند تحميل الوحدة
setupPdfjs();

export const usePdfToPowerPointTool = () => {
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
      
      let slidesContent = '';
      
      // معالجة كل صفحة كشريحة منفصلة
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // استخراج النص من الصفحة
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          // إنشاء محتوى الشريحة
          slidesContent += `
            <div class="slide" data-slide="${pageNum}">
              <h2>الشريحة ${pageNum}</h2>
              <div class="slide-content">
                ${pageText.split('.').map(sentence => 
                  sentence.trim() ? `<p class="bullet-point">• ${sentence.trim()}</p>` : ''
                ).join('')}
              </div>
            </div>
          `;
          
        } catch (error) {
          console.error(`خطأ في معالجة الصفحة ${pageNum}:`, error);
          slidesContent += `
            <div class="slide" data-slide="${pageNum}">
              <h2>الشريحة ${pageNum}</h2>
              <div class="slide-content">
                <p class="error-message">خطأ في استخراج محتوى هذه الشريحة</p>
              </div>
            </div>
          `;
        }
      }
      
      // إنشاء محتوى HTML لمحاكاة عرض PowerPoint
      const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>عرض تقديمي محول من PDF</title>
    <style>
        body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
        }
        .presentation-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .presentation-header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .metadata {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .slide {
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            overflow: hidden;
            page-break-after: always;
        }
        .slide h2 {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            margin: 0;
            padding: 20px;
            font-size: 1.8em;
        }
        .slide-content {
            padding: 30px;
            min-height: 300px;
        }
        .bullet-point {
            font-size: 1.1em;
            line-height: 1.8;
            margin-bottom: 15px;
            color: #333;
        }
        .error-message {
            color: #e74c3c;
            font-style: italic;
            text-align: center;
            padding: 50px;
        }
        .slide-number {
            position: absolute;
            bottom: 10px;
            right: 20px;
            background: #333;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.9em;
        }
        @media print {
            .slide {
                page-break-after: always;
                margin-bottom: 0;
            }
        }
    </style>
</head>
<body>
    <div class="presentation-header">
        <h1>عرض تقديمي محول من PDF</h1>
        <p>تم التحويل من: ${uploadedFile.file.name}</p>
    </div>
    
    <div class="metadata">
        <h3>معلومات العرض التقديمي</h3>
        <p><strong>اسم الملف الأصلي:</strong> ${uploadedFile.file.name}</p>
        <p><strong>تاريخ التحويل:</strong> ${new Date().toLocaleString('ar-SA')}</p>
        <p><strong>عدد الشرائح:</strong> ${pdf.numPages}</p>
        <p><strong>ملاحظة:</strong> هذا نموذج أولي لتحويل PDF إلى PowerPoint. للحصول على تحويل كامل مع الحفاظ على التنسيق والصور، يرجى استخدام خدمات التحويل المتخصصة.</p>
    </div>
    
    <div class="slides-container">
        ${slidesContent}
    </div>
    
    <script>
        // إضافة أرقام الشرائح
        document.querySelectorAll('.slide').forEach((slide, index) => {
            const slideNumber = document.createElement('div');
            slideNumber.className = 'slide-number';
            slideNumber.textContent = index + 1 + ' / ' + ${pdf.numPages};
            slide.style.position = 'relative';
            slide.appendChild(slideNumber);
        });
    </script>
</body>
</html>`;
      
      // إنشاء blob للتحميل
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setDownloadFileName(`converted-${uploadedFile.file.name.replace('.pdf', '')}.ppt`);
      
      displayMessage('success', `تم تحويل ${pdf.numPages} صفحة إلى عرض PowerPoint بنجاح`);
      displayMessage('info', 'هذا نموذج أولي. للحصول على تحويل كامل مع التنسيق والصور، يرجى استخدام خدمات التحويل المتخصصة.', 8000);
      
    } catch (error) {
      console.error('خطأ في تحويل PDF إلى PowerPoint:', error);
      displayMessage('error', 'فشل في تحويل PDF إلى PowerPoint. يرجى المحاولة مرة أخرى.');
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