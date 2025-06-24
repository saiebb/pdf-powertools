
import React from 'react';
import { UploadedFile, ToolId } from '../../types';
import { Button } from '../../components/uiElements';
import { RotateCcw, Trash2, ChevronUp, ChevronDown, Download, FileOutput } from 'lucide-react';
import { useOrganizeExtractTool } from './useOrganizeExtractTool';
import { Spinner } from '../../components/uiElements';
import { useAppContext } from '../../contexts/AppContext';

interface OrganizeExtractToolProps {
  uploadedFile: UploadedFile | undefined;
  currentToolId: ToolId.ORGANIZE | ToolId.EXTRACT_PAGES;
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
  // setIsAppLoading: (isLoading: boolean) => void; // Removed
}

export const OrganizeExtractTool: React.FC<OrganizeExtractToolProps> = ({
  uploadedFile,
  currentToolId,
}) => {
  const { isLoading: isLoadingApp } = useAppContext(); // Get global loading from context
  const {
    organizablePdf,
    pageSelectionMap,
    isProcessingAction, 
    handleRotatePage,
    handleDeletePage,
    handleMovePage,
    handleSaveOrganizedPdf,
    handleTogglePageSelection,
    handleExtractPages,
  } = useOrganizeExtractTool({ uploadedFile, currentToolId }); // Props removed, hook uses context

  if (isLoadingApp && !organizablePdf) {
    return <Spinner text="جاري تحضير الصفحات..." className="my-4" />;
  }
  
  if (!uploadedFile) {
     return <p className="text-center text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>;
  }

  if (!organizablePdf) {
    return <p className="text-center text-[var(--color-text-muted)]">جاري تحميل الصفحات أو حدث خطأ...</p>;
  }


  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--color-text-base)]">
        {currentToolId === ToolId.ORGANIZE ? "تنظيم الصفحات:" : "تحديد الصفحات للاستخراج:"}
      </h3>
      {organizablePdf.pages.length === 0 && <p className="text-slate-500">لا توجد صفحات لعرضها.</p>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2 bg-slate-50 rounded-md border border-[var(--color-border)]">
        {organizablePdf.pages.map((pageInfo, index) => (
          <div key={pageInfo.id} className="p-2 border border-[var(--color-border)] rounded-md bg-[var(--color-card-background)] shadow-sm flex flex-col items-center text-center">
            {pageInfo.thumbnailUrl ? (
              <img 
                src={pageInfo.thumbnailUrl} 
                alt={`Page ${pageInfo.originalIndex + 1}`} 
                className="w-full h-auto object-contain rounded-sm mb-2 border border-[var(--color-border)] min-h-[50px] bg-slate-200" 
                style={{transform: `rotate(${pageInfo.rotation}deg)`}}
              />
            ) : (
              <div className="w-full min-h-[70px] flex items-center justify-center bg-slate-200 rounded-sm mb-2 border border-[var(--color-border)] text-xs text-slate-500" style={{transform: `rotate(${pageInfo.rotation}deg)`}}>
                معاينة
              </div>
            )}
            <p className="text-xs text-[var(--color-text-muted)] mb-2">صفحة {pageInfo.originalIndex + 1}</p>
            
            {currentToolId === ToolId.ORGANIZE && (
              <div className="flex flex-wrap gap-1 justify-center">
                <Button size="sm" variant="ghost" onClick={() => handleRotatePage(pageInfo.id, 'cw')} title="تدوير لليمين"><RotateCcw size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleRotatePage(pageInfo.id, 'ccw')} title="تدوير لليسار" className="transform scale-x-[-1]"><RotateCcw size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDeletePage(pageInfo.id)} title="حذف"><Trash2 size={14} className="text-[var(--color-danger)]" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleMovePage(pageInfo.id, 'up')} disabled={index === 0} title="تحريك لأعلى"><ChevronUp size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleMovePage(pageInfo.id, 'down')} disabled={index === organizablePdf.pages.length - 1} title="تحريك لأسفل"><ChevronDown size={14} /></Button>
              </div>
            )}

            {currentToolId === ToolId.EXTRACT_PAGES && (
              <div className="flex items-center mt-1">
                <input 
                  type="checkbox" 
                  id={`select-page-${pageInfo.originalIndex}`} 
                  checked={!!pageSelectionMap[pageInfo.originalIndex]} 
                  onChange={() => handleTogglePageSelection(pageInfo.originalIndex)} 
                  className="h-4 w-4 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <label 
                  htmlFor={`select-page-${pageInfo.originalIndex}`} 
                  className="ml-2 text-xs text-[var(--color-text-base)] cursor-pointer"
                >
                  تحديد
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Button 
        onClick={currentToolId === ToolId.ORGANIZE ? handleSaveOrganizedPdf : handleExtractPages} 
        isLoading={isProcessingAction} 
        icon={currentToolId === ToolId.ORGANIZE ? <Download size={18}/> : <FileOutput size={18}/>} 
        className="w-full md:w-auto"
        disabled={isLoadingApp || isProcessingAction || (currentToolId === ToolId.EXTRACT_PAGES && Object.values(pageSelectionMap).every(isSelected => !isSelected)) || organizablePdf.pages.length === 0}
      >
        {currentToolId === ToolId.ORGANIZE ? 'حفظ الملف المنظم' : 'استخراج الصفحات المحددة'}
      </Button>
    </div>
  );
};