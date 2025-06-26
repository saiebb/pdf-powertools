import React from 'react';
import { UploadedFile } from '../../types';
import { Button, Spinner } from '../../components/uiElements';
import { Download, FileImage } from 'lucide-react';
import { useJpgToPdfTool } from './useJpgToPdfTool';

interface JpgToPdfToolProps {
  uploadedFiles: UploadedFile[];
}

export const JpgToPdfTool: React.FC<JpgToPdfToolProps> = ({ uploadedFiles }) => {
  const {
    isProcessing,
    processFiles,
    downloadUrl,
    downloadFileName,
    clearResults
  } = useJpgToPdfTool();

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
        <FileImage size={64} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">يرجى رفع صور JPG أو PNG لتحويلها إلى PDF</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* معاينة الصور المرفوعة */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">الصور المحددة ({uploadedFiles.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={file.id} className="relative">
              <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                {file.imagePreviewUrl ? (
                  <img
                    src={file.imagePreviewUrl}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileImage size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate" title={file.file.name}>
                {index + 1}. {file.file.name}
              </p>
            </div>
          ))}
        </div>
      </div>

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
                <FileImage size={20} />
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
              تحويل صور أخرى
            </Button>
          </>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="text-center text-sm text-gray-600">
        <p>سيتم ترتيب الصور في PDF حسب ترتيب الرفع</p>
        <p>الصور المدعومة: JPG, JPEG, PNG</p>
      </div>
    </div>
  );
};