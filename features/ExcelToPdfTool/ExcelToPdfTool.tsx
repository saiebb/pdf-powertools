import React from 'react';
import { UploadedFile } from '../../types';
import { Button, Spinner, Alert } from '../../components/uiElements';
import { Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { useExcelToPdfTool } from './useExcelToPdfTool';

interface ExcelToPdfToolProps {
  uploadedFiles: UploadedFile[];
}

export const ExcelToPdfTool: React.FC<ExcelToPdfToolProps> = ({ uploadedFiles }) => {
  const {
    isProcessing,
    processFiles,
    downloadUrl,
    downloadFileName,
    clearResults
  } = useExcelToPdfTool();

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
        <FileSpreadsheet size={64} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">يرجى رفع ملفات Excel (.xlsx) لتحويلها إلى PDF</p>
        
        <Alert type="warning" className="mt-6 max-w-md mx-auto">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">ملاحظة مهمة</p>
              <p className="text-sm mt-1">
                تحويل Excel إلى PDF يتطلب خدمة خارجية أو مكتبة متخصصة. 
                هذه الأداة تعمل كنموذج أولي وقد تحتاج إلى تكامل مع خدمات مثل:
              </p>
              <ul className="text-sm mt-2 list-disc list-inside">
                <li>Microsoft Graph API</li>
                <li>LibreOffice Online</li>
                <li>مكتبة SheetJS + jsPDF</li>
                <li>خدمات التحويل السحابية</li>
              </ul>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* معاينة الملفات المرفوعة */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">ملفات Excel المحددة ({uploadedFiles.length})</h3>
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div key={file.id} className="flex items-center p-3 bg-white rounded border">
              <FileSpreadsheet size={20} className="text-green-600 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {index + 1}. {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* تحذير حول القيود */}
      <Alert type="warning">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">قيود التحويل الحالية</p>
            <p className="text-sm mt-1">
              هذه النسخة التجريبية تدعم التحويل الأساسي فقط. 
              قد لا تحافظ على المخططات، الصيغ المعقدة، أو التنسيق المتقدم.
            </p>
          </div>
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
                <FileSpreadsheet size={20} />
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
        <p>الملفات المدعومة: .xlsx, .xls, .csv</p>
        <p>للحصول على أفضل النتائج، استخدم ملفات .xlsx</p>
        <p>سيتم تحويل كل ورقة عمل إلى صفحة منفصلة في PDF</p>
      </div>
    </div>
  );
};