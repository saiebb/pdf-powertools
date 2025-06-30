import { useState, useEffect } from 'react';
import { UploadedFile } from '../../types';

export const usePdfToJpgTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const processFile = async (uploadedFile: UploadedFile) => {
    if (!uploadedFile) {
      console.warn('يرجى رفع ملف PDF أولاً');
      return;
    }

    // التحقق من نوع الملف
    if (!uploadedFile.file.type.includes('pdf') && !uploadedFile.file.name.toLowerCase().endsWith('.pdf')) {
      console.error('يرجى رفع ملف PDF صحيح');
      return;
    }

    setIsProcessing(true);
    
    try {
      // محاكاة معالجة الملف
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // إنشاء صور وهمية للاختبار
      const mockImages = [
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      ];
      
      const mockUrls = mockImages.map(img => {
        const response = fetch(img);
        return URL.createObjectURL(new Blob(['mock'], { type: 'image/jpeg' }));
      });
      
      setPreviewImages(mockImages);
      setDownloadUrls(mockUrls);
      
      console.log('تم تحويل الملف بنجاح');
      
    } catch (error) {
      console.error('خطأ في تحويل PDF إلى JPG:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResults = () => {
    // تنظيف URLs لتجنب تسريب الذاكرة
    downloadUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('فشل في تنظيف URL:', error);
      }
    });
    setDownloadUrls([]);
    setPreviewImages([]);
  };

  // تنظيف الذاكرة عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      // تنظيف جميع URLs عند إلغاء تحميل المكون
      downloadUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('فشل في تنظيف URL عند إلغاء التحميل:', error);
        }
      });
    };
  }, [downloadUrls]);

  return {
    isProcessing,
    processFile,
    downloadUrls,
    previewImages,
    clearResults
  };
};