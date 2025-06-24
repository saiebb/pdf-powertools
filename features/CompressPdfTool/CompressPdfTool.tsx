
import React from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { Minimize2 } from 'lucide-react';
import { useCompressPdfTool } from './useCompressPdfTool';
import { useAppContext } from '../../contexts/AppContext';

interface CompressPdfToolProps {
  uploadedFile: UploadedFile | undefined;
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const CompressPdfTool: React.FC<CompressPdfToolProps> = ({ uploadedFile }) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const {
    isProcessing,
    handleCompressPdf,
  } = useCompressPdfTool(); // displayMessage is sourced from context within the hook

  if (!uploadedFile) {
    return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => handleCompressPdf(uploadedFile)}
        isLoading={isProcessing || isLoadingApp}
        disabled={!uploadedFile || isLoadingApp || isProcessing}
        icon={<Minimize2 size={18} />}
        className="w-full md:w-auto"
      >
        ضغط الملف
      </Button>
      <p className="text-xs text-center text-[var(--color-text-muted)]">
        ملاحظة: الضغط من جانب العميل قد يكون تأثيره محدودًا على حجم الملف.
      </p>
    </div>
  );
};