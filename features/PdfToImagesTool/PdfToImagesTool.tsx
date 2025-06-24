
import React, { useEffect } from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { Image as ImageIconLucide } from 'lucide-react';
import { usePdfToImagesTool } from './usePdfToImagesTool';
import { useAppContext } from '../../contexts/AppContext';

interface PdfToImagesToolProps {
  uploadedFile: UploadedFile | undefined;
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const PdfToImagesTool: React.FC<PdfToImagesToolProps> = ({ uploadedFile }) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const {
    isProcessing,
    convertedImageUrls,
    handleConvertPdfToImages,
    clearConvertedImageUrls,
  } = usePdfToImagesTool(); // displayMessage is sourced from context within the hook

  useEffect(() => {
    if (!uploadedFile) {
      clearConvertedImageUrls();
    }
  }, [uploadedFile, clearConvertedImageUrls]);

  if (!uploadedFile) {
    return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>;
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleConvertPdfToImages(uploadedFile)}
        isLoading={isProcessing || isLoadingApp}
        disabled={!uploadedFile || isLoadingApp || isProcessing}
        icon={<ImageIconLucide size={18} />}
        className="w-full md:w-auto"
      >
        تحويل إلى صور
      </Button>
      {convertedImageUrls.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-md font-semibold text-[var(--color-text-base)]">الصور المحولة:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2 border border-[var(--color-border)] rounded-md bg-slate-50">
            {convertedImageUrls.map((img, index) => (
              <div key={index} className="bg-white p-2 rounded shadow text-center">
                <img src={img.url} alt={img.name} className="w-full h-auto rounded border mb-1" />
                <a
                  href={img.url}
                  download={img.name}
                  className="block text-xs text-[var(--color-primary)] hover:underline"
                >
                  تحميل {img.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};