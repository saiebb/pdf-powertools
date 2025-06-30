// نسخة مبسطة من OrganizeExtractTool بدون thumbnails
import React from 'react';
import { UploadedFile, ToolId } from '../../types';
import { Button } from '../../components/uiElements';
import { RotateCcw, Trash2, ChevronUp, ChevronDown, Download, FileOutput, FileText } from 'lucide-react';
import { useOrganizeExtractToolSimple } from './useOrganizeExtractToolSimple';
import { Spinner } from '../../components/uiElements';
import { useAppContext } from '../../contexts/AppContext';

interface OrganizeExtractToolProps {
  uploadedFile: UploadedFile | undefined;
  currentToolId: ToolId.ORGANIZE | ToolId.EXTRACT_PAGES;
}

export const OrganizeExtractToolSimple: React.FC<OrganizeExtractToolProps> = ({
  uploadedFile,
  currentToolId,
}) => {
  const { isLoading: isLoadingApp } = useAppContext();
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
  } = useOrganizeExtractToolSimple({ uploadedFile, currentToolId });

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
        {currentToolId === ToolId.ORGANIZE ? 'تنظيم صفحات PDF' : 'استخراج صفحات PDF'}
      </h3>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          📄 <strong>ملاحظة:</strong> هذه النسخة المبسطة تعمل بدون معاينة الصفحات لضمان الاستقرار. 
          يمكنك تنظيم الصفحات باستخدام أرقامها.
        </p>
      </div>

      {currentToolId === ToolId.ORGANIZE && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveOrganizedPdf}
            isLoading={isProcessingAction}
            disabled={isProcessingAction}
            icon={<Download size={18} />}
            className="bg-green-600 hover:bg-green-700"
          >
            حفظ الملف المنظم
          </Button>
        </div>
      )}

      {currentToolId === ToolId.EXTRACT_PAGES && (
        <div className="flex justify-end">
          <Button
            onClick={handleExtractPages}
            isLoading={isProcessingAction}
            disabled={isProcessingAction || Object.values(pageSelectionMap).every(selected => !selected)}
            icon={<FileOutput size={18} />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            استخراج الصفحات المحددة
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizablePdf.pages.map((pageInfo, index) => (
          <div
            key={pageInfo.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Page Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <FileText size={20} className="text-blue-600" />
                <span className="font-medium text-gray-900">
                  صفحة {index + 1}
                </span>
              </div>
              
              {currentToolId === ToolId.EXTRACT_PAGES && (
                <input
                  type="checkbox"
                  checked={pageSelectionMap[index] || false}
                  onChange={() => handleTogglePageSelection(index)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              )}
            </div>

            {/* Page Info */}
            <div className="text-sm text-gray-600 mb-4">
              <p>الدوران: {pageInfo.rotation}°</p>
              <p>الفهرس الأصلي: {pageInfo.originalIndex + 1}</p>
            </div>

            {/* Action Buttons */}
            {currentToolId === ToolId.ORGANIZE && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleRotatePage(pageInfo.id)}
                  disabled={isProcessingAction}
                  size="sm"
                  variant="ghost"
                  icon={<RotateCcw size={14} />}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  تدوير
                </Button>
                
                <Button
                  onClick={() => handleMovePage(pageInfo.id, 'up')}
                  disabled={isProcessingAction || index === 0}
                  size="sm"
                  variant="ghost"
                  icon={<ChevronUp size={14} />}
                  className="text-green-600 hover:bg-green-50"
                >
                  أعلى
                </Button>
                
                <Button
                  onClick={() => handleMovePage(pageInfo.id, 'down')}
                  disabled={isProcessingAction || index === organizablePdf.pages.length - 1}
                  size="sm"
                  variant="ghost"
                  icon={<ChevronDown size={14} />}
                  className="text-green-600 hover:bg-green-50"
                >
                  أسفل
                </Button>
                
                <Button
                  onClick={() => handleDeletePage(pageInfo.id)}
                  disabled={isProcessingAction || organizablePdf.pages.length <= 1}
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 size={14} />}
                  className="text-red-600 hover:bg-red-50"
                >
                  حذف
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {organizablePdf.pages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">لا توجد صفحات للعرض</p>
        </div>
      )}
    </div>
  );
};