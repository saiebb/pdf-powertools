// نسخة مبسطة من أداة تعديل PDF بدون PDF.js
import React, { useState } from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { FileEdit, Download, Type, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import * as pdfLib from 'pdf-lib';
import { downloadPdf } from '../../lib/fileUtils';

interface SimpleAnnotatePdfToolProps {
  uploadedFile: UploadedFile | undefined;
  onBackToTools?: () => void;
}

export const SimpleAnnotatePdfTool: React.FC<SimpleAnnotatePdfToolProps> = ({
  uploadedFile,
  onBackToTools,
}) => {
  const { displayMessage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [textToAdd, setTextToAdd] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [xPosition, setXPosition] = useState(50);
  const [yPosition, setYPosition] = useState(50);
  const [fontSize, setFontSize] = useState(12);

  if (!uploadedFile) {
    return (
      <div className="text-center py-8">
        <FileEdit size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>
      </div>
    );
  }

  const handleAddText = async () => {
    if (!uploadedFile?.pdfDoc || !textToAdd.trim()) {
      displayMessage('warning', 'الرجاء إدخال النص المراد إضافته.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = uploadedFile.pdfDoc;
      const pages = pdfDoc.getPages();
      
      if (pageNumber < 1 || pageNumber > pages.length) {
        displayMessage('error', `رقم الصفحة يجب أن يكون بين 1 و ${pages.length}.`);
        return;
      }

      const page = pages[pageNumber - 1];
      const { width, height } = page.getSize();
      
      // تحويل النسب المئوية إلى إحداثيات فعلية
      const x = (xPosition / 100) * width;
      const y = height - (yPosition / 100) * height; // عكس Y لأن PDF يبدأ من الأسفل

      page.drawText(textToAdd, {
        x: x,
        y: y,
        size: fontSize,
        color: pdfLib.rgb(0, 0, 0), // أسود
      });

      const pdfBytes = await pdfDoc.save();
      downloadPdf(pdfBytes, `annotated-${uploadedFile.file.name}`);
      displayMessage('success', 'تم إضافة النص وحفظ الملف بنجاح.');
      
      // إعادة تعيين النموذج
      setTextToAdd('');
      
    } catch (err: any) {
      console.error('Error adding text to PDF:', err);
      displayMessage('error', `فشل إضافة النص: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = uploadedFile.pdfDoc?.getPageCount() || 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center space-x-3 space-x-reverse">
          <FileEdit size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">تعديل PDF (مبسط)</h2>
        </div>
        {onBackToTools && (
          <Button
            onClick={onBackToTools}
            variant="ghost"
            icon={<ArrowLeft size={18} />}
          >
            العودة للأدوات
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3 space-x-reverse">
          <FileEdit size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">أداة التعديل المبسطة</h3>
            <p className="text-sm text-blue-800">
              هذه النسخة المبسطة تتيح لك إضافة نصوص إلى ملف PDF بدون معاينة مرئية. 
              استخدم الإحداثيات النسبية لتحديد موقع النص.
            </p>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">معلومات الملف</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">اسم الملف:</span>
            <p className="font-medium truncate">{uploadedFile.file.name}</p>
          </div>
          <div>
            <span className="text-gray-600">عدد الصفحات:</span>
            <p className="font-medium">{totalPages}</p>
          </div>
          <div>
            <span className="text-gray-600">حجم الملف:</span>
            <p className="font-medium">{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      </div>

      {/* Text Addition Form */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
          <Type size={20} className="text-green-600" />
          <span>إضافة نص</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النص المراد إضافته
              </label>
              <textarea
                value={textToAdd}
                onChange={(e) => setTextToAdd(e.target.value)}
                placeholder="اكتب النص هنا..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الصفحة (1 - {totalPages})
              </label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Position and Style Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع الأفقي (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={xPosition}
                  onChange={(e) => setXPosition(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع العمودي (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={yPosition}
                  onChange={(e) => setYPosition(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حجم الخط
              </label>
              <input
                type="number"
                min={6}
                max={72}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>نصيحة:</strong> الموقع الأفقي 0% = يسار الصفحة، 100% = يمين الصفحة.
                الموقع العمودي 0% = أعلى الصفحة، 100% = أسفل الصفحة.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleAddText}
            isLoading={isProcessing}
            disabled={!textToAdd.trim() || isProcessing}
            icon={<Download size={18} />}
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            إضافة النص وحفظ الملف
          </Button>
        </div>
      </div>
    </div>
  );
};