import React from 'react';
import { UploadedFile } from '../../types';
import { Button, Spinner, Alert } from '../../components/uiElements';
import { Download, Presentation, AlertTriangle } from 'lucide-react';
import { usePdfToPowerPointTool } from './usePdfToPowerPointTool';

interface PdfToPowerPointToolProps {
  uploadedFile?: UploadedFile;
}

export const PdfToPowerPointTool: React.FC<PdfToPowerPointToolProps> = ({ uploadedFile }) => {
  const {
    isProcessing,
    processFile,
    downloadUrl,
    downloadFileName,
    clearResults
  } = usePdfToPowerPointTool();

  const handleProcess = () => {
    if (!uploadedFile) return;
    processFile(uploadedFile);
  };

  const handleDownload = () => {
    if (downloadUrl && downloadFileName) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    clearResults();
  };

  if (!uploadedFile) {
    return (
      <div className="text-center py-8">
        <Presentation size={64} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">يرجى رفع ملف PDF لتحويله إلى PowerPoint</p>
        
        <Alert className="mt-6 max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <p className="font-semibold">ملاحظة مهمة</p>
            <p className="text-sm mt-1">
              تحويل PDF إلى PowerPoint يتطلب خدمة متخصصة لاستخراج المحتوى وإعادة تنسيقه. 
              هذه الأداة تعمل كنموذج أولي وقد تحتاج إلى تكامل مع:
            </p>
            <ul className="text-sm mt-2 list-disc list-inside">
              <li>Adobe PDF Services API</li>
              <li>Microsoft Graph API</li>
              <li>خدمات التحويل السحابية</li>
              <li>مكتبات معالجة العروض التقديمية</li>
            </ul>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* معلومات الملف */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">ملف PDF المحدد</h3>
        <div className="flex items-center p-3 bg-white rounded border">
          <Presentation size={20} className="text-red-600 mr-3 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {uploadedFile.file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>

      {/* تحذير حول القيود */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <div>
          <p className="font-semibold">قيود التحويل الحالية</p>
          <p className="text-sm mt-1">
            هذه النسخة التجريبية تحول كل صفحة PDF إلى شريحة منفصلة. 
            قد لا تحافظ على التنسيق المعقد أو العناصر التفاعلية.
          </p>
        </div>
      </Alert>

      {/* أزرار التحكم */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!downloadUrl ? (
          <Button
            onClick={handleProcess}
            disabled={isProcessing || !uploadedFile}
            className="flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" />
                جاري التحويل...
              </>
            ) : (
              <>
                <Presentation size={20} />
                تحويل إلى PowerPoint
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download size={20} />
              تحميل ملف PowerPoint
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              تحويل ملف آخر
            </Button>
          </>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="text-center text-sm text-gray-600">
        <p>سيتم تحويل كل صفحة من PDF إلى شريحة منفصلة في PowerPoint</p>
        <p>النصوص والصور الأساسية سيتم نقلها حسب الإمكان</p>
        <p>للحصول على أفضل النتائج، استخدم ملفات PDF بتنسيق بسيط</p>
      </div>
    </div>
  );
};