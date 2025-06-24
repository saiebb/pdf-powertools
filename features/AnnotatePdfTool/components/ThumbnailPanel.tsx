import React from 'react';
import { ChevronUp, ChevronDown, FileText as FileTextIcon } from 'lucide-react';

interface PageThumbnail {
  pageIndex: number;
  dataUrl: string;
}

interface ThumbnailPanelProps {
  thumbnails: PageThumbnail[];
  currentPageIndex: number;
  onPageSelect: (pageIndex: number) => void;
  isVisible: boolean;
  isLoading?: boolean;
}

export const ThumbnailPanel: React.FC<ThumbnailPanelProps> = ({
  thumbnails,
  currentPageIndex,
  onPageSelect,
  isVisible,
  isLoading = false
}) => {
  if (!isVisible) return null;

  return (
    <div className="thumbnail-panel w-[200px] bg-[#F9F9F9] border-r border-[#D1D1D1] flex flex-col adobe-panel panel-slide-in-left">
      {/* Header */}
      <div className="h-12 bg-[#ECECEC] border-b border-[#D1D1D1] flex items-center justify-center">
        <span className="text-sm font-medium text-[#333333]">الصفحات</span>
      </div>

      {/* Thumbnails List */}
      <div className="flex-1 overflow-y-auto p-2 adobe-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A82E2]"></div>
          </div>
        ) : thumbnails.length > 0 ? (
          <div className="space-y-2">
            {thumbnails.map((thumb) => (
              <div
                key={`thumb-${thumb.pageIndex}`}
                onClick={() => onPageSelect(thumb.pageIndex)}
                className={`
                  thumbnail-item relative cursor-pointer rounded-lg border-2 adobe-transition hover:shadow-md adobe-focus
                  ${currentPageIndex === thumb.pageIndex 
                    ? 'border-[#1A82E2] ring-2 ring-[#1A82E2] ring-opacity-30 shadow-md' 
                    : 'border-[#D1D1D1] hover:border-[#1A82E2]'
                  }
                `}
              >
                {/* Page Number Badge */}
                <div className={`
                  absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center z-10
                  ${currentPageIndex === thumb.pageIndex 
                    ? 'bg-[#1A82E2] text-white' 
                    : 'bg-[#666666] text-white'
                  }
                `}>
                  {thumb.pageIndex + 1}
                </div>

                {/* Thumbnail Image */}
                <div className="p-2">
                  {thumb.dataUrl ? (
                    <img 
                      src={thumb.dataUrl} 
                      alt={`صفحة ${thumb.pageIndex + 1}`}
                      className="w-full h-auto object-contain rounded-sm shadow-sm"
                      style={{ maxHeight: '120px' }}
                    />
                  ) : (
                    <div className="w-full h-20 bg-[#F0F0F0] rounded-sm flex items-center justify-center">
                      <FileTextIcon size={24} className="text-[#999999]" />
                    </div>
                  )}
                </div>

                {/* Page Label */}
                <div className="text-xs text-center text-[#666666] pb-2">
                  صفحة {thumb.pageIndex + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-[#999999]">
            <FileTextIcon size={32} className="mb-2" />
            <p className="text-xs text-center">لا توجد صفحات</p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {thumbnails.length > 0 && (
        <div className="h-12 bg-[#ECECEC] border-t border-[#D1D1D1] flex items-center justify-center gap-2">
          <button
            onClick={() => {
              const prevIndex = Math.max(0, currentPageIndex - 1);
              onPageSelect(prevIndex);
            }}
            disabled={currentPageIndex === 0}
            className="p-1 rounded hover:bg-[#D1D1D1] disabled:opacity-50 disabled:cursor-not-allowed"
            title="الصفحة السابقة"
          >
            <ChevronUp size={16} className="text-[#555555]" />
          </button>

          <span className="text-xs text-[#666666] min-w-[60px] text-center">
            {currentPageIndex + 1} / {thumbnails.length}
          </span>

          <button
            onClick={() => {
              const nextIndex = Math.min(thumbnails.length - 1, currentPageIndex + 1);
              onPageSelect(nextIndex);
            }}
            disabled={currentPageIndex === thumbnails.length - 1}
            className="p-1 rounded hover:bg-[#D1D1D1] disabled:opacity-50 disabled:cursor-not-allowed"
            title="الصفحة التالية"
          >
            <ChevronDown size={16} className="text-[#555555]" />
          </button>
        </div>
      )}
    </div>
  );
};