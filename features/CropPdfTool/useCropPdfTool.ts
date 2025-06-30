import { useState } from 'react';
import * as pdfLib from 'pdf-lib';
import { UploadedFile, AppDisplayMessageFn } from '../../types';
import { downloadPdf } from '../../lib/fileUtils';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropPreset {
  name: string;
  description: string;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const CROP_PRESETS: CropPreset[] = [
  {
    name: 'إزالة الهوامش الصغيرة',
    description: 'إزالة 1 سم من كل جانب',
    margins: { top: 28, right: 28, bottom: 28, left: 28 }, // 1cm = ~28 points
  },
  {
    name: 'إزالة الهوامش المتوسطة',
    description: 'إزالة 2 سم من كل جانب',
    margins: { top: 57, right: 57, bottom: 57, left: 57 }, // 2cm = ~57 points
  },
  {
    name: 'إزالة الهوامش الكبيرة',
    description: 'إزالة 3 سم من كل جانب',
    margins: { top: 85, right: 85, bottom: 85, left: 85 }, // 3cm = ~85 points
  },
];

export const useCropPdfTool = (
  uploadedFile: UploadedFile | undefined,
  displayMessage: AppDisplayMessageFn
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [cropMode, setCropMode] = useState<'custom' | 'preset'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<CropPreset>(CROP_PRESETS[0]);
  const [customMargins, setCustomMargins] = useState({
    top: 28,
    right: 28,
    bottom: 28,
    left: 28,
  });

  const applyCrop = async (applyToAllPages: boolean = false) => {
    if (!uploadedFile?.pdfDoc) {
      displayMessage('error', 'لا يوجد ملف PDF محمل.');
      return;
    }

    let finalCropArea: CropArea | null = null;

    if (cropMode === 'custom' && cropArea) {
      finalCropArea = cropArea;
    } else if (cropMode === 'preset') {
      // حساب منطقة القص من الإعدادات المسبقة
      const margins = selectedPreset.margins;
      const pages = uploadedFile.pdfDoc.getPages();
      if (pages.length > selectedPageIndex) {
        const page = pages[selectedPageIndex];
        const { width, height } = page.getSize();
        
        finalCropArea = {
          x: margins.left,
          y: margins.bottom,
          width: width - margins.left - margins.right,
          height: height - margins.top - margins.bottom,
        };
      }
    }

    if (!finalCropArea) {
      displayMessage('warning', 'الرجاء تحديد منطقة القص أولاً.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = await pdfLib.PDFDocument.load(await uploadedFile.file.arrayBuffer());
      const pages = pdfDoc.getPages();

      if (applyToAllPages) {
        // تطبيق القص على جميع الصفحات
        pages.forEach(page => {
          const { width, height } = page.getSize();
          
          let cropX = finalCropArea!.x;
          let cropY = finalCropArea!.y;
          let cropWidth = finalCropArea!.width;
          let cropHeight = finalCropArea!.height;
          
          // التأكد من أن منطقة القص لا تتجاوز حدود الصفحة
          cropX = Math.max(0, Math.min(cropX, width));
          cropY = Math.max(0, Math.min(cropY, height));
          cropWidth = Math.min(cropWidth, width - cropX);
          cropHeight = Math.min(cropHeight, height - cropY);
          
          // تطبيق القص عن طريق تعديل MediaBox و CropBox
          page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
          page.setCropBox(cropX, cropY, cropWidth, cropHeight);
        });
      } else {
        // تطبيق القص على الصفحة المحددة فقط
        if (selectedPageIndex < pages.length) {
          const page = pages[selectedPageIndex];
          const { width, height } = page.getSize();
          
          let cropX = finalCropArea.x;
          let cropY = finalCropArea.y;
          let cropWidth = finalCropArea.width;
          let cropHeight = finalCropArea.height;
          
          // التأكد من أن منطقة القص لا تتجاوز حدود الصفحة
          cropX = Math.max(0, Math.min(cropX, width));
          cropY = Math.max(0, Math.min(cropY, height));
          cropWidth = Math.min(cropWidth, width - cropX);
          cropHeight = Math.min(cropHeight, height - cropY);
          
          // تطبيق القص
          page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
          page.setCropBox(cropX, cropY, cropWidth, cropHeight);
        }
      }

      const pdfBytes = await pdfDoc.save();
      downloadPdf(pdfBytes, `cropped-${uploadedFile.file.name}`);
      displayMessage('success', 'تم تطبيق القص وحفظ الملف بنجاح.');
      
      // مسح منطقة القص بعد التطبيق
      setCropArea(null);
      
    } catch (err: any) {
      console.error('Error applying crop:', err);
      displayMessage('error', `فشل تطبيق القص: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const previewCropWithPreset = () => {
    if (!uploadedFile?.pdfDoc || cropMode !== 'preset') return null;
    
    const pages = uploadedFile.pdfDoc.getPages();
    if (pages.length <= selectedPageIndex) return null;
    
    const page = pages[selectedPageIndex];
    const { width, height } = page.getSize();
    const margins = selectedPreset.margins;
    
    return {
      x: margins.left,
      y: margins.bottom,
      width: width - margins.left - margins.right,
      height: height - margins.top - margins.bottom,
    };
  };

  const totalPages = uploadedFile?.pdfDoc?.getPageCount() || 0;

  return {
    isProcessing,
    cropArea,
    setCropArea,
    selectedPageIndex,
    setSelectedPageIndex,
    cropMode,
    setCropMode,
    selectedPreset,
    setSelectedPreset,
    customMargins,
    setCustomMargins,
    applyCrop,
    previewCropWithPreset,
    totalPages,
    cropPresets: CROP_PRESETS,
  };
};