import { useState } from 'react';
import { pdfjsLib, setupPdfjs } from '../../lib/pdfjs-setup';
import { UploadedFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

// إعداد PDF.js عند تحميل الوحدة
setupPdfjs();

export const usePdfToExcelTool = () => {
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
      
      let csvContent = '';
      let allSheetsData = [];
      
      // معالجة كل صفحة كورقة عمل منفصلة
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // استخراج النص من الصفحة
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          // تحليل النص وتحويله إلى صفوف وأعمدة (بطريقة بسيطة)
          const lines = pageText.split(/[.\n]/).filter(line => line.trim());
          const sheetData = [];
          
          // إضافة رأس للورقة
          sheetData.push([`ورقة العمل ${pageNum}`, '', '', '']);
          sheetData.push(['البيانات المستخرجة', 'النوع', 'الصفحة', 'الملاحظات']);
          
          // تحويل النصوص إلى صفوف
          lines.forEach((line, index) => {
            if (line.trim()) {
              const cleanLine = line.trim();
              // محاولة تحديد نوع البيانات
              let dataType = 'نص';
              if (/^\d+$/.test(cleanLine)) {
                dataType = 'رقم';
              } else if (/\d{4}-\d{2}-\d{2}/.test(cleanLine)) {
                dataType = 'تاريخ';
              } else if (/@/.test(cleanLine)) {
                dataType = 'بريد إلكتروني';
              }
              
              sheetData.push([
                cleanLine,
                dataType,
                pageNum.toString(),
                `السطر ${index + 1}`
              ]);
            }
          });
          
          allSheetsData.push({
            name: `الصفحة_${pageNum}`,
            data: sheetData
          });
          
        } catch (error) {
          console.error(`خطأ في معالجة الصفحة ${pageNum}:`, error);
          allSheetsData.push({
            name: `الصفحة_${pageNum}`,
            data: [
              [`ورقة العمل ${pageNum}`, '', '', ''],
              ['خطأ', 'خطأ في استخراج البيانات', pageNum.toString(), 'فشل في المعالجة']
            ]
          });
        }
      }
      
      // تحويل البيانات إلى تنسيق CSV (يمكن فتحه في Excel)
      csvContent = 'sep=,\n'; // تحديد الفاصل لـ Excel
      
      allSheetsData.forEach((sheet, sheetIndex) => {
        if (sheetIndex > 0) {
          csvContent += '\n\n'; // فصل بين الأوراق
        }
        
        csvContent += `=== ${sheet.name} ===\n`;
        
        sheet.data.forEach(row => {
          const csvRow = row.map(cell => {
            // تنظيف البيانات وإضافة علامات اقتباس إذا لزم الأمر
            const cleanCell = String(cell).replace(/"/g, '""');
            return `"${cleanCell}"`;
          }).join(',');
          
          csvContent += csvRow + '\n';
        });
      });
      
      // إنشاء محتوى HTML لمحاكاة ملف Excel
      const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>جدول بيانات محول من PDF</title>
    <style>
        body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            margin: 20px;
            direction: rtl;
        }
        .excel-header {
            background: linear-gradient(135deg, #1e7e34 0%, #28a745 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .metadata {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .sheet {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        .sheet-header {
            background-color: #007bff;
            color: white;
            padding: 10px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .data-type-number { color: #007bff; }
        .data-type-date { color: #28a745; }
        .data-type-email { color: #dc3545; }
    </style>
</head>
<body>
    <div class="excel-header">
        <h1>جدول بيانات محول من PDF</h1>
        <p>تم التحويل من: ${uploadedFile.file.name}</p>
    </div>
    
    <div class="metadata">
        <h3>معلومات الملف</h3>
        <p><strong>اسم الملف الأصلي:</strong> ${uploadedFile.file.name}</p>
        <p><strong>تاريخ التحويل:</strong> ${new Date().toLocaleString('ar-SA')}</p>
        <p><strong>عدد أوراق العمل:</strong> ${allSheetsData.length}</p>
        <p><strong>ملاحظة:</strong> هذا نموذج أولي لتحويل PDF إلى Excel. للحصول على تحويل كامل للجداول المعقدة، يرجى استخدام خدمات التحويل المتخصصة.</p>
    </div>
    
    ${allSheetsData.map(sheet => `
      <div class="sheet">
        <div class="sheet-header">${sheet.name}</div>
        <table>
          ${sheet.data.map((row, rowIndex) => `
            <tr>
              ${row.map((cell, cellIndex) => {
                const isHeader = rowIndex === 0 || rowIndex === 1;
                const tag = isHeader ? 'th' : 'td';
                let className = '';
                
                if (cellIndex === 1 && !isHeader) { // عمود النوع
                  if (cell === 'رقم') className = 'data-type-number';
                  else if (cell === 'تاريخ') className = 'data-type-date';
                  else if (cell === 'بريد إلكتروني') className = 'data-type-email';
                }
                
                return `<${tag} class="${className}">${cell}</${tag}>`;
              }).join('')}
            </tr>
          `).join('')}
        </table>
      </div>
    `).join('')}
</body>
</html>`;
      
      // إنشاء blob للتحميل (CSV يمكن فتحه في Excel)
      const blob = new Blob([csvContent], { 
        type: 'application/vnd.ms-excel'
      });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setDownloadFileName(`converted-${uploadedFile.file.name.replace('.pdf', '')}.csv`);
      
      displayMessage('success', `تم تحويل ${pdf.numPages} صفحة إلى جدول Excel بنجاح`);
      displayMessage('info', 'هذا نموذج أولي. للحصول على تحويل كامل للجداول المعقدة، يرجى استخدام خدمات التحويل المتخصصة.', 8000);
      
    } catch (error) {
      console.error('خطأ في تحويل PDF إلى Excel:', error);
      displayMessage('error', 'فشل في تحويل PDF إلى Excel. يرجى المحاولة مرة أخرى.');
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