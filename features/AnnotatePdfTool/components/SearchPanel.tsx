import React, { useState } from 'react';
import { Search, X, ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';

interface SearchResult {
  pageIndex: number;
  text: string;
  position: { x: number; y: number };
}

interface SearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchResults: SearchResult[];
  currentResultIndex: number;
  onNavigateResult: (index: number) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isVisible,
  onClose,
  onSearch,
  searchResults,
  currentResultIndex,
  onNavigateResult
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    caseSensitive: false,
    wholeWords: false,
    useRegex: false
  });

  if (!isVisible) return null;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateToPrevious = () => {
    if (searchResults.length > 0) {
      const newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : searchResults.length - 1;
      onNavigateResult(newIndex);
    }
  };

  const navigateToNext = () => {
    if (searchResults.length > 0) {
      const newIndex = currentResultIndex < searchResults.length - 1 ? currentResultIndex + 1 : 0;
      onNavigateResult(newIndex);
    }
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-white border border-[#D1D1D1] rounded-lg shadow-lg z-40 contextual-toolbar">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#D1D1D1]">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[#555555]" />
          <span className="text-sm font-medium text-[#333333]">البحث في المستند</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#F0F0F0] rounded transition-colors"
          title="إغلاق"
        >
          <X size={16} className="text-[#555555]" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="ابحث في النص..."
            className="w-full pl-8 pr-3 py-2 border border-[#D1D1D1] rounded-md text-sm focus:border-[#1A82E2] focus:outline-none"
          />
          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#999999]" />
        </div>

        {/* Search Results Info */}
        {searchResults.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#666666]">
              {currentResultIndex + 1} من {searchResults.length} نتيجة
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={navigateToPrevious}
                disabled={searchResults.length === 0}
                className="p-1 hover:bg-[#F0F0F0] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="النتيجة السابقة"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={navigateToNext}
                disabled={searchResults.length === 0}
                className="p-1 hover:bg-[#F0F0F0] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="النتيجة التالية"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchQuery && searchResults.length === 0 && (
          <div className="mt-2 text-xs text-[#999999] text-center py-2">
            لم يتم العثور على نتائج
          </div>
        )}
      </div>

      {/* Advanced Search Options */}
      <div className="border-t border-[#D1D1D1]">
        <button
          onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
          className="w-full flex items-center justify-between p-3 hover:bg-[#F8F9FA] transition-colors"
        >
          <span className="text-sm text-[#666666]">خيارات متقدمة</span>
          <MoreHorizontal size={16} className={`text-[#666666] transition-transform ${isAdvancedSearch ? 'rotate-90' : ''}`} />
        </button>

        {isAdvancedSearch && (
          <div className="px-3 pb-3 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={searchOptions.caseSensitive}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, caseSensitive: e.target.checked }))}
                className="rounded border-[#D1D1D1] text-[#1A82E2] focus:ring-[#1A82E2]"
              />
              <span className="text-[#666666]">حساس لحالة الأحرف</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={searchOptions.wholeWords}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, wholeWords: e.target.checked }))}
                className="rounded border-[#D1D1D1] text-[#1A82E2] focus:ring-[#1A82E2]"
              />
              <span className="text-[#666666]">كلمات كاملة فقط</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={searchOptions.useRegex}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, useRegex: e.target.checked }))}
                className="rounded border-[#D1D1D1] text-[#1A82E2] focus:ring-[#1A82E2]"
              />
              <span className="text-[#666666]">استخدام التعبيرات النمطية</span>
            </label>
          </div>
        )}
      </div>

      {/* Search Results List */}
      {searchResults.length > 0 && (
        <div className="border-t border-[#D1D1D1] max-h-48 overflow-y-auto adobe-scrollbar">
          <div className="p-2">
            <div className="text-xs font-medium text-[#666666] mb-2">النتائج:</div>
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => onNavigateResult(index)}
                className={`
                  w-full text-left p-2 rounded text-xs hover:bg-[#F8F9FA] transition-colors
                  ${index === currentResultIndex ? 'bg-[#E3F2FD] border-l-2 border-[#1A82E2]' : ''}
                `}
              >
                <div className="font-medium text-[#333333] mb-1">
                  صفحة {result.pageIndex + 1}
                </div>
                <div className="text-[#666666] truncate">
                  {result.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};