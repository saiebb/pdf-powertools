
import React from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { KeyRound } from 'lucide-react';
import { useUnlockPdfTool } from './useUnlockPdfTool';
import { useAppContext } from '../../contexts/AppContext';

interface UnlockPdfToolProps {
  uploadedFile: UploadedFile | undefined;
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const UnlockPdfTool: React.FC<UnlockPdfToolProps> = ({ uploadedFile }) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const {
    isProcessing,
    handleUnlockPdf,
  } = useUnlockPdfTool(); // displayMessage is sourced from context within the hook

  if (!uploadedFile) {
    return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => handleUnlockPdf(uploadedFile)}
        isLoading={isProcessing || isLoadingApp}
        disabled={!uploadedFile || isLoadingApp || isProcessing}
        icon={<KeyRound size={18} />}
        className="w-full md:w-auto"
      >
        محاولة إزالة الحماية
      </Button>
      <p className="text-xs text-center text-[var(--color-text-muted)]">
        ملاحظة: هذه الأداة تحاول إزالة قيود "كلمة مرور المالك". لا يمكنها إزالة "كلمة مرور المستخدم" التي تمنع فتح الملف.
      </p>
    </div>
  );
};