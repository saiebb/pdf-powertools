import React, { useState, useRef } from 'react';
import { UploadedFile } from '../../types';
import { Button } from '../../components/uiElements';
import { Crop, Download, ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useCropPdfTool } from './useCropPdfTool';

interface CropPdfToolProps {
  uploadedFile: UploadedFile | undefined;
  onBackToTools?: () => void;
}

export const CropPdfTool: React.FC<CropPdfToolProps> = ({
  uploadedFile,
  onBackToTools,
}) => {
  const { displayMessage } = useAppContext();
  const {
    isProcessing,
    cropArea,
    setCropArea,
    selectedPageIndex,
    setSelectedPageIndex,
    cropMode,
    setCropMode,
    selectedPreset,
    setSelectedPreset,
    // customMargins,
    // setCustomMargins,
    applyCrop,
    previewCropWithPreset,
    totalPages,
    cropPresets,
  } = useCropPdfTool(uploadedFile, displayMessage);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!uploadedFile) {
    return (
      <div className="text-center py-8">
        <Crop size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-[var(--color-text-muted)]">الرجاء رفع ملف PDF أولاً.</p>
      </div>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cropMode !== 'custom' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setCurrentSelection({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !canvasRef.current || cropMode !== 'custom') return;
    
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
    
    setCropArea({
      x: currentSelection.x,
      y: currentSelection.y,
      width: currentSelection.width,
      height: currentSelection.height,
    });
    
    setIsSelecting(false);
    setSelectionStart(null);
    setCurrentSelection(null);
  };

  const previewArea = cropMode === 'preset' ? previewCropWithPreset() : cropArea;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Crop size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">قص ملفات PDF</h2>
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Crop size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">قص مستندات PDF</h3>
            <p className="text-sm text-blue-800">
              اختر بين الإعدادات المسبقة لإزالة الهوامش أو حدد منطقة قص مخصصة بالسحب بالماوس.
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
            <span className="text-gray-600">وضع القص:</span>
            <p className="font-medium">{cropMode === 'preset' ? 'إعدادات مسبقة' : 'قص مخصص'}</p>
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
              className={`relative bg-white border-2 border-dashed border-gray-300 rounded-lg ${
                cropMode === 'custom' ? 'cursor-crosshair' : 'cursor-default'
              }`}
              style={{ minHeight: '400px', aspectRatio: '210/297' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Crop Preview Area */}
              {previewArea && (
                <div
                  className="absolute bg-blue-500 bg-opacity-20 border-2 border-blue-600"
                  style={{
                    left: previewArea.x,
                    top: previewArea.y,
                    width: previewArea.width,
                    height: previewArea.height,
                  }}
                />
              )}
              
              {/* Current Selection (for custom mode) */}
              {currentSelection && cropMode === 'custom' && (
                <div
                  className="absolute bg-blue-500 bg-opacity-30 border-2 border-blue-600 border-dashed"
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
                  <Crop size={48} className="mx-auto mb-2" />
                  <p>
                    {cropMode === 'custom' 
                      ? 'اسحب لتحديد منطقة القص' 
                      : 'معاينة منطقة القص'
                    }
                  </p>
                  <p className="text-sm mt-1">الصفحة {selectedPageIndex + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Crop Mode Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">وضع القص</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cropMode"
                  value="preset"
                  checked={cropMode === 'preset'}
                  onChange={(e) => setCropMode(e.target.value as 'preset' | 'custom')}
                  className="ml-2"
                />
                <span className="text-sm">إعدادات مسبقة</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cropMode"
                  value="custom"
                  checked={cropMode === 'custom'}
                  onChange={(e) => setCropMode(e.target.value as 'preset' | 'custom')}
                  className="ml-2"
                />
                <span className="text-sm">قص مخصص</span>
              </label>
            </div>
          </div>

          {/* Preset Settings */}
          {cropMode === 'preset' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">الإعدادات المسبقة</h3>
              
              <div className="space-y-3">
                {cropPresets.map((preset, index) => (
                  <label key={index} className="flex items-start">
                    <input
                      type="radio"
                      name="preset"
                      checked={selectedPreset === preset}
                      onChange={() => setSelectedPreset(preset)}
                      className="mt-1 ml-2"
                    />
                    <div>
                      <div className="text-sm font-medium">{preset.name}</div>
                      <div className="text-xs text-gray-600">{preset.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Page Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">اختيار الصفحة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصفحة الحالية
                </label>
                <select
                  value={selectedPageIndex}
                  onChange={(e) => setSelectedPageIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <br />• اختر وضع القص المناسب
                  <br />• في الوضع المخصص: اسحب لتحديد المنطقة
                  <br />• استخدم الأزرار أدناه للتطبيق
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setCropArea(null)}
              disabled={!cropArea}
              variant="ghost"
              icon={<RotateCcw size={18} />}
              className="w-full"
            >
              مسح التحديد
            </Button>
            
            <Button
              onClick={() => applyCrop(false)}
              isLoading={isProcessing}
              disabled={!previewArea || isProcessing}
              icon={<Download size={18} />}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              تطبيق القص على الصفحة الحالية
            </Button>
            
            <Button
              onClick={() => applyCrop(true)}
              isLoading={isProcessing}
              disabled={!previewArea || isProcessing}
              icon={<Download size={18} />}
              className="w-full bg-blue-700 hover:bg-blue-800"
            >
              تطبيق القص على جميع الصفحات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};