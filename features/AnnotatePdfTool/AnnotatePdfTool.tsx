
import React, { useRef, useEffect, useDeferredValue, useMemo } from 'react';
import { UploadedFile } from '../../types';
import { Button, Spinner } from '../../components/uiElements';
import { Type, Image as ImageIconLucide, Download, PlusCircle, FileText as FileTextIcon } from 'lucide-react';
import { useAnnotatePdfTool } from './useAnnotatePdfTool';
import { useAppContext } from '../../contexts/AppContext';
import { PerformanceMonitor } from './components/PerformanceMonitor.ts';

interface AnnotatePdfToolProps {
  uploadedFile: UploadedFile | undefined; 
  // displayMessage: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void; // Removed
  // isLoadingApp: boolean; // Removed
  // setIsLoadingApp: (isLoading: boolean) => void; // Removed
}

export const AnnotatePdfTool: React.FC<AnnotatePdfToolProps> = ({
  uploadedFile,
}) => {
  const { isLoading: isLoadingApp } = useAppContext(); // Get global loading state from context
  const annotatePreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // استخدام useDeferredValue لتحسين الأداء
  const deferredUploadedFile = useDeferredValue(uploadedFile);
  const deferredIsLoadingApp = useDeferredValue(isLoadingApp);
  
  const {
    annotationsByPage,
    currentAnnotatePageIndex, setCurrentAnnotatePageIndex,
    annotatePageThumbnails,
    currentAnnotationTool, setCurrentAnnotationTool,
    textAnnotationInput, setTextAnnotationInput,
    imageAnnotationFile, setImageAnnotationFile,
    imageAnnotationCoords, setImageAnnotationCoords,
    isProcessingAction,
    renderAnnotatePagePreviewOnCanvas,
    handleAddAnnotationToPage,
    handleSaveAnnotatedPdf,
    // clearAnnotationState, // This hook manages its own state clearing based on uploadedFile
  } = useAnnotatePdfTool({ uploadedFile: deferredUploadedFile }); // استخدام القيمة المؤجلة

  // تحسين شروط إعادة التصيير
  const shouldRenderPreview = useMemo(() => {
    return deferredUploadedFile?.pdfDoc && 
           annotatePageThumbnails.length > 0 && 
           annotatePreviewCanvasRef.current;
  }, [deferredUploadedFile?.pdfDoc, annotatePageThumbnails.length]);

  useEffect(() => {
    if (shouldRenderPreview && annotatePreviewCanvasRef.current) {
        // تأخير التصيير لتجنب التحديثات المتكررة
        const timeoutId = setTimeout(() => {
          renderAnnotatePagePreviewOnCanvas(annotatePreviewCanvasRef.current, currentAnnotatePageIndex);
        }, 50);
        
        return () => clearTimeout(timeoutId);
    }
  }, [currentAnnotatePageIndex, annotationsByPage, shouldRenderPreview, renderAnnotatePagePreviewOnCanvas]);


  const handleLocalImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setImageAnnotationFile(file);
    if(file && currentAnnotationTool !== 'image') {
        setCurrentAnnotationTool('image'); 
    }
  };
  
  const handleAddAnnotationAndClearInput = async () => {
    await handleAddAnnotationToPage();
    if (currentAnnotationTool === 'image') {
        const fileInput = document.getElementById('image-input-ann') as HTMLInputElement;
        if (fileInput) fileInput.value = ''; 
    }
  };

  if (deferredIsLoadingApp && annotatePageThumbnails.length === 0 && deferredUploadedFile) {
     return (
        <div className="w-full p-4 md:p-6 flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <Spinner text="جاري تحضير الملف للتعديل..." size="lg"/>
            <div className="text-center text-sm text-[var(--color-text-muted)] max-w-md">
              <p>يتم الآن تحضير صفحات الملف لأداة التعديل.</p>
              <p>قد تستغرق هذه العملية بعض الوقت حسب حجم الملف.</p>
            </div>
        </div>
     );
  }
  
  if (!deferredUploadedFile) {
      return (
          <div className="w-full p-4 text-center">
              <p className="text-[var(--color-text-muted)]">لم يتم توفير ملف. يرجى العودة واختيار ملف.</p>
          </div>
      );
  }

  return (
    <div className="w-full bg-[var(--color-card-background)] rounded-lg flex flex-col md:flex-row gap-2">
      <div className={`w-full md:w-48 lg:w-64 bg-slate-50 p-2 rounded-lg overflow-y-auto border border-[var(--color-border)] order-first md:order-none h-64 md:h-auto md:min-h-[400px] ${!deferredUploadedFile ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="text-sm font-semibold text-[var(--color-text-base)] mb-2 sticky top-0 bg-slate-50 py-1 z-10">الصفحات</h3>
        {annotatePageThumbnails.length > 0 ? (
          <ul className="space-y-2">
            {annotatePageThumbnails.map(thumb => (
              <li key={`thumb-${thumb.pageIndex}`} onClick={() => setCurrentAnnotatePageIndex(thumb.pageIndex)}
                className={`p-1 border-2 rounded-md cursor-pointer hover:border-[var(--color-primary)] transition-all ${currentAnnotatePageIndex === thumb.pageIndex ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                {thumb.dataUrl ? (
                  <img src={thumb.dataUrl} alt={`صفحة ${thumb.pageIndex + 1}`} className="w-full h-auto object-contain rounded-sm" />
                ) : (
                  <div className="w-full h-20 bg-gray-200 rounded-sm flex items-center justify-center">
                    <FileTextIcon size={24} className="text-gray-400" />
                  </div>
                )}
                <p className="text-xs text-center text-[var(--color-text-muted)] mt-1">صفحة {thumb.pageIndex + 1}</p>
              </li>
            ))}
          </ul>
        ) : deferredIsLoadingApp && deferredUploadedFile ? <Spinner size="sm" text="تحميل المصغرات..."/> :
          !deferredIsLoadingApp && deferredUploadedFile && annotatePageThumbnails.length === 0 ? <p className="text-xs text-slate-500 text-center py-2">فشل تحميل المصغرات أو الملف فارغ.</p> :
          null
        }
      </div>

      <div className={`flex-grow bg-slate-100 rounded-lg flex items-center justify-center overflow-auto border border-[var(--color-border)] relative min-h-[300px] md:min-h-[400px] ${!deferredUploadedFile ? 'opacity-50 pointer-events-none' : ''}`}>
        {deferredIsLoadingApp && deferredUploadedFile && annotatePageThumbnails.length > 0 && currentAnnotatePageIndex >= annotatePageThumbnails.length && <Spinner text="تحميل المعاينة..." />}
        <canvas ref={annotatePreviewCanvasRef} className="max-w-full max-h-full object-contain shadow-lg rounded"></canvas>
        {(!deferredUploadedFile?.pdfDoc || annotatePageThumbnails.length === 0) && !deferredIsLoadingApp && deferredUploadedFile &&
          <div className="text-center p-4"><FileTextIcon size={48} className="text-slate-400 mx-auto mb-2"/><p className="text-slate-500">جاري تحضير الملف أو حدث خطأ...</p></div>
        }
      </div>

      <div className={`w-full md:w-72 lg:w-80 bg-slate-50 p-3 rounded-lg overflow-y-auto border border-[var(--color-border)] h-auto md:min-h-[400px] ${!deferredUploadedFile || annotatePageThumbnails.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="text-md font-semibold text-[var(--color-text-base)] mb-3">أدوات التعديل</h3>
        {deferredUploadedFile?.pdfDoc && annotatePageThumbnails.length > 0 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => setCurrentAnnotationTool('text')} variant={currentAnnotationTool === 'text' ? 'primary' : 'ghost'} size="sm" icon={<Type size={16}/>}>نص</Button>
              <Button onClick={() => setCurrentAnnotationTool('image')} variant={currentAnnotationTool === 'image' ? 'primary' : 'ghost'} size="sm" icon={<ImageIconLucide size={16}/>}>صورة</Button>
            </div>
            {currentAnnotationTool === 'text' && (
              <div className="p-3 border border-slate-200 rounded-md bg-white space-y-2">
                <label htmlFor="text-input-ann" className="text-xs font-medium text-slate-600 block">إضافة نص:</label>
                <input id="text-input-ann" type="text" placeholder="النص..." value={textAnnotationInput.text} onChange={e => setTextAnnotationInput(s => ({...s, text: e.target.value}))} className="w-full p-1.5 border rounded text-sm"/>
                <div className="grid grid-cols-3 gap-1">
                  <input type="number" placeholder="X" title="الإحداثي السيني" value={textAnnotationInput.x} onChange={e => setTextAnnotationInput(s => ({...s, x: parseInt(e.target.value) || 0}))} className="w-full p-1.5 border rounded text-sm"/>
                  <input type="number" placeholder="Y" title="الإحداثي الصادي (من الأعلى)" value={textAnnotationInput.y} onChange={e => setTextAnnotationInput(s => ({...s, y: parseInt(e.target.value) || 0}))} className="w-full p-1.5 border rounded text-sm"/>
                  <input type="number" placeholder="الحجم" title="حجم الخط" value={textAnnotationInput.fontSize} onChange={e => setTextAnnotationInput(s => ({...s, fontSize: parseInt(e.target.value) || 12}))} className="w-full p-1.5 border rounded text-sm"/>
                </div>
                <Button onClick={handleAddAnnotationToPage} isLoading={isProcessingAction} size="sm" icon={<PlusCircle size={16}/>} className="w-full">إضافة النص</Button>
              </div>
            )}
            {currentAnnotationTool === 'image' && (
              <div className="p-3 border border-slate-200 rounded-md bg-white space-y-2">
                <label htmlFor="image-input-ann" className="text-xs font-medium text-slate-600 block">إضافة صورة:</label>
                <input id="image-input-ann" type="file" accept="image/png, image/jpeg" onChange={handleLocalImageFileChange} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"/>
                {imageAnnotationFile && <img src={URL.createObjectURL(imageAnnotationFile)} alt="Preview" className="max-h-20 rounded border my-1"/>}
                <div className="grid grid-cols-2 gap-1">
                  <input type="number" placeholder="X" value={imageAnnotationCoords.x} onChange={e => setImageAnnotationCoords(s => ({...s, x: parseInt(e.target.value) || 0}))} className="w-full p-1.5 border rounded text-sm"/>
                  <input type="number" placeholder="Y (من الأعلى)" value={imageAnnotationCoords.y} onChange={e => setImageAnnotationCoords(s => ({...s, y: parseInt(e.target.value) || 0}))} className="w-full p-1.5 border rounded text-sm"/>
                  <input type="number" placeholder="العرض (اختياري)" value={imageAnnotationCoords.width || ''} onChange={e => setImageAnnotationCoords(s => ({...s, width: e.target.value ? parseInt(e.target.value) : 100}))} className="w-full p-1.5 border rounded text-sm"/>
                  <input type="number" placeholder="الطول (اختياري)" value={imageAnnotationCoords.height || ''} onChange={e => setImageAnnotationCoords(s => ({...s, height: e.target.value ? parseInt(e.target.value) : undefined}))} className="w-full p-1.5 border rounded text-sm"/>
                </div>
                <Button onClick={handleAddAnnotationAndClearInput} isLoading={isProcessingAction} disabled={!imageAnnotationFile} size="sm" icon={<PlusCircle size={16}/>} className="w-full">إضافة الصورة</Button>
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-600 mb-1">العناصر المضافة للصفحة ({currentAnnotatePageIndex + 1}):</h4>
              <ul className="max-h-32 overflow-y-auto text-xs space-y-1 pr-1">
                {(annotationsByPage[currentAnnotatePageIndex] || []).map(ann => (
                  <li key={ann.id} className="p-1.5 bg-white border rounded-sm flex justify-between items-center text-[11px]">
                    <span className="truncate pr-1">{ann.type === 'text' ? `نص: ${ann.text?.substring(0,15)}...` : `صورة: ${ann.originalFileName || 'ملف صورة'}`}</span>
                  </li>
                ))}
                {(annotationsByPage[currentAnnotatePageIndex] || []).length === 0 && <p className="text-slate-400 text-center py-2">لا توجد عناصر.</p>}
              </ul>
            </div>
            <Button onClick={handleSaveAnnotatedPdf} isLoading={isProcessingAction || deferredIsLoadingApp} icon={<Download size={18}/>} className="w-full mt-4">حفظ الملف المعدل</Button>
          </div>
        )}
      </div>
      
      {/* مراقب الأداء (يظهر فقط في بيئة التطوير) */}
      <PerformanceMonitor />
    </div>
  );
};