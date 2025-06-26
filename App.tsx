
import React, { useState, useCallback, useEffect, ReactNode, useRef } from 'react';
// import * as pdfLib from 'pdf-lib'; // No longer needed directly here for fontkit registration

import { FileUpload } from './components/FileUpload';
import { Button, Spinner, Alert } from './components/uiElements'; 
import { Tool, ToolId, UploadedFile } from './types'; 
import {
  Users, Settings2, Lock, Image as ImageIconLucide, ArrowLeft,
  Scissors, FileOutput, FileImage, FileEdit, KeyRound, ClipboardType, Minimize2, FileText,
  FileSpreadsheet, Presentation, Code
} from 'lucide-react'; 

import { 
  fetchArabicFont,
  // Removed: ensureFontkitIsLoaded, registerFontkitWithPdfLib, getFontkitInstance
} from './lib/fontService';
import { 
  setupPdfJsWorker
} from './lib/pdfJsService';
import { useAppContext } from './contexts/AppContext';

import { useFileLoader } from './lib/hooks/useFileLoader';

import { ProtectTool } from './features/ProtectTool/ProtectTool';
import { MergeTool } from './features/MergeTool/MergeTool';
import { OrganizeExtractTool } from './features/OrganizeExtractTool/OrganizeExtractTool';
import { SplitTool } from './features/SplitTool/SplitTool';
import { PdfToTextTool } from './features/PdfToTextTool/PdfToTextTool';
import { PdfToImagesTool } from './features/PdfToImagesTool/PdfToImagesTool';
import { CompressPdfTool } from './features/CompressPdfTool/CompressPdfTool';
import { UnlockPdfTool } from './features/UnlockPdfTool/UnlockPdfTool';
import { ImageToPdfTool } from './features/ImageToPdfTool/ImageToPdfTool';
import { AnnotatePdfTool } from './features/AnnotatePdfTool/AnnotatePdfTool';
import { AdobeStyleAnnotatePdfTool } from './features/AnnotatePdfTool/AdobeStyleAnnotatePdfTool';
// أدوات التحويل الجديدة
import { JpgToPdfTool } from './features/JpgToPdfTool/JpgToPdfTool';
import { WordToPdfTool } from './features/WordToPdfTool/WordToPdfTool';
import { PowerPointToPdfTool } from './features/PowerPointToPdfTool/PowerPointToPdfTool';
import { ExcelToPdfTool } from './features/ExcelToPdfTool/ExcelToPdfTool';
import { HtmlToPdfTool } from './features/HtmlToPdfTool/HtmlToPdfTool';

const TOOLS: Tool[] = [
  { id: ToolId.MERGE, name: "دمج PDF", description: "دمج عدة ملفات PDF في ملف واحد.", icon: Users, acceptMultipleFiles: true, acceptMimeType: "application/pdf", allowAddingMoreFiles: true },
  { id: ToolId.ORGANIZE, name: "تنظيم PDF", description: "حذف، ترتيب، وتدوير صفحات PDF.", icon: Settings2, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.SPLIT_PDF, name: "تقسيم PDF", description: "تقسيم ملف PDF إلى عدة ملفات.", icon: Scissors, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.EXTRACT_PAGES, name: "استخراج الصفحات", description: "اختيار صفحات محددة من PDF.", icon: FileOutput, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.IMAGE_TO_PDF, name: "صور إلى PDF", description: "تحويل صور (JPG, PNG) إلى PDF.", icon: FileImage, acceptMultipleFiles: true, acceptMimeType: "image/jpeg,image/png", allowAddingMoreFiles: true },
  { id: ToolId.ANNOTATE_PDF, name: "تعديل PDF", description: "إضافة نصوص وصور لملف PDF.", icon: FileEdit, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.PROTECT, name: "حماية PDF", description: "إضافة كلمة مرور لملف PDF.", icon: Lock, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.PDF_TO_IMAGES, name: "PDF إلى صور", description: "تحويل صفحات PDF إلى صور PNG.", icon: ImageIconLucide, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.PDF_TO_TEXT, name: "PDF إلى نص", description: "استخراج النصوص من ملف PDF.", icon: ClipboardType, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.COMPRESS_PDF, name: "ضغط PDF", description: "تقليل حجم ملف PDF.", icon: Minimize2, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.UNLOCK_PDF, name: "إزالة حماية PDF", description: "محاولة إزالة قيود الحماية.", icon: KeyRound, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  // أدوات التحويل الجديدة
  { id: ToolId.JPG_TO_PDF, name: "JPG إلى PDF", description: "تحويل صور JPG إلى ملف PDF.", icon: FileImage, acceptMultipleFiles: true, acceptMimeType: "image/jpeg,image/jpg", allowAddingMoreFiles: true },
  { id: ToolId.WORD_TO_PDF, name: "Word إلى PDF", description: "تحويل مستندات Word إلى PDF.", icon: FileText, acceptMultipleFiles: true, acceptMimeType: ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document", allowAddingMoreFiles: true },
  { id: ToolId.POWERPOINT_TO_PDF, name: "PowerPoint إلى PDF", description: "تحويل عروض PowerPoint إلى PDF.", icon: Presentation, acceptMultipleFiles: true, acceptMimeType: ".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation", allowAddingMoreFiles: true },
  { id: ToolId.EXCEL_TO_PDF, name: "Excel إلى PDF", description: "تحويل جداول Excel إلى PDF.", icon: FileSpreadsheet, acceptMultipleFiles: true, acceptMimeType: ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", allowAddingMoreFiles: true },
  { id: ToolId.HTML_TO_PDF, name: "HTML إلى PDF", description: "تحويل صفحات HTML إلى PDF.", icon: Code, acceptMultipleFiles: true, acceptMimeType: ".html,.htm,text/html", allowAddingMoreFiles: true },
];


const App: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<ToolId | null>(null);
  const { 
    isLoading, 
    setGlobalLoading,
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
  } = useAppContext();
  
  const { loadedFiles, processAndStoreFiles, clearStoredFiles } = useFileLoader();
  
  const currentTool = TOOLS.find(t => t.id === currentToolId);

  // Add a ref to track if initialization is in progress
  const initializationInProgress = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (initializationInProgress.current) {
      console.log('Initialization already in progress, skipping...');
      return;
    }

    // Check if services are already ready
    if (areCoreServicesReady) {
      console.log('Core services are already ready, skipping initialization...');
      return;
    }

    initializationInProgress.current = true;
    setGlobalLoading(true);
    setAreCoreServicesReady(false);

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.warn('Safety timeout triggered - forcing initialization to complete');
      setGlobalLoading(false);
      setAreCoreServicesReady(true);
      initializationInProgress.current = false;
      displayMessage('warning', 'تم تحميل التطبيق مع إعدادات محدودة. قد تحتاج لإعادة تحميل الصفحة للحصول على جميع الميزات.', 10000);
    }, 15000); // 15 seconds timeout

    const initializeServices = async () => {
      try {
        const pdfJsPromise = setupPdfJsWorker();
        // Fontkit setup is removed. We still fetch the font.
        const arabicFontPromise = fetchArabicFont(); 

        // Promise.allSettled now includes pdfJsPromise and arabicFontPromise.
        const results = await Promise.allSettled([pdfJsPromise, arabicFontPromise]);
        
        let allSucceeded = true;
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            allSucceeded = false;
            // Updated service names for error reporting
            const serviceName = index === 0 ? "PDF.js" : "تحميل الخط العربي";
            console.error(`Service initialization failed for ${serviceName}:`, result.reason);
            const reasonMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
            
            // Show user-friendly error messages in Arabic
            let userMessage = '';
            if (index === 0) { // PDF.js error
              userMessage = 'فشل تحميل مكتبة PDF.js. التطبيق سيعمل بوظائف محدودة. يرجى إعادة تحميل الصفحة للمحاولة مرة أخرى.';
            } else { // Font loading error
              userMessage = 'فشل تحميل الخط العربي. قد يؤثر هذا على عرض النصوص العربية.';
            }
            
            displayMessage('error', userMessage, 15000);
          }
        });

        // Always set services as ready, but with different behavior based on what loaded
        setAreCoreServicesReady(true);
        
        if (allSucceeded) {
          console.log("All core services initialized successfully (PDF.js and Arabic font fetch). Fontkit is no longer used.");
        } else {
          console.warn("Some core services failed to initialize, but app will continue with limited functionality.");
          
          // Check specifically if PDF.js failed
          if (results[0].status === 'rejected') {
            console.warn("PDF.js failed to load - PDF-related features will be disabled");
            displayMessage('warning', 'بعض ميزات معالجة PDF غير متاحة حالياً. يرجى إعادة تحميل الصفحة.', 10000);
          }
        }

      } catch (error: any) { 
        console.error("Unexpected error during service initialization process:", error);
        displayMessage('error', `خطأ غير متوقع أثناء تهيئة الخدمات: ${error.message}`, 10000);
        // Still set as ready to prevent infinite reload loop
        setAreCoreServicesReady(true);
      } finally {
        // Clear the safety timeout since we're completing normally
        clearTimeout(safetyTimeout);
        setGlobalLoading(false);
        initializationInProgress.current = false; // Reset the flag
        console.log('Initialization completed - loading state set to false');
      }
    };

    initializeServices();
  }, []); // Empty dependency array to run only once on mount


  const resetState = (clearTool: boolean = true) => {
    if (clearTool) setCurrentToolId(null);
    clearStoredFiles();
    clearSuccessMessage();
    clearErrorMessage();
    clearWarningMessage();
    clearInfoMessage();
  };

  const handleToolSelect = (toolId: ToolId) => { 
    resetState(false); 
    setCurrentToolId(toolId); 
  };
  const handleBackToTools = () => { resetState(true); };

  const handleRawFilesSelected = (rawFiles: File[]) => {
    clearSuccessMessage(); clearErrorMessage(); clearWarningMessage(); clearInfoMessage();
    if (currentTool) {
      processAndStoreFiles(rawFiles, currentTool);
    } else {
      displayMessage('warning', "الرجاء اختيار أداة أولاً قبل رفع الملفات.");
    }
  };
  
  const renderHomePage = (): ReactNode => (
    <div className="w-full max-w-4xl mx-auto text-center py-8 px-4">
      <h1 className="text-4xl font-bold text-[var(--color-text-base)] mb-6 sm:text-5xl">محرر PDF متعدد الأدوات</h1>
      <p className="text-lg text-[var(--color-text-muted)] mb-10 sm:text-xl">اختر أداة من القائمة أدناه للبدء في تعديل ملفات PDF الخاصة بك بسهولة وسرعة.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className="bg-[var(--color-card-background)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 flex flex-col items-center text-center"
            aria-label={tool.name}
          >
            <tool.icon size={40} className="mb-4 text-[var(--color-primary)]" />
            <h3 className="text-md font-semibold text-[var(--color-text-base)] mb-1">{tool.name}</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const getFileUploadLabel = (): string => {
    if (!currentTool) return "اسحب وأفلت الملفات هنا، أو انقر للتصفح";
    const fileType = currentTool.acceptMimeType.includes("image") ? "صور" : "ملفات PDF";
    if (currentTool.allowAddingMoreFiles && currentTool.acceptMultipleFiles && loadedFiles.length > 0) return `اسحب المزيد من ${fileType} أو انقر للإضافة`;
    return `اسحب وأفلت ${fileType} ${currentTool.acceptMultipleFiles ? "(متعددة)" : "(ملف واحد)"} هنا، أو انقر للتصفح`;
  };

  const renderSpecificToolUI = () => {
    const singleUploadedFile = loadedFiles.length > 0 ? loadedFiles[0] : undefined;

    switch (currentTool?.id) {
        case ToolId.PROTECT:
            return <ProtectTool uploadedFile={singleUploadedFile} />;
        case ToolId.MERGE:
            return <MergeTool uploadedFiles={loadedFiles} />;
        case ToolId.ORGANIZE:
        case ToolId.EXTRACT_PAGES:
            return <OrganizeExtractTool
                        uploadedFile={singleUploadedFile}
                        currentToolId={currentTool.id as ToolId.ORGANIZE | ToolId.EXTRACT_PAGES}
                    />;
        case ToolId.SPLIT_PDF:
            return <SplitTool uploadedFile={singleUploadedFile} />;
        case ToolId.PDF_TO_TEXT:
            return <PdfToTextTool uploadedFile={singleUploadedFile} />;
        case ToolId.PDF_TO_IMAGES:
            return <PdfToImagesTool uploadedFile={singleUploadedFile} />;
        case ToolId.COMPRESS_PDF:
            return <CompressPdfTool uploadedFile={singleUploadedFile} />;
        case ToolId.UNLOCK_PDF:
            return <UnlockPdfTool uploadedFile={singleUploadedFile} />;
        case ToolId.IMAGE_TO_PDF:
            return <ImageToPdfTool uploadedFiles={loadedFiles} />;
        case ToolId.ANNOTATE_PDF:
            return <AdobeStyleAnnotatePdfTool uploadedFile={singleUploadedFile} onBackToTools={handleBackToTools} />;
        // أدوات التحويل الجديدة
        case ToolId.JPG_TO_PDF:
            return <JpgToPdfTool uploadedFiles={loadedFiles} />;
        case ToolId.WORD_TO_PDF:
            return <WordToPdfTool uploadedFiles={loadedFiles} />;
        case ToolId.POWERPOINT_TO_PDF:
            return <PowerPointToPdfTool uploadedFiles={loadedFiles} />;
        case ToolId.EXCEL_TO_PDF:
            return <ExcelToPdfTool uploadedFiles={loadedFiles} />;
        case ToolId.HTML_TO_PDF:
            return <HtmlToPdfTool uploadedFiles={loadedFiles} />;
        default:
            return <p className="text-center text-[var(--color-text-muted)]">الأداة المحددة غير متاحة حاليًا أو لم يتم التعرف عليها.</p>;
    }
  };

  const renderToolScreen = () => {
    if (!currentTool) return null;

    // Special handling for Adobe-style PDF annotation tool
    if (currentTool.id === ToolId.ANNOTATE_PDF && loadedFiles.length > 0) {
      return renderSpecificToolUI();
    }

    const showFileUpload = loadedFiles.length === 0 || 
                         (!!currentTool.allowAddingMoreFiles && currentTool.acceptMultipleFiles);
    
    const isToolCurrentlyProcessing = false; 

    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-[var(--color-card-background)] shadow-xl rounded-lg">
        <div className="mb-6">
            {showFileUpload ? (
                 <FileUpload onFilesUploaded={handleRawFilesSelected} acceptMultiple={currentTool.acceptMultipleFiles} acceptMimeType={currentTool.acceptMimeType} label={getFileUploadLabel()}/>
            ) : (
                 <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[var(--color-text-base)] mb-2">الملفات المحددة:</h3>
                    <ul className="space-y-1 mb-3 max-h-32 overflow-y-auto pr-1">
                        {loadedFiles.map(uf => (
                            <li key={uf.id} className="text-sm text-[var(--color-text-muted)] flex items-center p-1 bg-white rounded border">
                                {uf.file.type.startsWith('image/') ? <FileImage size={16} className="mr-2 text-purple-500 flex-shrink-0" /> : <FileText size={16} className="mr-2 text-[var(--color-primary)] flex-shrink-0" />}
                                <span className="truncate">{uf.file.name}</span>
                            </li>
                        ))}
                    </ul>
                    <Button onClick={() => { clearStoredFiles(); }} variant="ghost" size="sm">تغيير الملفات</Button>
                 </div>
            )}
        </div>

        {!isLoading && errorMessage && <Alert type="error" message={errorMessage} onClose={clearErrorMessage} />}
        {!isLoading && successMessage && <Alert type="success" message={successMessage} onClose={clearSuccessMessage} />}
        {!isLoading && warningMessage && <Alert type="warning" message={warningMessage} onClose={clearWarningMessage} />}
        {!isLoading && infoMessage && <Alert type="info" message={infoMessage} onClose={clearInfoMessage} />}
        
        {loadedFiles.length > 0 && !isToolCurrentlyProcessing && ( 
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-6">
            {renderSpecificToolUI()}
          </div>
        )}
      </div>
    );
  };
  
  if (isLoading) { 
    console.log('App render: isLoading is true, showing loading screen');
    console.log('App render: areCoreServicesReady:', areCoreServicesReady);
    console.log('App render: currentToolId:', currentToolId);
    console.log('App render: loadedFiles.length:', loadedFiles.length);
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center py-6 sm:py-12 px-2 md:px-4 text-[var(--color-text-base)]" dir="rtl">
        <Spinner text="جاري تهيئة التطبيق..." size="lg" />
      </div>
    );
  }

  if (!areCoreServicesReady && !isLoading) { 
     return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center py-6 sm:py-12 px-2 md:px-4 text-[var(--color-text-base)]" dir="rtl">
        <div className="text-center p-8 bg-white shadow-xl rounded-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">فشل تهيئة التطبيق</h1>
          <p className="text-slate-700 mb-6">لم نتمكن من تحميل المكونات الأساسية. يرجى المحاولة مرة أخرى أو التحقق من اتصالك بالإنترنت.</p>
          {errorMessage && <Alert type="error" message={errorMessage} onClose={clearErrorMessage} />}
          <Button onClick={() => window.location.reload()} className="mt-6">إعادة تحميل الصفحة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col text-[var(--color-text-base)]" dir="rtl">
      {currentTool ? (
        // Full-screen layout for Adobe-style PDF annotation tool
        currentTool.id === ToolId.ANNOTATE_PDF && loadedFiles.length > 0 ? (
          <div className="h-screen flex flex-col">
            {/* Back button overlay for full-screen tools */}
            <div className="absolute top-4 right-4 z-50">
              <Button 
                onClick={handleBackToTools} 
                variant="ghost" 
                className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-lg flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] group" 
                aria-label="العودة إلى الأدوات"
              >
                <ArrowLeft size={20} className="ml-2 transition-transform group-hover:translate-x-1 transform scale-x-[-1]" /> 
                العودة إلى الأدوات
              </Button>
            </div>
            {renderToolScreen()}
          </div>
        ) : (
          // Standard layout for other tools
          <div className="flex flex-col items-center py-6 sm:py-12 px-2 md:px-4">
            <div className="w-full">
              <Button 
                onClick={handleBackToTools} 
                variant="ghost" 
                className="mb-4 self-start flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] group" 
                aria-label="العودة إلى الأدوات"
              >
                <ArrowLeft size={20} className="ml-2 transition-transform group-hover:translate-x-1 transform scale-x-[-1]" /> 
                العودة إلى الأدوات
              </Button>
              {renderToolScreen()}
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center py-6 sm:py-12 px-2 md:px-4">
          {renderHomePage()}
        </div>
      )}
    </div>
  );
};

export default App;