
import React from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { FileImage } from 'lucide-react';
import { useImageToPdfTool } from './useImageToPdfTool';
import { useAppContext } from '../../contexts/AppContext';

interface ImageToPdfToolProps {
  uploadedFiles: UploadedFile[]; 
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const ImageToPdfTool: React.FC<ImageToPdfToolProps> = ({ uploadedFiles }) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const {
    isProcessing,
    handleImageToPdf,
  } = useImageToPdfTool(); // displayMessage is sourced from context within the hook

  if (uploadedFiles.length === 0) {
    return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملفات صور أولاً.</p>;
  }

  const imageFiles = uploadedFiles.filter(f => f.file.type.startsWith('image/') && f.imagePreviewUrl);

  return (
    <div className="space-y-6">
      <Button
        onClick={() => handleImageToPdf(uploadedFiles)}
        isLoading={isProcessing || isLoadingApp}
        disabled={imageFiles.length === 0 || isLoadingApp || isProcessing}
        icon={<FileImage size={18} />}
        className="w-full md:w-auto"
      >
        تحويل {imageFiles.length > 0 ? `${imageFiles.length} صور` : 'الصور'} إلى PDF
      </Button>

      {imageFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-md font-semibold text-[var(--color-text-base)]">معاينة الصور المرفوعة:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2 border border-[var(--color-border)] rounded-md bg-slate-50">
            {imageFiles.map(uf => (
              <div key={uf.id} className="bg-white p-1 rounded shadow">
                <img 
                  src={uf.imagePreviewUrl} 
                  alt={uf.file.name} 
                  className="w-full h-auto rounded border object-contain aspect-square"
                />
                <p className="text-xs text-center truncate mt-1" title={uf.file.name}>
                  {uf.file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {uploadedFiles.length > 0 && imageFiles.length === 0 && (
         <p className="text-sm text-center text-[var(--color-text-muted)]">
           لم يتم رفع ملفات صور صالحة. الرجاء التأكد من رفع ملفات JPG أو PNG.
        </p>
      )}
    </div>
  );
};