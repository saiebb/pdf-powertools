
import { useState, useCallback, useEffect } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile, PageSelectionMap, ToolId } from '../../types'; 
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export interface PageInfo {
  id: string; 
  originalIndex: number;
  page: pdfLib.PDFPage; 
  rotation: number; 
  thumbnailUrl?: string; 
}

export interface OrganizablePdf {
  fileId: string;
  fileName: string;
  pdfDoc: pdfLib.PDFDocument;
  pages: PageInfo[];
}

interface UseOrganizeExtractToolProps {
  uploadedFile: UploadedFile | undefined;
  currentToolId: ToolId.ORGANIZE | ToolId.EXTRACT_PAGES;
}

export const useOrganizeExtractTool = ({
  uploadedFile,
  currentToolId,
}: UseOrganizeExtractToolProps) => {
  const { displayMessage, setGlobalLoading, areCoreServicesReady } = useAppContext();
  const [organizablePdf, setOrganizablePdf] = useState<OrganizablePdf | null>(null);
  const [pageSelectionMap, setPageSelectionMap] = useState<PageSelectionMap>({});
  const [isProcessingAction, setIsProcessingAction] = useState(false); 

  const preparePdfForView = useCallback(async () => {
    if (!uploadedFile?.pdfDoc) {
      setOrganizablePdf(null);
      return;
    }

    if (!areCoreServicesReady) {
      displayMessage('info', 'الخدمات الأساسية (مثل PDF.js) لا تزال قيد التحميل. يرجى الانتظار قليلاً.');
      setOrganizablePdf(null);
      return;
    }
    
    if (!window.pdfjsLib) {
      displayMessage('error', 'مكتبة عرض PDF (PDF.js) غير جاهزة. قد تحتاج إلى إعادة تحميل الصفحة.');
      setOrganizablePdf(null);
      return;
    }

    if (!window.pdfjsLib.getDocument) {
      displayMessage('error', 'مكتبة PDF.js غير مكتملة. يرجى إعادة تحميل الصفحة.');
      setOrganizablePdf(null);
      return;
    }
    
    setGlobalLoading(true); 
    try {
      const pdfLibDocInstance = uploadedFile.pdfDoc; 
      const numPages = pdfLibDocInstance.getPageCount();
      const pagesInfo: PageInfo[] = [];

      const originalFileArrayBuffer = await uploadedFile.file.arrayBuffer();
      
      console.log('Loading PDF with PDF.js...');
      console.log('PDF.js version:', window.pdfjsLib.version);
      console.log('File size:', originalFileArrayBuffer.byteLength, 'bytes');
      
      const loadingTask = window.pdfjsLib.getDocument({ 
        data: originalFileArrayBuffer,
        verbosity: 0 // Reduce console noise
      });
      
      const pdfJsDoc = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdfJsDoc.numPages);

      for (let i = 0; i < numPages; i++) {
        try {
          console.log(`Processing page ${i + 1}/${numPages}...`);
          
          const pdfLibPage = pdfLibDocInstance.getPage(i); 
          const pdfJsPage = await pdfJsDoc.getPage(i + 1); 
          const viewport = pdfJsPage.getViewport({ scale: 0.2 }); 
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          let thumbnailUrl: string | undefined = undefined;

          if (context) {
            try {
              await pdfJsPage.render({ canvasContext: context, viewport: viewport }).promise;
              thumbnailUrl = canvas.toDataURL();
            } catch (renderError) {
              console.warn(`Failed to render thumbnail for page ${i + 1}:`, renderError);
              // Continue without thumbnail
            }
          }
          
          // Clean up the page
          try {
            pdfJsPage.cleanup();
          } catch (cleanupError) {
            console.warn(`Failed to cleanup page ${i + 1}:`, cleanupError);
          }

          pagesInfo.push({
            id: `${uploadedFile.id}-page-${i}-${Date.now()}`, 
            originalIndex: i,
            page: pdfLibPage, 
            rotation: pdfLibPage.getRotation().angle,
            thumbnailUrl: thumbnailUrl,
          });
          
        } catch (pageError) {
          console.error(`Error processing page ${i + 1}:`, pageError);
          // Add page without thumbnail
          const pdfLibPage = pdfLibDocInstance.getPage(i);
          pagesInfo.push({
            id: `${uploadedFile.id}-page-${i}-${Date.now()}`, 
            originalIndex: i,
            page: pdfLibPage, 
            rotation: pdfLibPage.getRotation().angle,
            thumbnailUrl: undefined,
          });
        }
      }
      // Clean up PDF.js document
      try {
        pdfJsDoc.destroy();
      } catch (destroyError) {
        console.warn('Failed to destroy PDF.js document:', destroyError);
      }

      setOrganizablePdf({
        fileId: uploadedFile.id,
        fileName: uploadedFile.file.name,
        pdfDoc: pdfLibDocInstance, 
        pages: pagesInfo,
      });

      if (currentToolId === ToolId.EXTRACT_PAGES) {
        const initialSelection: PageSelectionMap = {};
        for (let i = 0; i < numPages; i++) initialSelection[i] = false;
        setPageSelectionMap(initialSelection);
      } else {
        setPageSelectionMap({}); 
      }
      
      console.log(`Successfully processed ${pagesInfo.length} pages`);
    } catch (err: any) {
      console.error('Error preparing PDF for organize/extract:', err);
      
      // Provide more specific error messages
      let errorMessage = 'خطأ في تحضير الصفحات';
      if (err.message.includes('getDocument')) {
        errorMessage = 'خطأ في تحميل ملف PDF. تأكد من أن الملف صحيح وغير تالف.';
      } else if (err.message.includes('render')) {
        errorMessage = 'خطأ في عرض صفحات PDF. سيتم المتابعة بدون معاينة الصفحات.';
      } else if (err.message.includes('pdfjsLib')) {
        errorMessage = 'مكتبة PDF.js غير جاهزة. يرجى إعادة تحميل الصفحة.';
      } else {
        errorMessage = `خطأ في تحضير الصفحات: ${err.message}`;
      }
      
      displayMessage('error', errorMessage);
      setOrganizablePdf(null);
    } finally {
      setGlobalLoading(false); 
    }
  }, [uploadedFile, displayMessage, setGlobalLoading, currentToolId, areCoreServicesReady]);

  useEffect(() => {
    if (uploadedFile?.pdfDoc && areCoreServicesReady) { // Only prepare if services are ready
      preparePdfForView();
    } else if (!uploadedFile?.pdfDoc) { // Clear if no file
      setOrganizablePdf(null); 
    }
    // If services are not ready yet, preparePdfForView will be called again when areCoreServicesReady becomes true
  }, [uploadedFile?.id, uploadedFile?.pdfDoc, areCoreServicesReady]); // Remove preparePdfForView from dependencies to prevent infinite loop


  const handleRotatePage = (pageId: string, direction: 'cw' | 'ccw') => {
    setOrganizablePdf(prev => {
      if (!prev) return null;
      const newPages = prev.pages.map(p => {
        if (p.id === pageId) {
          const currentRotation = p.rotation || 0;
          const newRotation = direction === 'cw' ? (currentRotation + 90) % 360 : (currentRotation - 90 + 360) % 360;
          return { ...p, rotation: newRotation };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    });
  };

  const handleDeletePage = (pageId: string) => {
    setOrganizablePdf(prev => {
      if (!prev) return null;
      if (prev.pages.length <= 1) {
        displayMessage('warning', "لا يمكن حذف جميع الصفحات.");
        return prev;
      }
      const newPages = prev.pages.filter(p => p.id !== pageId);
      return { ...prev, pages: newPages };
    });
  };

  const handleMovePage = (pageId: string, direction: 'up' | 'down') => {
    setOrganizablePdf(prev => {
      if (!prev) return null;
      const pagesArray = [...prev.pages];
      const pageIndex = pagesArray.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return prev;

      const targetIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
      if (targetIndex < 0 || targetIndex >= pagesArray.length) return prev;

      const [movedPage] = pagesArray.splice(pageIndex, 1);
      pagesArray.splice(targetIndex, 0, movedPage);
      return { ...prev, pages: pagesArray };
    });
  };

  const handleSaveOrganizedPdf = async () => {
    if (!organizablePdf?.pdfDoc) {
      displayMessage('error', "لا يوجد ملف PDF لتنظيمه.");
      return;
    }
    if (organizablePdf.pages.length === 0) {
      displayMessage('error', "لا توجد صفحات لحفظها.");
      return;
    }
    setIsProcessingAction(true);
    try {
      const newPdfDoc = await pdfLib.PDFDocument.create();
      const sourcePdfDoc = organizablePdf.pdfDoc; 

      for (const pageInfo of organizablePdf.pages) {
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [pageInfo.originalIndex]);
        copiedPage.setRotation(pdfLib.degrees(pageInfo.rotation));
        newPdfDoc.addPage(copiedPage);
      }
      const pdfBytes = await newPdfDoc.save();
      downloadPdf(pdfBytes, `organized-${organizablePdf.fileName}`);
      displayMessage('success', "تم حفظ الملف المنظم بنجاح!");
    } catch (err: any) {
      console.error("Error saving organized PDF:", err);
      displayMessage('error', `فشل حفظ الملف: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleTogglePageSelection = (pageOriginalIndex: number) => {
    setPageSelectionMap(prev => ({ ...prev, [pageOriginalIndex]: !prev[pageOriginalIndex] }));
  };

  const handleExtractPages = async () => {
    if (!organizablePdf?.pdfDoc) {
      displayMessage('error', "لا يوجد ملف PDF للاستخراج.");
      return;
    }
    const selectedIndices = Object.entries(pageSelectionMap)
      .filter(([, isSelected]) => isSelected)
      .map(([index]) => parseInt(index));

    if (selectedIndices.length === 0) {
      displayMessage('warning', "الرجاء تحديد صفحة واحدة على الأقل.");
      return;
    }
    setIsProcessingAction(true);
    try {
      const newPdfDoc = await pdfLib.PDFDocument.create();
      const sourcePdfDoc = organizablePdf.pdfDoc;
      
      selectedIndices.sort((a, b) => a - b); 

      const copiedPages = await newPdfDoc.copyPages(sourcePdfDoc, selectedIndices);
      copiedPages.forEach(page => newPdfDoc.addPage(page));
      
      const pdfBytes = await newPdfDoc.save();
      downloadPdf(pdfBytes, `extracted-${organizablePdf.fileName}`);
      displayMessage('success', `تم استخراج ${selectedIndices.length} صفحات بنجاح.`);
    } catch (err: any) {
      console.error("Error extracting pages:", err);
      displayMessage('error', `فشل استخراج الصفحات: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return {
    organizablePdf,
    pageSelectionMap,
    isProcessingAction,
    handleRotatePage,
    handleDeletePage,
    handleMovePage,
    handleSaveOrganizedPdf,
    handleTogglePageSelection,
    handleExtractPages,
  };
};
