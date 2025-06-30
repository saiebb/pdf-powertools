import React from 'react';
import { UploadedFile } from '../../types';
import { Button, Spinner, Alert } from '../../components/uiElements';
import { Download, FileCheck, AlertTriangle, Info } from 'lucide-react';
import { usePdfToPdfATool } from './usePdfToPdfATool';

interface PdfToPdfAToolProps {
  uploadedFile?: UploadedFile;
}

export const PdfToPdfATool: React.FC<PdfToPdfAToolProps> = ({ uploadedFile }) => {
  const {
    isProcessing,
    processFile,
    downloadUrl,
    downloadFileName,
    clearResults
  } = usePdfToPdfATool();

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
        <FileCheck size={64} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">يرجى رفع ملف PDF لتحويله إلى PDF/A</p>
        
        <Alert className="mt-6 max-w-md mx-auto">
          <Info className="h-4 w-4" />
          <div>
            <p className="font-semibold">ما هو PDF/A؟</p>
            <p className="text-sm mt-1">
              PDF/A هو معيار ISO للأرشفة طويلة المدى للمستندات الإلكترونية. 
              يضمن إمكانية الوصول للمستند في المستقبل من خلال:
            </p>
            <ul className="text-sm mt-2 list-disc list-inside">
              <li>تضمين جميع الخطوط المستخدمة</li>
              <li>منع الاعتماد على موارد خارجية</li>
              <li>ضمان الحفظ طويل المدى</li>
              <li>التوافق مع معايير الأرشفة</li>
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
          <FileCheck size={20} className="text-red-600 mr-3 flex-shrink-0" />
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

      {/* معلومات حول PDF/A */}
      <Alert>
        <Info className="h-4 w-4" />
        <div>
          <p className="font-semibold">مميزات PDF/A</p>
          <p className="text-sm mt-1">
            سيتم تحويل ملف PDF العادي إلى PDF/A للأرشفة طويلة المدى مع ضمان:
          </p>
          <ul className="text-sm mt-2 list-disc list-inside">
            <li>تضمين جميع الخطوط والموارد</li>
            <li>إزالة العناصر التفاعلية غير المدعومة</li>
            <li>ضمان التوافق مع معايير الأرشفة</li>
            <li>الحفاظ على المظهر الأصلي للمستند</li>
          </ul>
        </div>
      </Alert>

      {/* تحذير حول القيود */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <div>
          <p className="font-semibold">ملاحظات التحويل</p>
          <p className="text-sm mt-1">
            هذه النسخة التجريبية تقوم بتحسينات أساسية لتحويل PDF إلى PDF/A. 
            للحصول على تحويل كامل ومعتمد، يُنصح باستخدام أدوات متخصصة.
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
                <FileCheck size={20} />
                تحويل إلى PDF/A
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
              تحميل PDF/A
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
        <p>سيتم تحسين ملف PDF ليتوافق مع معايير PDF/A للأرشفة</p>
        <p>الملف الناتج سيكون مناسباً للحفظ طويل المدى</p>
        <p>قد يزيد حجم الملف قليلاً بسبب تضمين الموارد</p>
      </div>
    </div>
  );
};