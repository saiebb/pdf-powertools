import React, { useState, useRef } from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { EyeOff, Download, ArrowLeft, Trash2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useRedactPdfTool } from './useRedactPdfTool';

interface RedactPdfToolProps {
  uploadedFile: UploadedFile | undefined;
  onBackToTools?: () => void;
}

export const RedactPdfTool: React.FC<RedactPdfToolProps> = ({
  uploadedFile,
  onBackToTools,
}) => {
  const { displayMessage } = useAppContext();
  const {
    isProcessing,
    redactionAreas,
    selectedPageIndex,
    setSelectedPageIndex,
    addRedactionArea,
    removeRedactionArea,
    clearAllRedactionAreas,
    applyRedaction,
    getRedactionAreasForPage,
    totalPages,
  } = useRedactPdfTool(uploadedFile, displayMessage);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!uploadedFile) {
    return (
      <div className="text-center py-8">
        <EyeOff size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>
      </div>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setCurrentSelection({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const width = currentX - selectionStart.x;
    const height = currentY - selectionStart.y;
    
    setCurrentSelection({
      x: width < 0 ? currentX : selectionStart.x,
      y: height < 0 ? currentY : selectionStart.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !currentSelection || currentSelection.width < 10 || currentSelection.height < 10) {
      setIsSelecting(false);
      setSelectionStart(null);
      setCurrentSelection(null);
      return;
    }
    
    addRedactionArea({
      pageIndex: selectedPageIndex,
      x: currentSelection.x,
      y: currentSelection.y,
      width: currentSelection.width,
      height: currentSelection.height,
    });
    
    setIsSelecting(false);
    setSelectionStart(null);
    setCurrentSelection(null);
  };

  const currentPageAreas = getRedactionAreasForPage(selectedPageIndex);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center space-x-3 space-x-reverse">
          <EyeOff size={24} className="text-red-600" />
          <h2 className="text-xl font-bold text-gray-900">تنقيح PDF</h2>
        </div>
        {onBackToTools && (
          <Button
            onClick={onBackToTools}
            variant="ghost"
            icon={<ArrowLeft size={18} />}
          >
            العودة للأدوات
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3 space-x-reverse">
          <EyeOff size={20} className="text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900 mb-1">تنقيح المعلومات الحساسة</h3>
            <p className="text-sm text-red-800">
              اسحب بالماوس لتحديد المناطق المراد تنقيحها. سيتم تغطية هذه المناطق بمربعات سوداء بشكل دائم.
            </p>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">معلومات الملف</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">اسم الملف:</span>
            <p className="font-medium truncate">{uploadedFile.file.name}</p>
          </div>
          <div>
            <span className="text-gray-600">عدد الصفحات:</span>
            <p className="font-medium">{totalPages}</p>
          </div>
          <div>
            <span className="text-gray-600">المناطق المحددة:</span>
            <p className="font-medium">{redactionAreas.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Preview Area */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">معاينة الصفحة</h3>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  onClick={() => setSelectedPageIndex(Math.max(0, selectedPageIndex - 1))}
                  disabled={selectedPageIndex === 0}
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight size={16} />}
                >
                  السابق
                </Button>
                <span className="text-sm text-gray-600">
                  {selectedPageIndex + 1} من {totalPages}
                </span>
                <Button
                  onClick={() => setSelectedPageIndex(Math.min(totalPages - 1, selectedPageIndex + 1))}
                  disabled={selectedPageIndex === totalPages - 1}
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft size={16} />}
                >
                  التالي
                </Button>
              </div>
            </div>
            
            {/* PDF Canvas Area */}
            <div
              ref={canvasRef}
              className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair"
              style={{ minHeight: '400px', aspectRatio: '210/297' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Existing Redaction Areas */}
              {currentPageAreas.map(area => (
                <div
                  key={area.id}
                  className="absolute bg-red-500 bg-opacity-50 border-2 border-red-600 cursor-pointer"
                  style={{
                    left: area.x,
                    top: area.y,
                    width: area.width,
                    height: area.height,
                  }}
                  onClick={() => removeRedactionArea(area.id)}
                  title="انقر للحذف"
                />
              ))}
              
              {/* Current Selection */}
              {currentSelection && (
                <div
                  className="absolute bg-red-500 bg-opacity-30 border-2 border-red-600 border-dashed"
                  style={{
                    left: currentSelection.x,
                    top: currentSelection.y,
                    width: currentSelection.width,
                    height: currentSelection.height,
                  }}
                />
              )}
              
              {/* Placeholder Text */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <EyeOff size={48} className="mx-auto mb-2" />
                  <p>اسحب لتحديد المناطق المراد تنقيحها</p>
                  <p className="text-sm mt-1">الصفحة {selectedPageIndex + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">إعدادات التنقيح</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصفحة الحالية
                </label>
                <select
                  value={selectedPageIndex}
                  onChange={(e) => setSelectedPageIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i} value={i}>
                      الصفحة {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>تعليمات:</strong>
                  <br />• اسحب بالماوس لتحديد منطقة
                  <br />• انقر على المنطقة المحددة لحذفها
                  <br />• استخدم الأزرار أدناه للتحكم
                </p>
              </div>
            </div>
          </div>

          {/* Redaction Areas List */}
          {currentPageAreas.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">المناطق المحددة للصفحة الحالية</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentPageAreas.map((area, index) => (
                  <div key={area.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm text-gray-600">منطقة {index + 1}</span>
                    <Button
                      onClick={() => removeRedactionArea(area.id)}
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      className="text-red-600 hover:text-red-700"
                    >
                      حذف
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={clearAllRedactionAreas}
              disabled={redactionAreas.length === 0}
              variant="ghost"
              icon={<RotateCcw size={18} />}
              className="w-full"
            >
              مسح جميع التحديدات
            </Button>
            
            <Button
              onClick={() => applyRedaction(false)}
              isLoading={isProcessing}
              disabled={redactionAreas.length === 0 || isProcessing}
              icon={<Download size={18} />}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              تطبيق التنقيح على الصفحات المحددة
            </Button>
            
            <Button
              onClick={() => applyRedaction(true)}
              isLoading={isProcessing}
              disabled={getRedactionAreasForPage(selectedPageIndex).length === 0 || isProcessing}
              icon={<Download size={18} />}
              className="w-full bg-red-700 hover:bg-red-800"
            >
              تطبيق على جميع الصفحات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
