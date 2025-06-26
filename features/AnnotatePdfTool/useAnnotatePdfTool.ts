
import { useState, useCallback, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile, Annotation } from '../../types';
import { getArabicFontBuffer } from '../../lib/fontService'; 
import { downloadPdf } from '../../lib/fileUtils';
import { useAppContext } from '../../contexts/AppContext';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';
import { errorHandler } from './utils/errorHandler';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface AnnotatePageThumbnail {
  pageIndex: number;
  dataUrl: string;
}

interface UseAnnotatePdfToolProps {
  uploadedFile: UploadedFile | undefined;
}

export const useAnnotatePdfTool = ({
  uploadedFile,
}: UseAnnotatePdfToolProps) => {
  const { displayMessage, setGlobalLoading, areCoreServicesReady } = useAppContext();
  const [annotationsByPage, setAnnotationsByPage] = useState<{ [pageIndex: number]: Annotation[] }>({});
  const [currentAnnotatePageIndex, setCurrentAnnotatePageIndex] = useState<number>(0);
  const [annotatePageThumbnails, setAnnotatePageThumbnails] = useState<AnnotatePageThumbnail[]>([]);
  const [currentAnnotationTool, setCurrentAnnotationTool] = useState<'text' | 'image' | null>(null);
  const [textAnnotationInput, setTextAnnotationInput] = useState({ text: '', x: 50, y: 50, fontSize: 12 });
  const [imageAnnotationFile, setImageAnnotationFile] = useState<File | null>(null);
  const [imageAnnotationCoords, setImageAnnotationCoords] = useState<{ x: number; y: number; width: number; height?: number }>({ x: 50, y: 50, width: 100 });
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  // إضافة مراجع لمنع إعادة التصيير المتكررة
  const lastProcessedFileRef = useRef<string | null>(null);
  const thumbnailGenerationInProgressRef = useRef(false);
  
  // استخدام useDeferredValue لتأخير التحديثات الثقيلة
  const deferredUploadedFile = useDeferredValue(uploadedFile);
  const deferredAreCoreServicesReady = useDeferredValue(areCoreServicesReady);
  
  // استخدام تحسينات الأداء
  const {
    debounce,
    throttle,
    executeWithConcurrencyLimit,
    chunkWork,
    measurePerformance
  } = usePerformanceOptimization({
    debounceMs: 500,
    throttleMs: 200,
    maxConcurrentOperations: 2
  }); 

  const clearAnnotationState = useCallback(() => {
    setAnnotationsByPage({});
    setCurrentAnnotatePageIndex(0);
    setAnnotatePageThumbnails([]);
    setCurrentAnnotationTool(null);
    setTextAnnotationInput({ text: '', x: 50, y: 50, fontSize: 12 });
    setImageAnnotationFile(null);
    setImageAnnotationCoords({ x: 50, y: 50, width: 100 });
    setIsProcessingAction(false);
  }, []);
  
  useEffect(() => {
    if (!uploadedFile?.pdfDoc) {
      clearAnnotationState();
    }
  }, [uploadedFile, clearAnnotationState]);


  const prepareAnnotateToolThumbnails = useCallback(async () => {
    return measurePerformance('prepareAnnotateToolThumbnails', async () => {
      if (!deferredUploadedFile?.pdfDoc) {
        setAnnotatePageThumbnails([]);
        lastProcessedFileRef.current = null;
        return;
      }
      
      // منع إعادة التشغيل للملف نفسه
      const currentFileId = `${deferredUploadedFile.file.name}-${deferredUploadedFile.file.size}-${deferredUploadedFile.file.lastModified}`;
      if (lastProcessedFileRef.current === currentFileId || thumbnailGenerationInProgressRef.current) {
        console.log('Skipping thumbnail generation - already processed or in progress');
        return;
      }
      
      if (!deferredAreCoreServicesReady) {
          displayMessage('info', "الخدمات الأساسية (PDF.js) قيد التحضير للمعاينة.");
          return;
      }
      
      // تحقق من أن العملية ليست قيد التشغيل بالفعل
      if (thumbnailGenerationInProgressRef.current) {
        console.log('Thumbnail generation already in progress, skipping...');
        return;
      }
      
      // تحقق من أن الملف لم يتم معالجته بالفعل
      if (lastProcessedFileRef.current === deferredUploadedFile.id) {
        console.log('File already processed for thumbnails, skipping...');
        return;
      }
      
      if (!window.pdfjsLib) {
        displayMessage('error', "مكتبة عرض PDF غير جاهزة. لا يمكن تحضير أداة التعديل.", 10000);
        return;
      }
      
      // تعيين العلامة لمنع التشغيل المتكرر
      thumbnailGenerationInProgressRef.current = true;
    
    setGlobalLoading(true);
    try {
      const pdfDoc = deferredUploadedFile.pdfDoc;
      const totalPages = pdfDoc.getPageCount();
      
      // Limit processing for very large PDFs to improve performance
      const MAX_PAGES_FOR_THUMBNAILS = 20; // تقليل العدد لتحسين الأداء
      const numPages = Math.min(totalPages, MAX_PAGES_FOR_THUMBNAILS);
      
      console.log(`Starting thumbnail generation for ${numPages} pages (total: ${totalPages})...`);
      
      if (totalPages > MAX_PAGES_FOR_THUMBNAILS) {
        displayMessage('info', `جاري تحضير أول ${numPages} صفحة من ${totalPages} للتعديل...`);
      } else {
        displayMessage('info', `جاري تحضير ${numPages} صفحة للتعديل...`);
      }
      
      const thumbs: AnnotatePageThumbnail[] = [];
      
      // Use original file data instead of saving PDF again (much faster)
      const originalFileArrayBuffer = await deferredUploadedFile.file.arrayBuffer();
      const pdfJsDoc = await window.pdfjsLib.getDocument({ 
        data: originalFileArrayBuffer,
        verbosity: 0 // Reduce console noise
      }).promise;

      // معالجة الصفحات بشكل محسن باستخدام chunkWork
      const pageIndices = Array.from({ length: numPages }, (_, i) => i);
      
      await chunkWork(
        pageIndices,
        async (pageIndex: number) => {
          try {
            if (pageIndex % 3 === 0) { // Update progress every 3 pages
              console.log(`Processing thumbnail ${pageIndex + 1}/${numPages}...`);
            }
            
            const page = await pdfJsDoc.getPage(pageIndex + 1);
            const viewport = page.getViewport({ scale: 0.15 }); // Smaller scale for faster rendering
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
              console.warn(`Failed to get canvas context for page ${pageIndex + 1}`);
              thumbs.push({ pageIndex, dataUrl: '' });
              return;
            }
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Add timeout for rendering
            const renderPromise = page.render({ canvasContext: context, viewport: viewport }).promise;
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Render timeout')), 3000) // تقليل المهلة الزمنية
            );
            
            await Promise.race([renderPromise, timeoutPromise]);
            
            thumbs.push({ pageIndex, dataUrl: canvas.toDataURL('image/jpeg', 0.6) }); // Use JPEG for smaller size
            
            // Clean up page
            try {
              page.cleanup();
            } catch (cleanupError) {
              console.warn(`Failed to cleanup page ${pageIndex + 1}:`, cleanupError);
            }
            
          } catch (pageError) {
            errorHandler.handleError(pageError, `Page ${pageIndex + 1} Processing`);
            // Add placeholder thumbnail for failed pages
            thumbs.push({ pageIndex, dataUrl: '' });
          }
        },
        3, // معالجة 3 صفحات في كل مجموعة
        50  // تأخير 50ms بين المجموعات
      );
      
      // Clean up PDF.js document
      try {
        pdfJsDoc.destroy();
      } catch (destroyError) {
        console.warn('Failed to destroy PDF.js document:', destroyError);
      }
      
      setAnnotatePageThumbnails(thumbs);
      setCurrentAnnotatePageIndex(0); 
      setAnnotationsByPage({}); 
      
      // تعيين معرف الملف المعالج لمنع إعادة المعالجة
      lastProcessedFileRef.current = currentFileId;
      
      console.log(`Successfully generated ${thumbs.length} thumbnails`);
      
      if (totalPages > MAX_PAGES_FOR_THUMBNAILS) {
        displayMessage('success', `تم تحضير أول ${thumbs.length} صفحة من ${totalPages} للتعديل بنجاح.`);
      } else {
        displayMessage('success', `تم تحضير ${thumbs.length} صفحة للتعديل بنجاح.`);
      }
      
    } catch (err: any) {
      // استخدام معالج الأخطاء المحسن
      const handled = errorHandler.handleError(err, 'Thumbnail Generation');
      
      // إعادة تعيين معرف الملف في حالة الخطأ
      lastProcessedFileRef.current = null;
      
      if (!handled) {
        // Provide more specific error messages
        let errorMessage = 'خطأ في تحضير عارض الصفحات';
        if (err.message.includes('getDocument')) {
          errorMessage = 'خطأ في تحميل ملف PDF. تأكد من أن الملف صحيح وغير تالف.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'انتهت مهلة تحضير الصفحات. جرب ملف أصغر أو أعد المحاولة.';
        } else if (err.message.includes('render')) {
          errorMessage = 'خطأ في عرض صفحات PDF. قد يكون الملف معقد جداً.';
        } else {
          errorMessage = `خطأ في تحضير عارض الصفحات: ${err.message}`;
        }
        
        displayMessage('error', errorMessage);
      }
      setAnnotatePageThumbnails([]);
    } finally {
      setGlobalLoading(false);
      // إعادة تعيين العلامة
      thumbnailGenerationInProgressRef.current = false;
    }
    });
  }, [deferredUploadedFile, displayMessage, setGlobalLoading, deferredAreCoreServicesReady, measurePerformance, chunkWork]);

  // استخدام useMemo لتحسين الأداء
  const shouldGenerateThumbnails = useMemo(() => {
    return deferredUploadedFile?.pdfDoc && deferredAreCoreServicesReady;
  }, [deferredUploadedFile?.pdfDoc, deferredAreCoreServicesReady]);

  useEffect(() => {
    if (shouldGenerateThumbnails) {
      // استخدام debounce لتجنب التحديثات المتكررة
      debounce('thumbnailGeneration', () => {
        prepareAnnotateToolThumbnails();
      }, 800);
    }
  }, [shouldGenerateThumbnails, debounce]); // Remove prepareAnnotateToolThumbnails from dependencies to prevent infinite loop


  // إضافة مرجع لمنع إعادة التصيير المتكررة للمعاينة
  const lastRenderedPageRef = useRef<number>(-1);
  const renderInProgressRef = useRef(false);

  const renderAnnotatePagePreviewOnCanvas = useCallback(async (
    canvas: HTMLCanvasElement | null, 
    pageIndex: number
  ) => {
    if (!deferredUploadedFile?.pdfDoc || !canvas) {
      console.warn("Cannot render annotate preview: No PDF doc or canvas.");
      return;
    }
    
    // منع إعادة التصيير للصفحة نفسها
    if (lastRenderedPageRef.current === pageIndex && renderInProgressRef.current) {
      console.log('Skipping page render - already rendered or in progress');
      return;
    }
    
     if (!deferredAreCoreServicesReady) {
        displayMessage('info', "الخدمات الأساسية (PDF.js) قيد التحضير لعرض الصفحة.");
        return;
    }
    if (!window.pdfjsLib) {
      displayMessage('error', "مكتبة PDF.js غير جاهزة لمعاينة الصفحة.", 10000);
      return;
    }
    
    renderInProgressRef.current = true;
    setGlobalLoading(true); 
    try {
      console.log(`Rendering preview for page ${pageIndex + 1}...`);
      
      const arrayBuffer = await deferredUploadedFile.file.arrayBuffer(); 
      const pdfJsDoc = await window.pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0 // Reduce console noise
      }).promise;
      
      const page = await pdfJsDoc.getPage(pageIndex + 1);
      
      const canvasScale = 1.2; // Reduced scale for better performance
      const viewport = page.getViewport({ scale: canvasScale });
      const context = canvas.getContext('2d');

      if (!context) {
        console.error("Failed to get 2D context for preview.");
        displayMessage('error', "فشل سياق الرسم للمعاينة.");
        return;
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Add timeout for rendering
      const renderPromise = page.render({ canvasContext: context, viewport: viewport }).promise;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Preview render timeout')), 8000)
      );
      
      await Promise.race([renderPromise, timeoutPromise]);
      
      // Clean up page
      try {
        page.cleanup();
      } catch (cleanupError) {
        console.warn('Failed to cleanup preview page:', cleanupError);
      }
      
      // Clean up PDF.js document
      try {
        pdfJsDoc.destroy();
      } catch (destroyError) {
        console.warn('Failed to destroy preview PDF.js document:', destroyError);
      }

      // Render annotations
      const annotationsForCurrentPage = annotationsByPage[pageIndex] || [];
      for (const ann of annotationsForCurrentPage) {
        try {
          context.save();
          if (ann.type === 'text' && ann.text) {
            // Noto Sans Arabic should be available in the browser for preview
            context.font = `${ann.fontSize! * canvasScale}px "Noto Sans Arabic", Arial, sans-serif`;
            context.fillStyle = ann.color ? `rgb(${ann.color.red*255}, ${ann.color.green*255}, ${ann.color.blue*255})` : 'black';
            context.fillText(ann.text, ann.x * canvasScale, (ann.y + ann.fontSize!) * canvasScale);
          } else if (ann.type === 'image' && ann.imageData) {
            const img = new Image();
            const objectURL = URL.createObjectURL(new Blob([ann.imageData], { type: ann.imageType === 'png' ? 'image/png' : 'image/jpeg' }));
            
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                URL.revokeObjectURL(objectURL);
                reject(new Error('Image load timeout'));
              }, 3000);
              
              img.onload = () => {
                clearTimeout(timeout);
                try {
                  const w = (ann.imageWidth || img.width) * canvasScale;
                  const h = (ann.imageHeight || img.height) * canvasScale;
                  context.drawImage(img, ann.x * canvasScale, ann.y * canvasScale, w, h);
                  URL.revokeObjectURL(objectURL);
                  resolve();
                } catch (drawError) {
                  URL.revokeObjectURL(objectURL);
                  reject(drawError);
                }
              };
              
              img.onerror = (e) => {
                clearTimeout(timeout);
                URL.revokeObjectURL(objectURL);
                console.error("Image load error for canvas preview:", e);
                reject(new Error("Image failed to load for preview"));
              };
              
              img.src = objectURL;
            });
          }
          context.restore();
        } catch (annError) {
          console.error(`Error rendering annotation ${ann.id}:`, annError);
          context.restore(); // Make sure to restore context even on error
        }
      }
      
      // تعيين الصفحة المعروضة
      lastRenderedPageRef.current = pageIndex;
      console.log(`Successfully rendered preview for page ${pageIndex + 1}`);
      
    } catch (err: any) {
      console.error("Error rendering annotate page preview:", err);
      
      let errorMessage = 'خطأ في عرض معاينة الصفحة';
      if (err.message.includes('timeout')) {
        errorMessage = 'انتهت مهلة عرض الصفحة. جرب صفحة أخرى.';
      } else if (err.message.includes('getDocument')) {
        errorMessage = 'خطأ في تحميل ملف PDF للمعاينة.';
      } else {
        errorMessage = `خطأ في عرض معاينة الصفحة: ${err.message}`;
      }
      
      displayMessage('error', errorMessage);
    } finally {
      setGlobalLoading(false);
      renderInProgressRef.current = false;
    }
  }, [deferredUploadedFile, annotationsByPage, displayMessage, setGlobalLoading, deferredAreCoreServicesReady]);


  const handleAddAnnotationToPage = async () => {
    if (!uploadedFile?.pdfDoc) return;
    setIsProcessingAction(true);
    try {
      let newAnnotation: Annotation | null = null;
      if (currentAnnotationTool === 'text') {
        if (!textAnnotationInput.text.trim()) {
          displayMessage('warning', "الرجاء إدخال نص.");
          setIsProcessingAction(false);
          return;
        }
        newAnnotation = {
          id: `text-${Date.now()}`, type: 'text', pageIndex: currentAnnotatePageIndex,
          text: textAnnotationInput.text, x: textAnnotationInput.x, y: textAnnotationInput.y,
          fontSize: textAnnotationInput.fontSize, color: pdfLib.rgb(0, 0, 0)
        };
      } else if (currentAnnotationTool === 'image' && imageAnnotationFile) {
        const imageBytes = await imageAnnotationFile.arrayBuffer();
        newAnnotation = {
          id: `image-${Date.now()}`, type: 'image', pageIndex: currentAnnotatePageIndex,
          imageData: new Uint8Array(imageBytes), imageType: imageAnnotationFile.type === 'image/png' ? 'png' : 'jpeg',
          x: imageAnnotationCoords.x, y: imageAnnotationCoords.y,
          imageWidth: imageAnnotationCoords.width, imageHeight: imageAnnotationCoords.height,
          originalFileName: imageAnnotationFile.name
        };
      }

      if (newAnnotation) {
        setAnnotationsByPage(prev => ({
          ...prev,
          [currentAnnotatePageIndex]: [...(prev[currentAnnotatePageIndex] || []), newAnnotation!]
        }));
        displayMessage('info', `تمت إضافة ${currentAnnotationTool === 'text' ? 'النص' : 'الصورة'} إلى الصفحة.`);
        if (currentAnnotationTool === 'text') setTextAnnotationInput(prev => ({ ...prev, text: '' }));
        if (currentAnnotationTool === 'image') {
          setImageAnnotationFile(null);
        }
      } else {
        displayMessage('warning', "لم يتم تحديد أداة أو محتوى.");
      }
    } catch (err: any) {
      console.error("Error adding annotation to page data:", err);
      displayMessage('error', `فشل في إضافة العنصر: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSaveAnnotatedPdf = async () => {
    if (!uploadedFile?.file) {
      displayMessage('warning', "لم يتم رفع ملف.");
      return;
    }
    const pagesWithAnnotations = Object.values(annotationsByPage).some(anns => anns && anns.length > 0);
    if (!pagesWithAnnotations) {
      displayMessage('warning', "لا توجد تعديلات لإضافتها.");
      return;
    }
    
    // Check for core services (like Arabic font buffer) readiness, but fontkit is no longer a dependency.
    if (!areCoreServicesReady) { // areCoreServicesReady now implies font has been fetched (or attempted)
        displayMessage('error', "الخدمات الأساسية (مثل الخط العربي) غير جاهزة لحفظ التعديلات. يرجى المحاولة مرة أخرى قريباً.");
        return;
    }

    setIsProcessingAction(true);
    setGlobalLoading(true); 

    try {
      // Fontkit is no longer used.
      const arrayBuffer = await uploadedFile.file.arrayBuffer(); 
      const newPdfDoc = await pdfLib.PDFDocument.load(arrayBuffer); 
      
      let finalFont: pdfLib.PDFFont | null = null;
      const currentArabicFontBuffer = getArabicFontBuffer();

      if (currentArabicFontBuffer) { 
        try {
          // Attempt to embed the WOFF2 font directly. pdf-lib's capabilities here without fontkit might be limited.
          // It might work for some WOFF2 files if they are simple wrappers around TTF/OTF, or fail.
          finalFont = await newPdfDoc.embedFont(currentArabicFontBuffer, { subset: true });
        } catch (fontError: any) {
          console.error("Failed to embed custom Arabic font (WOFF2) directly with pdf-lib:", fontError);
          displayMessage('warning', `فشل تحميل الخط العربي المخصص (WOFF2): ${fontError.message}. سيتم استخدام خط افتراضي.`, 10000);
        }
      }
      
      if (!finalFont) { 
        try {
          finalFont = await newPdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);
           if (currentArabicFontBuffer) { 
             displayMessage('warning', `سيتم استخدام الخط الافتراضي (Helvetica). قد لا تظهر بعض الحروف العربية بشكل صحيح.`, 7000);
           }
        } catch (stdFontError: any) {
             console.error("Failed to embed Standard Font Helvetica:", stdFontError);
             displayMessage('error', `فشل تحميل الخط الافتراضي: ${stdFontError.message}. لا يمكن حفظ التعديلات النصية.`, 10000);
             setIsProcessingAction(false);
             setGlobalLoading(false);
             return; 
        }
      }


      for (const pageIdxStr in annotationsByPage) {
        const pageIndex = parseInt(pageIdxStr);
        const annotations = annotationsByPage[pageIndex];
        if (annotations && annotations.length > 0) {
          const page = newPdfDoc.getPage(pageIndex);
          const { height: pdfPageHeight } = page.getSize();

          for (const ann of annotations) {
            let pdfLibY: number;
            if (ann.type === 'text' && ann.fontSize) {
              pdfLibY = pdfPageHeight - ann.y - ann.fontSize;
            } else if (ann.type === 'image') {
              const imgHeightForCalc = ann.imageHeight || 50; 
              pdfLibY = pdfPageHeight - ann.y - imgHeightForCalc;
            } else {
              pdfLibY = pdfPageHeight - ann.y - 12; 
            }

            if (ann.type === 'text' && ann.text && finalFont) { 
              page.drawText(ann.text, {
                x: ann.x, y: pdfLibY, font: finalFont, size: ann.fontSize,
                color: ann.color || pdfLib.rgb(0, 0, 0)
              });
            } else if (ann.type === 'image' && ann.imageData) {
              let pdfImage: pdfLib.PDFImage;
              if (ann.imageType === 'png') {
                pdfImage = await newPdfDoc.embedPng(ann.imageData);
              } else {
                pdfImage = await newPdfDoc.embedJpg(ann.imageData);
              }
              
              let drawWidth = ann.imageWidth || pdfImage.width;
              let drawHeight = ann.imageHeight || pdfImage.height;
              
              if(ann.imageWidth && !ann.imageHeight) { 
                drawHeight = pdfImage.height * (drawWidth / pdfImage.width);
              } else if (!ann.imageWidth && ann.imageHeight) { 
                drawWidth = pdfImage.width * (drawHeight / pdfImage.height);
              }

              page.drawImage(pdfImage, { x: ann.x, y: pdfLibY, width: drawWidth, height: drawHeight });
            }
          }
        }
      }
      const pdfBytes = await newPdfDoc.save();
      downloadPdf(pdfBytes, `annotated-${uploadedFile.file.name}`);
      setAnnotationsByPage({}); 
      displayMessage('success', "تم حفظ الملف مع التعديلات بنجاح!");
    } catch (err: any) {
      console.error("Error saving annotated PDF:", err);
      displayMessage('error', `فشل حفظ الملف مع التعديلات. الخطأ: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
      setGlobalLoading(false);
    }
  };

  return {
    annotationsByPage,
    currentAnnotatePageIndex, setCurrentAnnotatePageIndex,
    annotatePageThumbnails,
    currentAnnotationTool, setCurrentAnnotationTool,
    textAnnotationInput, setTextAnnotationInput,
    imageAnnotationFile, setImageAnnotationFile,
    imageAnnotationCoords, setImageAnnotationCoords,
    isProcessingAction,
    prepareAnnotateToolThumbnails, 
    renderAnnotatePagePreviewOnCanvas,
    handleAddAnnotationToPage,
    handleSaveAnnotatedPdf,
    clearAnnotationState, 
  };
};