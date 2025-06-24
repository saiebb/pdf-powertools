import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  RotateCw,
  RectangleHorizontal,
  RectangleVertical,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface FooterControlsProps {
  currentPage: number;
  totalPages: number;
  currentZoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  displayMode: 'singlePage' | 'continuousScroll';
  onDisplayModeChange: (mode: 'singlePage' | 'continuousScroll') => void;
}

export const FooterControls: React.FC<FooterControlsProps> = ({
  currentPage,
  totalPages,
  currentZoom,
  onPageChange,
  onZoomChange,
  onRotateLeft,
  onRotateRight,
  displayMode,
  onDisplayModeChange
}) => {
  const zoomOptions = [50, 75, 100, 125, 150, 200];

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page - 1); // Convert to 0-based index
    }
  };

  const handleZoomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'fitPage' || value === 'fitWidth') {
      // Handle special zoom modes
      console.log('Special zoom mode:', value);
    } else {
      onZoomChange(parseInt(value));
    }
  };

  return (
    <footer className="footer-controls h-[50px] bg-[#ECECEC] border-t border-[#D1D1D1] flex items-center justify-between px-4 adobe-panel">
      
      {/* Page Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="p-2 hover:bg-[#D1D1D1] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="الصفحة السابقة"
        >
          <ChevronRight size={16} className="text-[#555555]" />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage + 1}
            onChange={handlePageInputChange}
            className="w-12 h-8 text-center text-sm border border-[#D1D1D1] rounded-md focus:border-[#1A82E2] focus:outline-none"
          />
          <span className="text-sm text-[#666666]">من {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="p-2 hover:bg-[#D1D1D1] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="الصفحة التالية"
        >
          <ChevronLeft size={16} className="text-[#555555]" />
        </button>
      </div>

      {/* Center Controls */}
      <div className="flex items-center gap-2">
        {/* Rotation Controls */}
        <button
          onClick={onRotateLeft}
          className="p-2 hover:bg-[#D1D1D1] rounded-md transition-colors"
          title="تدوير لليسار"
        >
          <RotateCcw size={16} className="text-[#555555]" />
        </button>

        <button
          onClick={onRotateRight}
          className="p-2 hover:bg-[#D1D1D1] rounded-md transition-colors"
          title="تدوير لليمين"
        >
          <RotateCw size={16} className="text-[#555555]" />
        </button>

        {/* Display Mode Toggle */}
        <div className="flex items-center border border-[#D1D1D1] rounded-md overflow-hidden">
          <button
            onClick={() => onDisplayModeChange('singlePage')}
            className={`p-2 transition-colors ${
              displayMode === 'singlePage' 
                ? 'bg-[#1A82E2] text-white' 
                : 'hover:bg-[#D1D1D1] text-[#555555]'
            }`}
            title="عرض صفحة واحدة"
          >
            <RectangleVertical size={16} />
          </button>
          <button
            onClick={() => onDisplayModeChange('continuousScroll')}
            className={`p-2 transition-colors ${
              displayMode === 'continuousScroll' 
                ? 'bg-[#1A82E2] text-white' 
                : 'hover:bg-[#D1D1D1] text-[#555555]'
            }`}
            title="تمرير مستمر"
          >
            <RectangleHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onZoomChange(Math.max(25, currentZoom - 25))}
          className="p-2 hover:bg-[#D1D1D1] rounded-md transition-colors"
          title="تصغير"
        >
          <ZoomOut size={16} className="text-[#555555]" />
        </button>

        <select
          value={currentZoom}
          onChange={handleZoomSelect}
          className="h-8 px-2 text-sm border border-[#D1D1D1] rounded-md focus:border-[#1A82E2] focus:outline-none bg-white"
        >
          <option value="fitPage">ملء الصفحة</option>
          <option value="fitWidth">ملء العرض</option>
          {zoomOptions.map(zoom => (
            <option key={zoom} value={zoom}>{zoom}%</option>
          ))}
        </select>

        <button
          onClick={() => onZoomChange(Math.min(400, currentZoom + 25))}
          className="p-2 hover:bg-[#D1D1D1] rounded-md transition-colors"
          title="تكبير"
        >
          <ZoomIn size={16} className="text-[#555555]" />
        </button>
      </div>
    </footer>
  );
};