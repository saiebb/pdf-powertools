import React from 'react';
import { 
  MousePointer2, 
  Edit3, 
  MessageSquare, 
  PenTool, 
  Shapes, 
  Ruler, 
  Type, 
  Eraser,
  // Palette,
  Image as ImageIcon,
  Highlighter,
  Underline,
  Pencil
} from 'lucide-react';

export type ToolType = 
  | 'select' 
  | 'edit' 
  | 'comment' 
  | 'fillSign' 
  | 'shapes' 
  | 'measure' 
  | 'addText' 
  | 'eraser'
  | 'highlight'
  | 'underline'
  | 'draw'
  | 'image';

interface LeftToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onThumbnailsToggle: () => void;
  showThumbnails: boolean;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

interface ToolButtonProps {
  tool: ToolType;
  icon: React.ReactNode;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
  hasSubTools?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ 
  // tool, 
  icon, 
  tooltip, 
  isActive, 
  onClick,
  hasSubTools = false 
}) => (
  <button
    onClick={onClick}
    className={`
      tool-button adobe-button w-12 h-12 flex items-center justify-center rounded-md adobe-transition adobe-focus
      ${isActive 
        ? 'bg-[#1A82E2] text-white shadow-md' 
        : 'text-[#555555] hover:bg-[#ECECEC] hover:text-[#1A82E2]'
      }
      ${hasSubTools ? 'relative' : ''}
    `}
    title={tooltip}
  >
    {icon}
    {hasSubTools && (
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#1A82E2] rounded-full"></div>
    )}
  </button>
);

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  onToolChange,
  onThumbnailsToggle,
  showThumbnails,
  selectedColor,
  onColorChange
}) => {
  const tools = [
    { tool: 'select' as ToolType, icon: <MousePointer2 size={20} />, tooltip: 'أداة التحديد (V)' },
    { tool: 'edit' as ToolType, icon: <Edit3 size={20} />, tooltip: 'تعديل النصوص والصور (E)' },
    { 
      tool: 'comment' as ToolType, 
      icon: <MessageSquare size={20} />, 
      tooltip: 'إضافة تعليق (C)', 
      hasSubTools: true 
    },
    { tool: 'fillSign' as ToolType, icon: <PenTool size={20} />, tooltip: 'تعبئة وتوقيع (S)' },
    { tool: 'shapes' as ToolType, icon: <Shapes size={20} />, tooltip: 'إضافة أشكال (R)' },
    { tool: 'measure' as ToolType, icon: <Ruler size={20} />, tooltip: 'أداة القياس (M)' },
    { tool: 'addText' as ToolType, icon: <Type size={20} />, tooltip: 'إضافة نص (T)' },
    { tool: 'image' as ToolType, icon: <ImageIcon size={20} />, tooltip: 'إضافة صورة (I)' },
    { tool: 'eraser' as ToolType, icon: <Eraser size={20} />, tooltip: 'ممحاة (D)' },
  ];

  // Sub-tools for comment tool
  const commentSubTools = [
    { tool: 'highlight' as ToolType, icon: <Highlighter size={16} />, tooltip: 'تمييز النص' },
    { tool: 'underline' as ToolType, icon: <Underline size={16} />, tooltip: 'تسطير النص' },
    { tool: 'draw' as ToolType, icon: <Pencil size={16} />, tooltip: 'رسم حر' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  return (
    <div className="left-toolbar w-[60px] bg-[#ECECEC] border-r border-[#D1D1D1] flex flex-col items-center py-4 gap-2 adobe-panel">
      {/* Main Tools */}
      <div className="flex flex-col gap-2">
        {tools.map(({ tool, icon, tooltip, hasSubTools }) => (
          <ToolButton
            key={tool}
            tool={tool}
            icon={icon}
            tooltip={tooltip}
            isActive={activeTool === tool}
            onClick={() => onToolChange(tool)}
            hasSubTools={hasSubTools}
          />
        ))}
      </div>

      {/* Sub-tools for comment (show when comment tool is active) */}
      {activeTool === 'comment' && (
        <div className="flex flex-col gap-1 mt-2 p-2 bg-white rounded-md shadow-md border border-[#D1D1D1]">
          {commentSubTools.map(({ tool, icon, tooltip }) => (
            <button
              key={tool}
              onClick={() => onToolChange(tool)}
              className={`
                w-8 h-8 flex items-center justify-center rounded transition-all
                ${activeTool === tool 
                  ? 'bg-[#1A82E2] text-white' 
                  : 'text-[#555555] hover:bg-[#F0F0F0]'
                }
              `}
              title={tooltip}
            >
              {icon}
            </button>
          ))}
        </div>
      )}

      {/* Color Picker */}
      <div className="mt-4">
        <div className="flex flex-col gap-1 p-2 bg-white rounded-md shadow-md border border-[#D1D1D1]">
          <div className="text-xs text-[#555555] text-center mb-1">اللون</div>
          <div className="grid grid-cols-2 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`
                  w-6 h-6 rounded border-2 transition-all
                  ${selectedColor === color 
                    ? 'border-[#1A82E2] scale-110' 
                    : 'border-[#D1D1D1] hover:border-[#999999]'
                  }
                `}
                style={{ backgroundColor: color }}
                title={`اختيار اللون ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails Toggle - at bottom */}
      <div className="mt-auto">
        <button
          onClick={onThumbnailsToggle}
          className={`
            w-12 h-12 flex items-center justify-center rounded-md transition-all
            ${showThumbnails 
              ? 'bg-[#1A82E2] text-white' 
              : 'text-[#555555] hover:bg-[#ECECEC]'
            }
          `}
          title="إظهار/إخفاء مصغرات الصفحات"
        >
          <div className="flex flex-col gap-1">
            <div className="w-3 h-2 bg-current rounded-sm"></div>
            <div className="w-3 h-2 bg-current rounded-sm"></div>
            <div className="w-3 h-2 bg-current rounded-sm"></div>
          </div>
        </button>
      </div>
    </div>
  );
};