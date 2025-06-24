
import React from 'react';
import { UploadedFile } from '../../types';
import { Button, Modal } from '../../components/uiElements';
import { Lock } from 'lucide-react';
import { useProtectTool } from './useProtectTool';
import { useAppContext } from '../../contexts/AppContext';

interface ProtectToolProps {
  uploadedFile: UploadedFile | undefined; 
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
}

export const ProtectTool: React.FC<ProtectToolProps> = ({ uploadedFile }) => {
  const { isLoading: isLoadingApp } = useAppContext(); // Get global loading state from context
  const {
    isProcessing,
    password,
    setPassword,
    isPasswordModalOpen,
    openPasswordModal,
    closePasswordModal,
    handleProtectPdf,
  } = useProtectTool(); // displayMessage is now sourced from context within the hook

  if (!uploadedFile) {
    return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>;
  }

  return (
    <div className="space-y-6">
      <Button 
        onClick={openPasswordModal} 
        isLoading={isProcessing || isLoadingApp} 
        icon={<Lock size={18} />} 
        className="w-full md:w-auto"
        disabled={!uploadedFile || isLoadingApp}
      >
        تطبيق الحماية
      </Button>

      {isPasswordModalOpen && (
        <Modal 
          isOpen={isPasswordModalOpen} 
          onClose={closePasswordModal} 
          title="إدخال كلمة المرور لحماية الملف"
        >
          <div className="space-y-3">
            <label htmlFor="pdf-password-input" className="text-sm font-medium text-[var(--color-text-base)]">
              كلمة المرور:
            </label>
            <input
              id="pdf-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور هنا"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm"
              autoFocus
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              سيتم استخدام كلمة المرور هذه لتقييد فتح الملف وتعديله.
            </p>
          </div>
          <div className="mt-6 flex justify-end space-x-2 space-x-reverse"> {/* space-x-reverse for RTL */}
            <Button variant="ghost" onClick={closePasswordModal}>إلغاء</Button>
            <Button 
              onClick={() => handleProtectPdf(uploadedFile)} 
              disabled={!password.trim() || isProcessing}
              isLoading={isProcessing}
            >
              تطبيق الحماية
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};