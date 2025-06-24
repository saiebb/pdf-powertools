import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Type,
  Trash2,
  Copy,
  Move,
  RotateCw
} from 'lucide-react';

export type ContextualToolType = 'text' | 'image' | 'shape' | 'comment';

interface ContextualToolbarProps {
  isVisible: boolean;
  toolType: ContextualToolType;
  position: { x: number; y: number };
  selectedElement?: any;
  onAction: (action: string, value?: any) => void;
}

export const ContextualToolbar: React.FC<ContextualToolbarProps> = ({
  isVisible,
  toolType,
  position,
  selectedElement,
  onAction
}) => {
  if (!isVisible) return null;

  const renderTextTools = () => (
    <div className="flex items-center gap-1">
      {/* Text Formatting */}
      <button
        onClick={() => onAction('bold')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="عريض"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => onAction('italic')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="مائل"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => onAction('underline')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="تسطير"
      >
        <Underline size={16} />
      </button>

      <div className="w-px h-6 bg-[#D1D1D1] mx-1"></div>

      {/* Text Alignment */}
      <button
        onClick={() => onAction('alignLeft')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="محاذاة لليسار"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => onAction('alignCenter')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="محاذاة للوسط"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => onAction('alignRight')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="محاذاة لليمين"
      >
        <AlignRight size={16} />
      </button>

      <div className="w-px h-6 bg-[#D1D1D1] mx-1"></div>

      {/* Font Size */}
      <select
        onChange={(e) => onAction('fontSize', e.target.value)}
        className="px-2 py-1 text-sm border border-[#D1D1D1] rounded focus:border-[#1A82E2] focus:outline-none"
        defaultValue="12"
      >
        <option value="8">8</option>
        <option value="10">10</option>
        <option value="12">12</option>
        <option value="14">14</option>
        <option value="16">16</option>
        <option value="18">18</option>
        <option value="24">24</option>
        <option value="36">36</option>
      </select>

      <div className="w-px h-6 bg-[#D1D1D1] mx-1"></div>

      {/* Color */}
      <button
        onClick={() => onAction('textColor')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="لون النص"
      >
        <Palette size={16} />
      </button>
    </div>
  );

  const renderImageTools = () => (
    <div className="flex items-center gap-1">
      {/* Image Actions */}
      <button
        onClick={() => onAction('rotate')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="تدوير"
      >
        <RotateCw size={16} />
      </button>

      <div className="w-px h-6 bg-[#D1D1D1] mx-1"></div>

      {/* Size Controls */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#666666]">العرض:</label>
        <input
          type="number"
          defaultValue={selectedElement?.width || 100}
          onChange={(e) => onAction('resize', { width: parseInt(e.target.value) })}
          className="w-16 px-1 py-1 text-xs border border-[#D1D1D1] rounded focus:border-[#1A82E2] focus:outline-none"
        />
        <label className="text-xs text-[#666666]">الارتفاع:</label>
        <input
          type="number"
          defaultValue={selectedElement?.height || 100}
          onChange={(e) => onAction('resize', { height: parseInt(e.target.value) })}
          className="w-16 px-1 py-1 text-xs border border-[#D1D1D1] rounded focus:border-[#1A82E2] focus:outline-none"
        />
      </div>
    </div>
  );

  const renderShapeTools = () => (
    <div className="flex items-center gap-1">
      {/* Shape Properties */}
      <button
        onClick={() => onAction('fillColor')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="لون التعبئة"
      >
        <Palette size={16} />
      </button>

      <div className="w-px h-6 bg-[#D1D1D1] mx-1"></div>

      {/* Border Width */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#666666]">سمك الحد:</label>
        <select
          onChange={(e) => onAction('borderWidth', e.target.value)}
          className="px-2 py-1 text-sm border border-[#D1D1D1] rounded focus:border-[#1A82E2] focus:outline-none"
          defaultValue="1"
        >
          <option value="0">بدون حد</option>
          <option value="1">1px</option>
          <option value="2">2px</option>
          <option value="3">3px</option>
          <option value="5">5px</option>
        </select>
      </div>
    </div>
  );

  const renderCommentTools = () => (
    <div className="flex items-center gap-1">
      {/* Comment Actions */}
      <button
        onClick={() => onAction('reply')}
        className="px-3 py-1 text-sm bg-[#1A82E2] text-white rounded hover:bg-[#1668B8] transition-colors"
      >
        رد
      </button>
      <button
        onClick={() => onAction('resolve')}
        className="px-3 py-1 text-sm border border-[#28A745] text-[#28A745] rounded hover:bg-[#28A745] hover:text-white transition-colors"
      >
        حل
      </button>
    </div>
  );

  const renderCommonTools = () => (
    <div className="flex items-center gap-1">
      <div className="w-px h-6 bg-[#D1D1D1] mx-1"></div>
      
      {/* Common Actions */}
      <button
        onClick={() => onAction('copy')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="نسخ"
      >
        <Copy size={16} />
      </button>
      <button
        onClick={() => onAction('move')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors"
        title="نقل"
      >
        <Move size={16} />
      </button>
      <button
        onClick={() => onAction('delete')}
        className="p-2 hover:bg-[#E0E0E0] rounded transition-colors text-red-600"
        title="حذف"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div
      className="contextual-toolbar absolute z-50 bg-white border border-[#D1D1D1] rounded-lg shadow-lg p-2 flex items-center"
      style={{
        left: position.x,
        top: position.y - 50, // Position above the selected element
        transform: 'translateX(-50%)', // Center horizontally
      }}
    >
      {/* Tool-specific controls */}
      {toolType === 'text' && renderTextTools()}
      {toolType === 'image' && renderImageTools()}
      {toolType === 'shape' && renderShapeTools()}
      {toolType === 'comment' && renderCommentTools()}
      
      {/* Common tools for all types */}
      {renderCommonTools()}
    </div>
  );
};