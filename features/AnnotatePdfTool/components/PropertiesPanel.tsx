import React from 'react';
import { X, Settings, MessageSquare, Type, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { Button } from '../../../components/uiElements';
import { ToolType } from './LeftToolbar';

interface Annotation {
  id: string;
  type: 'text' | 'image';
  text?: string;
  originalFileName?: string;
}

interface PropertiesPanelProps {
  isVisible: boolean;
  onClose: () => void;
  activeTool: ToolType;
  currentPageIndex: number;
  annotations: Annotation[];
  
  // Text annotation props
  textInput: { text: string; x: number; y: number; fontSize: number };
  onTextInputChange: (input: { text: string; x: number; y: number; fontSize: number }) => void;
  
  // Image annotation props
  imageFile: File | null;
  imageCoords: { x: number; y: number; width: number; height?: number };
  onImageFileChange: (file: File | null) => void;
  onImageCoordsChange: (coords: { x: number; y: number; width: number; height?: number }) => void;
  
  // Actions
  onAddAnnotation: () => void;
  onSaveDocument: () => void;
  isProcessing: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  isVisible,
  onClose,
  activeTool,
  currentPageIndex,
  annotations,
  textInput,
  onTextInputChange,
  imageFile,
  imageCoords,
  onImageFileChange,
  onImageCoordsChange,
  onAddAnnotation,
  onSaveDocument,
  isProcessing
}) => {
  if (!isVisible) return null;

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    onImageFileChange(file);
  };

  return (
    <div className="properties-panel w-[320px] bg-[#F9F9F9] border-l border-[#D1D1D1] flex flex-col adobe-panel panel-slide-in-right">
      {/* Header */}
      <div className="h-12 bg-[#ECECEC] border-b border-[#D1D1D1] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-[#555555]" />
          <span className="text-sm font-medium text-[#333333]">خصائص الأدوات</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#D1D1D1] rounded transition-colors"
          title="إغلاق"
        >
          <X size={16} className="text-[#555555]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 adobe-scrollbar">
        
        {/* Text Tool Properties */}
        {(activeTool === 'addText' || activeTool === 'edit') && (
          <div className="bg-white rounded-lg border border-[#D1D1D1] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Type size={16} className="text-[#1A82E2]" />
              <h3 className="text-sm font-semibold text-[#333333]">إضافة نص</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1">
                  النص
                </label>
                <textarea
                  value={textInput.text}
                  onChange={(e) => onTextInputChange({ ...textInput, text: e.target.value })}
                  placeholder="اكتب النص هنا..."
                  className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm resize-none h-20 focus:border-[#1A82E2] focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1">
                    X
                  </label>
                  <input
                    type="number"
                    value={textInput.x}
                    onChange={(e) => onTextInputChange({ ...textInput, x: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1">
                    Y
                  </label>
                  <input
                    type="number"
                    value={textInput.y}
                    onChange={(e) => onTextInputChange({ ...textInput, y: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1">
                    الحجم
                  </label>
                  <input
                    type="number"
                    value={textInput.fontSize}
                    onChange={(e) => onTextInputChange({ ...textInput, fontSize: parseInt(e.target.value) || 12 })}
                    className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
                  />
                </div>
              </div>
              
              <Button
                onClick={onAddAnnotation}
                isLoading={isProcessing}
                disabled={!textInput.text.trim()}
                size="sm"
                icon={<PlusCircle size={16} />}
                className="w-full bg-[#1A82E2] hover:bg-[#1668B8] text-white"
              >
                إضافة النص
              </Button>
            </div>
          </div>
        )}

        {/* Image Tool Properties */}
        {activeTool === 'image' && (
          <div className="bg-white rounded-lg border border-[#D1D1D1] p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon size={16} className="text-[#1A82E2]" />
              <h3 className="text-sm font-semibold text-[#333333]">إضافة صورة</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#666666] mb-1">
                  اختيار صورة
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageFileChange}
                  className="w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#1A82E2] file:text-white hover:file:bg-[#1668B8] file:cursor-pointer"
                />
              </div>
              
              {imageFile && (
                <div className="border border-[#D1D1D1] rounded-md p-2">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="معاينة" 
                    className="max-h-24 rounded border mx-auto"
                  />
                  <p className="text-xs text-[#666666] text-center mt-1">
                    {imageFile.name}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1">
                    X
                  </label>
                  <input
                    type="number"
                    value={imageCoords.x}
                    onChange={(e) => onImageCoordsChange({ ...imageCoords, x: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1">
                    Y
                  </label>
                  <input
                    type="number"
                    value={imageCoords.y}
                    onChange={(e) => onImageCoordsChange({ ...imageCoords, y: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1">
                    العرض
                  </label>
                  <input
                    type="number"
                    value={imageCoords.width}
                    onChange={(e) => onImageCoordsChange({ ...imageCoords, width: parseInt(e.target.value) || 100 })}
                    className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-1">
                    الارتفاع
                  </label>
                  <input
                    type="number"
                    value={imageCoords.height || ''}
                    onChange={(e) => onImageCoordsChange({ ...imageCoords, height: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="تلقائي"
                    className="w-full p-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
                  />
                </div>
              </div>
              
              <Button
                onClick={onAddAnnotation}
                isLoading={isProcessing}
                disabled={!imageFile}
                size="sm"
                icon={<PlusCircle size={16} />}
                className="w-full bg-[#1A82E2] hover:bg-[#1668B8] text-white"
              >
                إضافة الصورة
              </Button>
            </div>
          </div>
        )}

        {/* Current Page Annotations */}
        <div className="bg-white rounded-lg border border-[#D1D1D1] p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-[#1A82E2]" />
            <h3 className="text-sm font-semibold text-[#333333]">
              عناصر الصفحة {currentPageIndex + 1}
            </h3>
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {annotations.length > 0 ? (
              <div className="space-y-2">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="p-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {annotation.type === 'text' ? (
                        <Type size={12} className="text-[#666666]" />
                      ) : (
                        <ImageIcon size={12} className="text-[#666666]" />
                      )}
                      <span className="text-xs text-[#333333] truncate">
                        {annotation.type === 'text' 
                          ? `نص: ${annotation.text?.substring(0, 20)}...`
                          : `صورة: ${annotation.originalFileName || 'ملف صورة'}`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#999999] text-center py-4">
                لا توجد عناصر في هذه الصفحة
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#D1D1D1] bg-[#ECECEC]">
        <Button
          onClick={onSaveDocument}
          isLoading={isProcessing}
          className="w-full bg-[#28A745] hover:bg-[#218838] text-white"
          size="sm"
        >
          حفظ المستند
        </Button>
      </div>
    </div>
  );
};