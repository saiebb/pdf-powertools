// نسخة مبسطة من useOrganizeExtractTool بدون PDF.js
import { useState, useCallback, useEffect, useRef } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile, PageSelectionMap, ToolId } from '../../types'; 
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';

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

export const useOrganizeExtractToolSimple = ({
  uploadedFile,
  currentToolId,
}: UseOrganizeExtractToolProps) => {
  const { displayMessage, setGlobalLoading } = useAppContext();
  const [organizablePdf, setOrganizablePdf] = useState<OrganizablePdf | null>(null);
  const [pageSelectionMap, setPageSelectionMap] = useState<PageSelectionMap>({});
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  const preparationInProgress = useRef(false);
  const lastProcessedFileId = useRef<string | null>(null);
  const isComponentMounted = useRef(true); 

  const preparePdfForView = useCallback(async () => {
    if (!uploadedFile?.pdfDoc || !isComponentMounted.current) {
      setOrganizablePdf(null);
      return;
    }

    // Prevent multiple simultaneous preparations
    if (preparationInProgress.current) {
      console.log('PDF preparation already in progress, skipping...');
      return;
    }

    // Check if we already processed this file
    if (lastProcessedFileId.current === uploadedFile.id) {
      console.log('File already processed, skipping...');
      return;
    }
    
    preparationInProgress.current = true;
    setGlobalLoading(true); 
    
    try {
      const pdfLibDocInstance = uploadedFile.pdfDoc; 
      const numPages = pdfLibDocInstance.getPageCount();
      const pagesInfo: PageInfo[] = [];

      console.log(`Processing ${numPages} pages without PDF.js thumbnails...`);

      for (let i = 0; i < numPages; i++) {
        try {
          const pdfLibPage = pdfLibDocInstance.getPage(i); 
          
          pagesInfo.push({
            id: `${uploadedFile.id}-page-${i}-${Date.now()}`, 
            originalIndex: i,
            page: pdfLibPage, 
            rotation: pdfLibPage.getRotation().angle,
            thumbnailUrl: undefined, // لا نستخدم thumbnails لتجنب مشاكل PDF.js
          });
          
        } catch (pageError) {
          console.error(`Error processing page ${i + 1}:`, pageError);
          displayMessage('warning', `تعذر معالجة الصفحة ${i + 1}. سيتم تخطيها.`);
        }
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
      
      // Mark this file as processed
      lastProcessedFileId.current = uploadedFile.id;
      console.log(`Successfully processed ${pagesInfo.length} pages (without thumbnails)`);
      displayMessage('success', `تم تحميل ${pagesInfo.length} صفحة بنجاح.`);
      
    } catch (err: any) {
      console.error('Error preparing PDF for organize/extract:', err);
      displayMessage('error', `فشل في تحضير ملف PDF: ${err.message}`);
      setOrganizablePdf(null);
    } finally {
      setGlobalLoading(false);
      preparationInProgress.current = false;
    }
  }, [uploadedFile, currentToolId, displayMessage, setGlobalLoading]);

  useEffect(() => {
    isComponentMounted.current = true;
    if (uploadedFile) {
      preparePdfForView();
    } else {
      setOrganizablePdf(null);
      setPageSelectionMap({});
    }
    
    return () => {
      isComponentMounted.current = false;
    };
  }, [uploadedFile, preparePdfForView]);

  const handleRotatePage = useCallback(async (pageId: string) => {
    if (!organizablePdf || isProcessingAction) return;
    
    setIsProcessingAction(true);
    try {
      const pageIndex = organizablePdf.pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return;
      
      const page = organizablePdf.pages[pageIndex];
      page.page.setRotation(pdfLib.degrees(page.rotation + 90));
      
      const updatedPages = [...organizablePdf.pages];
      updatedPages[pageIndex] = {
        ...page,
        rotation: (page.rotation + 90) % 360
      };
      
      setOrganizablePdf({
        ...organizablePdf,
        pages: updatedPages
      });
      
    } catch (err: any) {
      console.error('Error rotating page:', err);
      displayMessage('error', `فشل تدوير الصفحة: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  }, [organizablePdf, isProcessingAction, displayMessage]);

  const handleDeletePage = useCallback(async (pageId: string) => {
    if (!organizablePdf || isProcessingAction) return;
    
    if (organizablePdf.pages.length <= 1) {
      displayMessage('warning', 'لا يمكن حذف الصفحة الوحيدة المتبقية.');
      return;
    }
    
    setIsProcessingAction(true);
    try {
      const pageIndex = organizablePdf.pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return;
      
      const updatedPages = organizablePdf.pages.filter(p => p.id !== pageId);
      organizablePdf.pdfDoc.removePage(pageIndex);
      
      setOrganizablePdf({
        ...organizablePdf,
        pages: updatedPages
      });
      
      displayMessage('success', 'تم حذف الصفحة بنجاح.');
      
    } catch (err: any) {
      console.error('Error deleting page:', err);
      displayMessage('error', `فشل حذف الصفحة: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  }, [organizablePdf, isProcessingAction, displayMessage]);

  const handleMovePage = useCallback(async (pageId: string, direction: 'up' | 'down') => {
    if (!organizablePdf || isProcessingAction) return;
    
    setIsProcessingAction(true);
    try {
      const currentIndex = organizablePdf.pages.findIndex(p => p.id === pageId);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= organizablePdf.pages.length) return;
      
      const updatedPages = [...organizablePdf.pages];
      [updatedPages[currentIndex], updatedPages[newIndex]] = [updatedPages[newIndex], updatedPages[currentIndex]];
      
      // Update PDF document page order
      const [movedPage] = organizablePdf.pdfDoc.getPages().splice(currentIndex, 1);
      organizablePdf.pdfDoc.insertPage(newIndex, movedPage);
      
      setOrganizablePdf({
        ...organizablePdf,
        pages: updatedPages
      });
      
    } catch (err: any) {
      console.error('Error moving page:', err);
      displayMessage('error', `فشل نقل الصفحة: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  }, [organizablePdf, isProcessingAction, displayMessage]);

  const handleSaveOrganizedPdf = useCallback(async () => {
    if (!organizablePdf || isProcessingAction) return;
    
    setIsProcessingAction(true);
    try {
      const pdfBytes = await organizablePdf.pdfDoc.save();
      downloadPdf(pdfBytes, `organized-${organizablePdf.fileName}`);
      displayMessage('success', 'تم حفظ الملف المنظم بنجاح.');
    } catch (err: any) {
      console.error('Error saving organized PDF:', err);
      displayMessage('error', `فشل حفظ الملف: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  }, [organizablePdf, isProcessingAction, displayMessage]);

  const handleTogglePageSelection = useCallback((pageIndex: number) => {
    setPageSelectionMap(prev => ({
      ...prev,
      [pageIndex]: !prev[pageIndex]
    }));
  }, []);

  const handleExtractPages = useCallback(async () => {
    if (!organizablePdf || isProcessingAction) return;
    
    const selectedPages = Object.entries(pageSelectionMap)
      .filter(([_, isSelected]) => isSelected)
      .map(([index, _]) => parseInt(index));
    
    if (selectedPages.length === 0) {
      displayMessage('warning', 'الرجاء اختيار صفحة واحدة على الأقل للاستخراج.');
      return;
    }
    
    setIsProcessingAction(true);
    try {
      const newPdfDoc = await pdfLib.PDFDocument.create();
      
      for (const pageIndex of selectedPages.sort((a, b) => a - b)) {
        if (pageIndex < organizablePdf.pages.length) {
          const [copiedPage] = await newPdfDoc.copyPages(organizablePdf.pdfDoc, [pageIndex]);
          newPdfDoc.addPage(copiedPage);
        }
      }
      
      const pdfBytes = await newPdfDoc.save();
      downloadPdf(pdfBytes, `extracted-pages-${organizablePdf.fileName}`);
      displayMessage('success', `تم استخراج ${selectedPages.length} صفحة بنجاح.`);
    } catch (err: any) {
      console.error('Error extracting pages:', err);
      displayMessage('error', `فشل استخراج الصفحات: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  }, [organizablePdf, pageSelectionMap, isProcessingAction, displayMessage]);

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