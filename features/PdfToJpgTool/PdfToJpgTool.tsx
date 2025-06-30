import React from 'react';
import { UploadedFile } from '../../types';
import { Button, Spinner } from '../../components/uiElements';
import { Download, FileImage, Eye } from 'lucide-react';
import { usePdfToJpgTool } from './usePdfToJpgTool.ts';

interface PdfToJpgToolProps {
  uploadedFile?: UploadedFile;
}

export const PdfToJpgTool: React.FC<PdfToJpgToolProps> = ({ uploadedFile }) => {
  const {
    isProcessing,
    processFile,
    downloadUrls,
    clearResults,
    previewImages
  } = usePdfToJpgTool();

  const handleProcess = () => {
    if (!uploadedFile) return;
    processFile(uploadedFile);
  };

  const handleDownloadAll = () => {
    downloadUrls.forEach((url: string, index: number) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `page-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDownloadSingle = (url: string, pageNumber: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-${pageNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    clearResults();
  };

  if (!uploadedFile) {
    return (
      <div className="text-center py-8">
        <FileImage size={64} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">يرجى رفع ملف PDF لتحويله إلى صور JPG</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* معلومات الملف */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">ملف PDF المحدد</h3>
        <div className="flex items-center p-3 bg-white rounded border">
          <FileImage size={20} className="text-red-600 mr-3 flex-shrink-0" />
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

      {/* معاينة الصور المحولة */}
      {previewImages.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">الصور المحولة ({previewImages.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewImages.map((imageData: string, index: number) => (
              <div key={index} className="relative">
                <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <img
                    src={imageData}
                    alt={`صفحة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-600">
                    صفحة {index + 1}
                  </p>
                  <Button
                    onClick={() => handleDownloadSingle(downloadUrls[index], index + 1)}
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    <Download size={12} className="mr-1" />
                    تحميل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أزرار التحكم */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {downloadUrls.length === 0 ? (
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
                <FileImage size={20} />
                تحويل إلى JPG
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleDownloadAll}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download size={20} />
              تحميل جميع الصور
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
        <p>سيتم تحويل كل صفحة من PDF إلى صورة JPG منفصلة</p>
        <p>جودة الصور: عالية (300 DPI)</p>
      </div>
    </div>
  );
};