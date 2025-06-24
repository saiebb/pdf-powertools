import React from 'react';
import { 
  Search, 
  Share2, 
  Bell, 
  User, 
  Bot,
  FileText,
  Menu
} from 'lucide-react';
import { Button } from '../../../components/uiElements';
import './AdobeStyle.css';

interface AdobeStyleHeaderProps {
  fileName?: string;
  onMenuClick?: (menuType: string) => void;
  onSearchClick?: () => void;
  onShareClick?: () => void;
  onAIAssistantClick?: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
}

export const AdobeStyleHeader: React.FC<AdobeStyleHeaderProps> = ({
  fileName = "مستند.pdf",
  onMenuClick,
  onSearchClick,
  onShareClick,
  onAIAssistantClick,
  onNotificationsClick,
  onProfileClick
}) => {
  return (
    <header className="h-[60px] adobe-header border-b border-[#D1D1D1] flex items-center px-4 shadow-sm">
      {/* Logo and App Name */}
      <div className="flex items-center gap-3 mr-5">
        <FileText className="w-8 h-8 text-[#1A82E2]" />
        <span className="text-lg font-semibold text-[#333333]">PDF Editor</span>
      </div>

      {/* Main Menu */}
      <nav className="flex items-center gap-6 flex-grow">
        <button 
          onClick={() => onMenuClick?.('file')}
          className="text-sm font-medium text-[#333333] hover:text-[#1A82E2] px-2 py-1 rounded transition-colors"
        >
          ملف
        </button>
        <button 
          onClick={() => onMenuClick?.('edit')}
          className="text-sm font-medium text-[#333333] hover:text-[#1A82E2] px-2 py-1 rounded transition-colors"
        >
          تعديل
        </button>
        <button 
          onClick={() => onMenuClick?.('view')}
          className="text-sm font-medium text-[#333333] hover:text-[#1A82E2] px-2 py-1 rounded transition-colors"
        >
          عرض
        </button>
        <button 
          onClick={() => onMenuClick?.('tools')}
          className="text-sm font-medium text-[#333333] hover:text-[#1A82E2] px-2 py-1 rounded transition-colors"
        >
          أدوات
        </button>
        <button 
          onClick={() => onMenuClick?.('signature')}
          className="text-sm font-medium text-[#333333] hover:text-[#1A82E2] px-2 py-1 rounded transition-colors"
        >
          توقيع
        </button>
      </nav>

      {/* File Name */}
      <div className="mx-5 text-sm text-[#777777] font-medium">
        {fileName}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="p-2 hover:bg-[#ECECEC] rounded-md transition-colors"
          title="بحث في المستند"
        >
          <Search className="w-5 h-5 text-[#555555]" />
        </button>

        <button
          onClick={onShareClick}
          className="p-2 hover:bg-[#ECECEC] rounded-md transition-colors"
          title="مشاركة"
        >
          <Share2 className="w-5 h-5 text-[#555555]" />
        </button>

        <Button
          onClick={onAIAssistantClick}
          className="bg-[#7B29FF] hover:bg-[#6B23E6] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
        >
          <Bot className="w-4 h-4" />
          مساعد AI
        </Button>

        <button
          onClick={onNotificationsClick}
          className="p-2 hover:bg-[#ECECEC] rounded-md transition-colors"
          title="إشعارات"
        >
          <Bell className="w-5 h-5 text-[#555555]" />
        </button>

        <button
          onClick={onProfileClick}
          className="p-2 hover:bg-[#ECECEC] rounded-md transition-colors"
          title="الملف الشخصي"
        >
          <User className="w-5 h-5 text-[#555555]" />
        </button>
      </div>
    </header>
  );
};