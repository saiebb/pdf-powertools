
import React, { useEffect } from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { ClipboardType, Download } from 'lucide-react';
import { usePdfToTextTool } from './usePdfToTextTool';
import { useAppContext } from '../../contexts/AppContext';

interface PdfToTextToolProps {
  uploadedFile: UploadedFile | undefined;
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const PdfToTextTool: React.FC<PdfToTextToolProps> = ({ uploadedFile }) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const {
    isProcessing,
    extractedText,
    handleConvertToText,
    downloadExtractedText,
    clearExtractedText,
  } = usePdfToTextTool(); // displayMessage is sourced from context within the hook

  useEffect(() => {
    if (!uploadedFile) {
        clearExtractedText();
    }
  }, [uploadedFile, clearExtractedText]);


  if (!uploadedFile) {
    return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>;
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleConvertToText(uploadedFile)}
        isLoading={isProcessing || isLoadingApp}
        disabled={!uploadedFile || isLoadingApp || isProcessing}
        icon={<ClipboardType size={18} />}
        className="w-full md:w-auto"
      >
        استخراج النص
      </Button>
      {extractedText !== null && (
        <div className="mt-4 space-y-2">
          <h4 className="text-md font-semibold text-[var(--color-text-base)]">النص المستخرج:</h4>
          <textarea
            value={extractedText}
            readOnly
            rows={10}
            className="w-full p-2 border border-[var(--color-border)] rounded bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            aria-label="النص المستخرج"
          ></textarea>
          <Button 
            onClick={() => downloadExtractedText(uploadedFile?.file.name)} 
            size="sm" 
            icon={<Download size={16}/>}
            disabled={isProcessing}
          >
            تنزيل النص
          </Button>
        </div>
      )}
    </div>
  );
};