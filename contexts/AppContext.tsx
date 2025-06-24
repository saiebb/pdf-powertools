
import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
import { AppDisplayMessageFn } from '../types';
import { 
  setDisplayAppMessageFn as setFontServiceDisplayMsgFn 
} from '../lib/fontService';
import { 
  setDisplayAppMessageFn as setPdfJsServiceDisplayMsgFn
} from '../lib/pdfJsService';

interface IAppContext {
  isLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  areCoreServicesReady: boolean; // New state
  setAreCoreServicesReady: (isReady: boolean) => void; // New setter
  displayMessage: AppDisplayMessageFn;
  successMessage: string | null;
  errorMessage: string | null;
  warningMessage: string | null;
  infoMessage: string | null;
  clearSuccessMessage: () => void;
  clearErrorMessage: () => void;
  clearWarningMessage: () => void;
  clearInfoMessage: () => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [areCoreServicesReady, setAreCoreServicesReadyState] = useState(false); // New state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const displayMessage: AppDisplayMessageFn = useCallback((type, message, duration = 7000) => {
    if (type === 'success') setSuccessMessage(message);
    else if (type === 'error') setErrorMessage(message);
    else if (type === 'warning') setWarningMessage(message);
    else if (type === 'info') setInfoMessage(message);

    setTimeout(() => {
      if (type === 'success') setSuccessMessage(current => current === message ? null : current);
      if (type === 'error') setErrorMessage(current => current === message ? null : current);
      if (type === 'warning') setWarningMessage(current => current === message ? null : current);
      if (type === 'info') setInfoMessage(current => current === message ? null : current);
    }, duration);
  }, []);

  useEffect(() => {
    setFontServiceDisplayMsgFn(displayMessage);
    setPdfJsServiceDisplayMsgFn(displayMessage);
    return () => {
      setFontServiceDisplayMsgFn(() => {}); 
      setPdfJsServiceDisplayMsgFn(() => {}); 
    };
  }, [displayMessage]);

  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);
  const clearErrorMessage = useCallback(() => setErrorMessage(null), []);
  const clearWarningMessage = useCallback(() => setWarningMessage(null), []);
  const clearInfoMessage = useCallback(() => setInfoMessage(null), []);

  const setAreCoreServicesReady = useCallback((isReady: boolean) => {
    setAreCoreServicesReadyState(isReady);
  }, []);


  return (
    <AppContext.Provider value={{
      isLoading,
      setGlobalLoading: setIsLoading,
      areCoreServicesReady, 
      setAreCoreServicesReady,
      displayMessage,
      successMessage,
      errorMessage,
      warningMessage,
      infoMessage,
      clearSuccessMessage,
      clearErrorMessage,
      clearWarningMessage,
      clearInfoMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): IAppContext => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
