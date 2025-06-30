
import * as pdfLib from 'pdf-lib';
import { LucideIcon } from 'lucide-react';

export enum ToolId {
  MERGE = 'merge',
  ORGANIZE = 'organize',
  PROTECT = 'protect',
  PDF_TO_IMAGES = 'pdf_to_images',
  PDF_TO_TEXT = 'pdf_to_text',
  COMPRESS_PDF = 'compress_pdf',
  ANNOTATE_PDF = 'annotate_pdf',
  UNLOCK_PDF = 'unlock_pdf',
  SPLIT_PDF = 'split_pdf',
  EXTRACT_PAGES = 'extract_pages',
  IMAGE_TO_PDF = 'image_to_pdf',
  // أدوات التحويل إلى PDF
  JPG_TO_PDF = 'jpg_to_pdf',
  WORD_TO_PDF = 'word_to_pdf',
  POWERPOINT_TO_PDF = 'powerpoint_to_pdf',
  EXCEL_TO_PDF = 'excel_to_pdf',
  HTML_TO_PDF = 'html_to_pdf',
  // أدوات التحويل من PDF
  PDF_TO_JPG = 'pdf_to_jpg',
  PDF_TO_WORD = 'pdf_to_word',
  PDF_TO_POWERPOINT = 'pdf_to_powerpoint',
  PDF_TO_EXCEL = 'pdf_to_excel',
  PDF_TO_PDFA = 'pdf_to_pdfa',
  // أدوات جديدة
  REDACT_PDF = 'redact_pdf',
  CROP_PDF = 'crop_pdf',
}

export interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: LucideIcon;
  acceptMultipleFiles: boolean;
  acceptMimeType: string;
  allowAddingMoreFiles?: boolean; // New property
}

export interface UploadedFile {
  id: string;
  file: File;
  pdfDoc?: pdfLib.PDFDocument; // Loaded PDF document
  imagePreviewUrl?: string; // For Image to PDF preview
  previewPages?: Array<{ dataUrl: string; originalPageNumber: number }>; // For PDF to Images preview
}

export interface Annotation {
  id: string;
  type: 'text' | 'image';
  pageIndex: number; // 0-based
  x: number;
  y: number;
  text?: string;
  font?: string; 
  fontSize?: number;
  color?: pdfLib.RGB; 
  imageData?: Uint8Array;
  imageType?: 'png' | 'jpeg';
  imageWidth?: number;
  imageHeight?: number;
  originalFileName?: string;
}

export type PageSelectionMap = { [pageIndex: number]: boolean };

export type AppDisplayMessageFn = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;