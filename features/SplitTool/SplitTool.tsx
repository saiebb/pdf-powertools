
import React from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { Scissors } from 'lucide-react';
import { useSplitTool } from './useSplitTool';
import { useAppContext } from '../../contexts/AppContext';

interface SplitToolProps {
  uploadedFile: UploadedFile | undefined;
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const SplitTool: React.FC<SplitToolProps> = ({ uploadedFile }) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const {
    isProcessing,
    handleSplitPdf,
  } = useSplitTool(); // displayMessage is sourced from context within the hook

  if (!uploadedFile) {
    return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => handleSplitPdf(uploadedFile)}
        isLoading={isProcessing || isLoadingApp}
        disabled={!uploadedFile || isLoadingApp || isProcessing}
        icon={<Scissors size={18} />}
        className="w-full md:w-auto"
      >
        تقسيم الملف
      </Button>
    </div>
  );
};