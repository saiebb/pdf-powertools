
import React, { useState, useEffect, ReactNode, useRef } from 'react';
// import * as pdfLib from 'pdf-lib'; // No longer needed directly here for fontkit registration

import { FileUpload } from './components/FileUpload';
import { Button, Spinner, Alert } from './components/uiElements'; 
import { Tool, ToolId } from './types'; 
import {
  Users, Settings2, Lock, Image as ImageIconLucide, ArrowLeft,
  Scissors, FileOutput, FileImage, FileEdit, KeyRound, ClipboardType, Minimize2, FileText,
  FileSpreadsheet, Presentation, Code, FileCheck, EyeOff, Crop, 
  FolderOpen, Shield, Download, Upload, ChevronDown, ChevronUp, Search, X,
  type LucideIcon
} from 'lucide-react'; 

import { 
  fetchArabicFont,
  // Removed: ensureFontkitIsLoaded, registerFontkitWithPdfLib, getFontkitInstance
} from './lib/fontService';
import { 
  setupPdfJsWorker
} from './lib/pdfJsService';
// import { setupLocalPdfjs } from './lib/pdfjs-local-setup';
import { useAppContext } from './contexts/AppContext';

import { useFileLoader } from './lib/hooks/useFileLoader';

import { ProtectTool } from './features/ProtectTool/ProtectTool';
import { MergeTool } from './features/MergeTool/MergeTool';
// import { OrganizeExtractTool } from './features/OrganizeExtractTool/OrganizeExtractTool';
import { OrganizeExtractToolSimple } from './features/OrganizeExtractTool/OrganizeExtractToolSimple';
import { SplitTool } from './features/SplitTool/SplitTool';
import { PdfToTextTool } from './features/PdfToTextTool/PdfToTextTool';
import { PdfToImagesTool } from './features/PdfToImagesTool/PdfToImagesTool';
import { CompressPdfTool } from './features/CompressPdfTool/CompressPdfTool';
import { UnlockPdfTool } from './features/UnlockPdfTool/UnlockPdfTool';
import { ImageToPdfTool } from './features/ImageToPdfTool/ImageToPdfTool';
// import { AnnotatePdfTool } from './features/AnnotatePdfTool/AnnotatePdfTool';
// import { AdobeStyleAnnotatePdfTool } from './features/AnnotatePdfTool/AdobeStyleAnnotatePdfTool';
import { SimpleAnnotatePdfTool } from './features/AnnotatePdfTool/SimpleAnnotatePdfTool';
// أدوات التحويل إلى PDF
import { JpgToPdfTool } from './features/JpgToPdfTool/JpgToPdfTool';
import { WordToPdfTool } from './features/WordToPdfTool/WordToPdfTool';
import { PowerPointToPdfTool } from './features/PowerPointToPdfTool/PowerPointToPdfTool';
import { ExcelToPdfTool } from './features/ExcelToPdfTool/ExcelToPdfTool';
import { HtmlToPdfTool } from './features/HtmlToPdfTool/HtmlToPdfTool';
// أدوات التحويل من PDF
import { PdfToJpgTool } from './features/PdfToJpgTool/PdfToJpgTool';
import { PdfToWordTool } from './features/PdfToWordTool/PdfToWordTool';
import { PdfToPowerPointTool } from './features/PdfToPowerPointTool/PdfToPowerPointTool';
import { PdfToExcelTool } from './features/PdfToExcelTool/PdfToExcelTool';
import { PdfToPdfATool } from './features/PdfToPdfATool/PdfToPdfATool';
// أدوات جديدة
import { RedactPdfTool } from './features/RedactPdfTool/RedactPdfTool';
import { CropPdfTool } from './features/CropPdfTool/CropPdfTool';

// تعريف المجموعات
interface ToolGroup {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tools: Tool[];
}

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
  // أدوات التحويل إلى PDF
  { id: ToolId.JPG_TO_PDF, name: "JPG إلى PDF", description: "تحويل صور JPG إلى ملف PDF.", icon: FileImage, acceptMultipleFiles: true, acceptMimeType: "image/jpeg,image/jpg", allowAddingMoreFiles: true },
  { id: ToolId.WORD_TO_PDF, name: "Word إلى PDF", description: "تحويل مستندات Word إلى PDF.", icon: FileText, acceptMultipleFiles: true, acceptMimeType: ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document", allowAddingMoreFiles: true },
  { id: ToolId.POWERPOINT_TO_PDF, name: "PowerPoint إلى PDF", description: "تحويل عروض PowerPoint إلى PDF.", icon: Presentation, acceptMultipleFiles: true, acceptMimeType: ".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation", allowAddingMoreFiles: true },
  { id: ToolId.EXCEL_TO_PDF, name: "Excel إلى PDF", description: "تحويل جداول Excel إلى PDF.", icon: FileSpreadsheet, acceptMultipleFiles: true, acceptMimeType: ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", allowAddingMoreFiles: true },
  { id: ToolId.HTML_TO_PDF, name: "HTML إلى PDF", description: "تحويل صفحات HTML إلى PDF.", icon: Code, acceptMultipleFiles: true, acceptMimeType: ".html,.htm,text/html", allowAddingMoreFiles: true },
  // أدوات التحويل من PDF
  { id: ToolId.PDF_TO_JPG, name: "PDF إلى JPG", description: "تحويل صفحات PDF إلى صور JPG.", icon: FileImage, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.PDF_TO_WORD, name: "PDF إلى Word", description: "تحويل PDF إلى مستند Word.", icon: FileText, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.PDF_TO_POWERPOINT, name: "PDF إلى PowerPoint", description: "تحويل PDF إلى عرض تقديمي.", icon: Presentation, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.PDF_TO_EXCEL, name: "PDF إلى Excel", description: "تحويل PDF إلى جدول بيانات.", icon: FileSpreadsheet, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.PDF_TO_PDFA, name: "PDF إلى PDF/A", description: "تحويل PDF إلى PDF/A للأرشفة.", icon: FileCheck, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  // أدوات جديدة
  { id: ToolId.REDACT_PDF, name: "تنقيح PDF", description: "تنقيح النص والرسومات لإزالة المعلومات الحساسة بشكل دائم من ملف PDF.", icon: EyeOff, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
  { id: ToolId.CROP_PDF, name: "قص ملفات PDF", description: "قص الهوامش من مستندات PDF أو حدد مناطق معينة، ثم طبِّق التغييرات على صفحة واحدة أو على المستند بأكمله.", icon: Crop, acceptMultipleFiles: false, acceptMimeType: "application/pdf" },
];

// تنظيم الأدوات في مجموعات
const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'organize',
    name: 'تنظيم وإدارة PDF',
    description: 'أدوات لتنظيم وإدارة ملفات PDF',
    icon: FolderOpen,
    color: 'blue',
    tools: TOOLS.filter(tool => [
      ToolId.MERGE, 
      ToolId.ORGANIZE, 
      ToolId.SPLIT_PDF, 
      ToolId.EXTRACT_PAGES,
      ToolId.COMPRESS_PDF
    ].includes(tool.id))
  },
  {
    id: 'convert-to-pdf',
    name: 'التحويل إلى PDF',
    description: 'تحويل الملفات والصور إلى PDF',
    icon: Upload,
    color: 'green',
    tools: TOOLS.filter(tool => [
      ToolId.IMAGE_TO_PDF,
      ToolId.JPG_TO_PDF,
      ToolId.WORD_TO_PDF,
      ToolId.POWERPOINT_TO_PDF,
      ToolId.EXCEL_TO_PDF,
      ToolId.HTML_TO_PDF
    ].includes(tool.id))
  },
  {
    id: 'convert-from-pdf',
    name: 'التحويل من PDF',
    description: 'تحويل PDF إلى تنسيقات أخرى',
    icon: Download,
    color: 'purple',
    tools: TOOLS.filter(tool => [
      ToolId.PDF_TO_IMAGES,
      ToolId.PDF_TO_JPG,
      ToolId.PDF_TO_TEXT,
      ToolId.PDF_TO_WORD,
      ToolId.PDF_TO_POWERPOINT,
      ToolId.PDF_TO_EXCEL,
      ToolId.PDF_TO_PDFA
    ].includes(tool.id))
  },
  {
    id: 'edit-security',
    name: 'التحرير والحماية',
    description: 'تحرير وحماية ملفات PDF',
    icon: Shield,
    color: 'red',
    tools: TOOLS.filter(tool => [
      ToolId.ANNOTATE_PDF,
      ToolId.PROTECT,
      ToolId.UNLOCK_PDF,
      ToolId.REDACT_PDF,
      ToolId.CROP_PDF
    ].includes(tool.id))
  }
];


const App: React.FC = () => {
  const [currentToolId, setCurrentToolId] = useState<ToolId | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['organize'])); // افتح المجموعة الأولى افتراضياً
  const [searchQuery, setSearchQuery] = useState<string>('');
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
            // const reasonMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
            
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

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        header: 'bg-blue-100',
        hover: 'hover:bg-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        header: 'bg-green-100',
        hover: 'hover:bg-green-200'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        header: 'bg-purple-100',
        hover: 'hover:bg-purple-200'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        header: 'bg-red-100',
        hover: 'hover:bg-red-200'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  // دالة البحث والتصفية
  const getFilteredGroups = () => {
    if (!searchQuery.trim()) {
      return TOOL_GROUPS;
    }

    const query = searchQuery.toLowerCase().trim();
    return TOOL_GROUPS.map(group => ({
      ...group,
      tools: group.tools.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      )
    })).filter(group => group.tools.length > 0);
  };

  // تأثير البحث على المجموعات المفتوحة
  const filteredGroups = getFilteredGroups();
  
  // فتح جميع المجموعات عند البحث
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpandedGroups(new Set(filteredGroups.map(g => g.id)));
    }
  }, [searchQuery, filteredGroups.length]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K للتركيز على البحث
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder="ابحث في الأدوات..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape لمسح البحث
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const handleRawFilesSelected = (rawFiles: File[]) => {
    clearSuccessMessage(); clearErrorMessage(); clearWarningMessage(); clearInfoMessage();
    if (currentTool) {
      processAndStoreFiles(rawFiles, currentTool);
    } else {
      displayMessage('warning', "الرجاء اختيار أداة أولاً قبل رفع الملفات.");
    }
  };
  
  const renderHomePage = (): ReactNode => (
    <div className="w-full max-w-6xl mx-auto text-center py-8 px-4">
      <h1 className="text-4xl font-bold text-[var(--color-text-base)] mb-4 sm:text-5xl arabic-text">محرر PDF متعدد الأدوات</h1>
      <p className="text-lg text-[var(--color-text-muted)] mb-6 sm:text-xl arabic-text">اختر أداة من المجموعات أدناه للبدء في تعديل ملفات PDF الخاصة بك بسهولة وسرعة.</p>
      
      {/* إحصائيات سريعة */}
      {!searchQuery && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          {TOOL_GROUPS.map(group => {
            const colorClasses = getColorClasses(group.color);
            return (
              <div key={group.id} className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg p-3 text-center`}>
                <group.icon size={24} className={`mx-auto mb-2 ${colorClasses.icon}`} />
                <div className="text-lg font-bold text-[var(--color-text-base)]">{group.tools.length}</div>
                <div className="text-xs text-[var(--color-text-muted)] arabic-text">{group.name}</div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* شريط البحث */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="ابحث في الأدوات... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-10 py-3 border-2 border-[var(--color-border)] rounded-lg focus:border-[var(--color-primary)] focus:outline-none transition-colors duration-200 text-right arabic-text focus-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200"
              aria-label="مسح البحث"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-[var(--color-text-muted)] mt-2 arabic-text">
            تم العثور على {filteredGroups.reduce((total, group) => total + group.tools.length, 0)} أداة
          </p>
        )}
      </div>
      
      <div className="space-y-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => {
            const isExpanded = expandedGroups.has(group.id);
            const colorClasses = getColorClasses(group.color);
          
          return (
            <div 
              key={group.id} 
              className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-xl shadow-lg overflow-hidden transition-all duration-300`}
            >
              {/* رأس المجموعة */}
              <button
                onClick={() => toggleGroupExpansion(group.id)}
                className={`w-full ${colorClasses.header} ${colorClasses.hover} p-4 flex items-center justify-between group-header focus-ring`}
                aria-expanded={isExpanded}
                aria-controls={`group-${group.id}`}
              >
                <div className="flex items-center text-right">
                  <group.icon size={32} className={`ml-4 ${colorClasses.icon} icon-bounce`} />
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-base)] arabic-text">{group.name}</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 arabic-text">{group.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${colorClasses.icon} ml-2`}>
                    {group.tools.length} أداة
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={24} className={colorClasses.icon} />
                  ) : (
                    <ChevronDown size={24} className={colorClasses.icon} />
                  )}
                </div>
              </button>

              {/* محتوى المجموعة */}
              <div 
                id={`group-${group.id}`}
                className={`group-expand-animation ${
                  isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="p-6 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {group.tools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="bg-white p-4 rounded-lg shadow-md tool-card focus-ring flex flex-col items-center text-center group arabic-text"
                        aria-label={tool.name}
                      >
                        <tool.icon 
                          size={32} 
                          className={`mb-3 ${colorClasses.icon} group-hover:scale-110 transition-transform duration-200 icon-bounce`} 
                        />
                        <h3 className="text-sm font-semibold text-[var(--color-text-base)] mb-1 leading-tight">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-text-base)] mb-2 arabic-text">لم يتم العثور على أدوات</h3>
            <p className="text-[var(--color-text-muted)] arabic-text">جرب البحث بكلمات مختلفة أو امسح البحث لعرض جميع الأدوات</p>
            <Button
              onClick={() => setSearchQuery('')}
              variant="ghost"
              className="mt-4"
            >
              مسح البحث
            </Button>
          </div>
        )}
      </div>

      {/* زر لتوسيع/طي جميع المجموعات */}
      {filteredGroups.length > 0 && !searchQuery && (
        <div className="mt-8 flex justify-center gap-4">
          <Button
            onClick={() => setExpandedGroups(new Set(filteredGroups.map(g => g.id)))}
            variant="ghost"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] arabic-text"
          >
            توسيع الكل
          </Button>
          <Button
            onClick={() => setExpandedGroups(new Set())}
            variant="ghost"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] arabic-text"
          >
            طي الكل
          </Button>
        </div>
      )}
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
            return <OrganizeExtractToolSimple
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
            return <SimpleAnnotatePdfTool uploadedFile={singleUploadedFile} onBackToTools={handleBackToTools} />;
        // أدوات التحويل إلى PDF
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
        // أدوات التحويل من PDF
        case ToolId.PDF_TO_JPG:
            return <PdfToJpgTool uploadedFile={singleUploadedFile} />;
        case ToolId.PDF_TO_WORD:
            return <PdfToWordTool uploadedFile={singleUploadedFile} />;
        case ToolId.PDF_TO_POWERPOINT:
            return <PdfToPowerPointTool uploadedFile={singleUploadedFile} />;
        case ToolId.PDF_TO_EXCEL:
            return <PdfToExcelTool uploadedFile={singleUploadedFile} />;
        case ToolId.PDF_TO_PDFA:
            return <PdfToPdfATool uploadedFile={singleUploadedFile} />;
        // أدوات جديدة
        case ToolId.REDACT_PDF:
            return <RedactPdfTool uploadedFile={singleUploadedFile} onBackToTools={handleBackToTools} />;
        case ToolId.CROP_PDF:
            return <CropPdfTool uploadedFile={singleUploadedFile} onBackToTools={handleBackToTools} />;
        default:
            return <p className="text-center text-[var(--color-text-muted)]">الأداة المحددة غير متاحة حاليًا أو لم يتم التعرف عليها.</p>;
    }
  };

  const renderToolScreen = () => {
    if (!currentTool) return null;

    // Special handling for PDF annotation tool
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