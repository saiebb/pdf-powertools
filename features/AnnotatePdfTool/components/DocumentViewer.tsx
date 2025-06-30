import React from 'react';
import { FileText as FileTextIcon } from 'lucide-react';
import { Spinner } from '../../../components/uiElements';

interface DocumentViewerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  hasDocument: boolean;
  currentPageIndex: number;
  totalPages: number;
  onCanvasClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  canvasRef,
  isLoading,
  hasDocument,
  currentPageIndex,
  totalPages,
  onCanvasClick
}) => {
  return (
    <div className="document-viewer flex-1 bg-[#F5F5F5] flex items-center justify-center overflow-auto relative">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <Spinner text="جاري تحميل المستند..." size="lg" />
        </div>
      )}

      {/* Document Canvas */}
      {hasDocument ? (
        <div className="document-canvas-container relative max-w-full max-h-full p-4">
          <canvas
            ref={canvasRef}
            onClick={onCanvasClick}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border border-[#D1D1D1] bg-white cursor-crosshair adobe-focus"
            style={{ 
              filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.1))',
            }}
          />
          
          {/* Page Info Overlay */}
          <div className="absolute top-6 left-6 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
            صفحة {currentPageIndex + 1} من {totalPages}
          </div>
        </div>
      ) : (
        /* No Document State */
        <div className="text-center p-8">
          <FileTextIcon size={64} className="text-[#CCCCCC] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#666666] mb-2">
            لا يوجد مستند محمل
          </h3>
          <p className="text-sm text-[#999999]">
            يرجى تحميل ملف PDF للبدء في التعديل
          </p>
        </div>
      )}

      {/* Contextual Toolbar (appears when element is selected) */}
      {/* This would be implemented based on selected annotation/element */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 hidden">
        <div className="bg-white border border-[#D1D1D1] rounded-lg shadow-lg p-2 flex items-center gap-2">
          {/* Contextual tools would go here */}
        </div>
      </div>
    </div>
  );
};