import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile, AppDisplayMessageFn } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';

interface RedactionArea {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useRedactPdfTool = (
  uploadedFile: UploadedFile | undefined,
  displayMessage: AppDisplayMessageFn
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [redactionAreas, setRedactionAreas] = useState<RedactionArea[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const addRedactionArea = (area: Omit<RedactionArea, 'id'>) => {
    const newArea: RedactionArea = {
      ...area,
      id: `redaction-${Date.now()}-${Math.random()}`,
    };
    setRedactionAreas(prev => [...prev, newArea]);
  };

  const removeRedactionArea = (id: string) => {
    setRedactionAreas(prev => prev.filter(area => area.id !== id));
  };

  const clearAllRedactionAreas = () => {
    setRedactionAreas([]);
  };

  const applyRedaction = async (applyToAllPages: boolean = false) => {
    if (!uploadedFile?.pdfDoc) {
      displayMessage('error', 'لا يوجد ملف PDF محمل.');
      return;
    }

    if (redactionAreas.length === 0) {
      displayMessage('warning', 'الرجاء تحديد مناطق للتنقيح أولاً.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await pdfLib.PDFDocument.load(await uploadedFile.file.arrayBuffer());
      const pages = pdfDoc.getPages();

      if (applyToAllPages) {
        // تطبيق التنقيح على جميع الصفحات
        const areasForCurrentPage = redactionAreas.filter(area => area.pageIndex === selectedPageIndex);
        
        pages.forEach((page) => {
          const { height } = page.getSize();
          
          areasForCurrentPage.forEach(area => {
            // تحويل الإحداثيات (PDF يبدأ من الأسفل)
            const pdfY = height - area.y - area.height;
            
            page.drawRectangle({
              x: area.x,
              y: pdfY,
              width: area.width,
              height: area.height,
              color: pdfLib.rgb(0, 0, 0), // أسود
            });
          });
        });
      } else {
        // تطبيق التنقيح على الصفحات المحددة فقط
        redactionAreas.forEach(area => {
          if (area.pageIndex < pages.length) {
            const page = pages[area.pageIndex];
            const { height } = page.getSize();
            
            // تحويل الإحداثيات (PDF يبدأ من الأسفل)
            const pdfY = height - area.y - area.height;
            
            page.drawRectangle({
              x: area.x,
              y: pdfY,
              width: area.width,
              height: area.height,
              color: pdfLib.rgb(0, 0, 0), // أسود
            });
          }
        });
      }

      const pdfBytes = await pdfDoc.save();
      downloadPdf(pdfBytes, `redacted-${uploadedFile.file.name}`);
      displayMessage('success', 'تم تطبيق التنقيح وحفظ الملف بنجاح.');
      
      // مسح المناطق المحددة بعد التطبيق
      clearAllRedactionAreas();
      
    } catch (err: any) {
      console.error('Error applying redaction:', err);
      displayMessage('error', `فشل تطبيق التنقيح: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRedactionAreasForPage = (pageIndex: number) => {
    return redactionAreas.filter(area => area.pageIndex === pageIndex);
  };

  const totalPages = uploadedFile?.pdfDoc?.getPageCount() || 0;

  return {
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
  };
};
