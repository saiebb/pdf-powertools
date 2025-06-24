
import { useState } from 'react';
import * as pdfLib from 'pdf-lib'; 
import { UploadedFile } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

// Local type definitions to workaround issues with pdf-lib CJS typings
interface CustomPDFDocumentPermissions {
  allowPrinting?: boolean;
  allowModifying?: boolean;
  allowCopying?: boolean;
  allowAnnotating?: boolean;
  allowFillingForms?: boolean;
  allowContentAccessibility?: boolean;
  allowDocumentAssembly?: boolean;
}

interface CustomSaveOptions {
  userPassword?: string;
  ownerPassword?: string;
  permissions?: CustomPDFDocumentPermissions;
  useObjectStreams?: boolean; 
  addDefaultPage?: boolean;
  updateFieldAppearances?: boolean;
}

// Props interface no longer needs displayMessage
// interface UseProtectToolProps {
//   displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
// }

export const useProtectTool = (/*{ displayMessage }: UseProtectToolProps*/) => {
  const { displayMessage } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const closePasswordModal = () => setIsPasswordModalOpen(false);

  const handleProtectPdf = async (uploadedFile: UploadedFile | undefined) => {
    if (!uploadedFile?.pdfDoc) {
      displayMessage('warning', "الرجاء رفع ملف PDF أولاً.");
      return;
    }
    if (!password.trim()) {
      displayMessage('warning', "الرجاء إدخال كلمة مرور.");
      return;
    }

    setIsProcessing(true);
    closePasswordModal();

    try {
      const pdfDoc = uploadedFile.pdfDoc;
      
      const permissionsOptions: CustomPDFDocumentPermissions = {
        allowModifying: false,
        allowCopying: false,      
        allowAnnotating: false,
        allowFillingForms: false,
        allowContentAccessibility: true, 
        allowDocumentAssembly: false,
        allowPrinting: false,
      };
      
      const pdfBytes = await pdfDoc.save({
        userPassword: password,
        ownerPassword: password, 
        permissions: permissionsOptions,
      } as CustomSaveOptions); 

      downloadPdf(pdfBytes, `protected-${uploadedFile.file.name}`);
      displayMessage('success', "تمت حماية الملف بنجاح.");
      setPassword(''); 
    } catch (err: any) {
      console.error("Error protecting PDF:", err);
      displayMessage('error', `فشل حماية الملف: ${err.message}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    password,
    setPassword,
    isPasswordModalOpen,
    openPasswordModal,
    closePasswordModal,
    handleProtectPdf,
  };
};