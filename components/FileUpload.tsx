
import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, XCircle } from 'lucide-react';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  acceptMultiple?: boolean;
  acceptMimeType?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  acceptMultiple = false,
  acceptMimeType = "application/pdf",
  label = "اسحب وأفلت ملفات PDF هنا، أو انقر للتصفح"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setUploadedFiles(filesArray);
      onFilesUploaded(filesArray);
    }
  }, [onFilesUploaded]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      const filesArray = Array.from(event.dataTransfer.files).filter(file => file.type === acceptMimeType || acceptMimeType === "*");
      if (filesArray.length > 0) {
        setUploadedFiles(acceptMultiple ? [...uploadedFiles, ...filesArray] : [filesArray[0]]);
        onFilesUploaded(acceptMultiple ? [...uploadedFiles, ...filesArray] : [filesArray[0]]);
      }
    }
  }, [onFilesUploaded, acceptMimeType, acceptMultiple, uploadedFiles]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const removeFile = (fileName: string) => {
    const newFiles = uploadedFiles.filter(f => f.name !== fileName);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles); // Notify parent about the removal
  };
  
  const clearFiles = () => {
    setUploadedFiles([]);
    onFilesUploaded([]);
   };


  return (
    <div className="w-full">
      <div
        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <UploadCloud className={`mb-3 h-10 w-10 ${isDragging ? 'text-blue-600' : 'text-slate-500'}`} />
        <p className="mb-2 text-sm text-center text-slate-600">
          <span className="font-semibold">{label}</span>
        </p>
        <p className="text-xs text-slate-500">
          {acceptMimeType === "application/pdf" ? "PDF فقط" : `أنواع الملفات المدعومة: ${acceptMimeType}`}
          {acceptMultiple && " (يمكن تحديد ملفات متعددة)"}
        </p>
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={acceptMimeType}
          multiple={acceptMultiple}
          onChange={handleFileChange}
        />
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-slate-700">الملفات المرفوعة:</h4>
            <button onClick={clearFiles} className="text-xs text-red-500 hover:text-red-700">مسح الكل</button>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {uploadedFiles.map(file => (
              <li key={file.name} className="flex items-center justify-between p-2 bg-slate-100 rounded-md text-sm">
                <div className="flex items-center overflow-hidden">
                  <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <span className="truncate" title={file.name}>{file.name}</span>
                </div>
                <button onClick={() => removeFile(file.name)} title="إزالة الملف" className="ml-2 text-slate-400 hover:text-red-500">
                  <XCircle className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
