export const downloadFile = (bytes: Uint8Array, fileName: string, mimeType: string) => {
  const blob = new Blob([bytes], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const downloadPdf = (pdfBytes: Uint8Array, fileName: string) => {
  downloadFile(pdfBytes, fileName, "application/pdf");
};
