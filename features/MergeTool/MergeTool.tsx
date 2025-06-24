
import React from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { Users } from 'lucide-react';
import { useMergeTool } from './useMergeTool';
import { useAppContext } from '../../contexts/AppContext';

interface MergeToolProps {
  uploadedFiles: UploadedFile[];
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const MergeTool: React.FC<MergeToolProps> = ({ uploadedFiles }) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const {
    isProcessing,
    handleMergePdfs,
  } = useMergeTool(); // displayMessage is now sourced from context within the hook

  // uploadedFiles.length === 0 case is handled by App.tsx not rendering tool UI if no files
  
  return (
    <div className="space-y-6">
      <Button
        onClick={() => handleMergePdfs(uploadedFiles)}
        isLoading={isProcessing || isLoadingApp}
        disabled={uploadedFiles.length < 2 || isLoadingApp || isProcessing}
        icon={<Users size={18} />}
        className="w-full md:w-auto"
      >
        دمج {uploadedFiles.length} ملفات PDF
      </Button>
      {uploadedFiles.length > 0 && uploadedFiles.length < 2 && (
        <p className="text-sm text-center text-[var(--color-text-muted)]">
          الرجاء رفع ملف PDF آخر على الأقل للتمكن من الدمج.
        </p>
      )}
    </div>
  );
};