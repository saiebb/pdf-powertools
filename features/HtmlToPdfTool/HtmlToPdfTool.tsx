import React from 'react';
import { UploadedFile } from '../../types';
import { Button, Spinner, Alert } from '../../components/uiElements';
import { Download, Code, AlertTriangle } from 'lucide-react';
import { useHtmlToPdfTool } from './useHtmlToPdfTool';

interface HtmlToPdfToolProps {
  uploadedFiles: UploadedFile[];
}

export const HtmlToPdfTool: React.FC<HtmlToPdfToolProps> = ({ uploadedFiles }) => {
  const {
    isProcessing,
    processFiles,
    downloadUrl,
    downloadFileName,
    clearResults
  } = useHtmlToPdfTool();

  const handleProcess = () => {
    if (uploadedFiles.length === 0) return;
    processFiles(uploadedFiles);
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

  if (uploadedFiles.length === 0) {
    return (
      <div className="text-center py-8">
        <Code size={64} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">يرجى رفع ملفات HTML لتحويلها إلى PDF</p>
        
        <Alert className="mt-6 max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <p className="font-semibold">ملاحظة مهمة</p>
            <p className="text-sm mt-1">
              تحويل HTML إلى PDF يتطلب محرك عرض متقدم. 
              هذه الأداة تعمل كنموذج أولي وقد تحتاج إلى تكامل مع:
            </p>
            <ul className="text-sm mt-2 list-disc list-inside">
              <li>Puppeteer أو Playwright</li>
              <li>wkhtmltopdf</li>
              <li>خدمات التحويل السحابية</li>
              <li>مكتبة jsPDF مع html2canvas</li>
            </ul>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* معاينة الملفات المرفوعة */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">ملفات HTML المحددة ({uploadedFiles.length})</h3>
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div key={file.id} className="flex items-center p-3 bg-white rounded border">
              <Code size={20} className="text-blue-600 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {index + 1}. {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* تحذير حول القيود */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <div>
          <p className="font-semibold">قيود التحويل الحالية</p>
          <p className="text-sm mt-1">
            هذه النسخة التجريبية تدعم HTML الأساسي فقط. 
            قد لا تعمل مع CSS المعقد، JavaScript، أو الموارد الخارجية.
          </p>
        </div>
      </Alert>

      {/* أزرار التحكم */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!downloadUrl ? (
          <Button
            onClick={handleProcess}
            disabled={isProcessing || uploadedFiles.length === 0}
            className="flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" />
                جاري التحويل...
              </>
            ) : (
              <>
                <Code size={20} />
                تحويل إلى PDF
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
              تحميل PDF
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              تحويل ملفات أخرى
            </Button>
          </>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="text-center text-sm text-gray-600">
        <p>الملفات المدعومة: .html, .htm</p>
        <p>للحصول على أفضل النتائج، استخدم HTML بسيط مع CSS مضمن</p>
        <p>الصور والموارد الخارجية قد لا تظهر في النسخة التجريبية</p>
      </div>
    </div>
  );
};