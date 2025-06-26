# أدوات التحويل إلى PDF

تم إضافة مجموعة جديدة من أدوات التحويل إلى PDF في التطبيق:

## الأدوات المضافة

### 1. JPG إلى PDF
- **الوصف**: تحويل صور JPG/JPEG إلى ملف PDF
- **الملفات المدعومة**: .jpg, .jpeg
- **الميزات**: 
  - دعم ملفات متعددة
  - معاينة الصور قبل التحويل
  - ترتيب الصور حسب ترتيب الرفع

### 2. Word إلى PDF
- **الوصف**: تحويل مستندات Microsoft Word إلى PDF
- **الملفات المدعومة**: .docx, .doc
- **الحالة**: نموذج أولي
- **ملاحظة**: يتطلب تكامل مع خدمات خارجية للتحويل الكامل

### 3. PowerPoint إلى PDF
- **الوصف**: تحويل عروض PowerPoint إلى PDF
- **الملفات المدعومة**: .pptx, .ppt
- **الحالة**: نموذج أولي
- **ملاحظة**: يحول كل شريحة إلى صفحة منفصلة

### 4. Excel إلى PDF
- **الوصف**: تحويل جداول Excel إلى PDF
- **الملفات المدعومة**: .xlsx, .xls, .csv
- **الحالة**: نموذج أولي
- **ملاحظة**: يحول كل ورقة عمل إلى صفحة منفصلة

### 5. HTML إلى PDF
- **الوصف**: تحويل صفحات HTML إلى PDF
- **الملفات المدعومة**: .html, .htm
- **الحالة**: نموذج أولي
- **ملاحظة**: يدعم HTML الأساسي مع CSS مضمن

## التحسينات المطلوبة للإنتاج

### للحصول على تحويل كامل، يُنصح بتكامل مع:

#### Word إلى PDF:
- **Microsoft Graph API**: للتحويل السحابي
- **LibreOffice Online**: للتحويل المحلي
- **mammoth.js**: لاستخراج المحتوى
- **Pandoc**: للتحويل عبر سطر الأوامر

#### PowerPoint إلى PDF:
- **Microsoft Graph API**: للتحويل السحابي
- **LibreOffice Online**: للتحويل المحلي
- **pptx2html + html2pdf**: للتحويل متعدد المراحل

#### Excel إلى PDF:
- **Microsoft Graph API**: للتحويل السحابي
- **SheetJS + jsPDF**: للتحويل في المتصفح
- **LibreOffice Online**: للتحويل المحلي

#### HTML إلى PDF:
- **Puppeteer**: لعرض HTML وتحويله
- **Playwright**: بديل لـ Puppeteer
- **wkhtmltopdf**: أداة سطر الأوامر
- **html2canvas + jsPDF**: للتحويل في المتصفح

## الملفات المضافة

```
features/
├── JpgToPdfTool/
│   ├── JpgToPdfTool.tsx
│   └── useJpgToPdfTool.ts
├── WordToPdfTool/
│   ├── WordToPdfTool.tsx
│   └── useWordToPdfTool.ts
├── PowerPointToPdfTool/
│   ├── PowerPointToPdfTool.tsx
│   └── usePowerPointToPdfTool.ts
├── ExcelToPdfTool/
│   ├── ExcelToPdfTool.tsx
│   └── useExcelToPdfTool.ts
└── HtmlToPdfTool/
    ├── HtmlToPdfTool.tsx
    └── useHtmlToPdfTool.ts
```

## التعديلات على الملفات الموجودة

- **types.ts**: إضافة معرفات الأدوات الجديدة
- **App.tsx**: إضافة الأدوات إلى القائمة والتوجيه

## الاستخدام

1. اختر الأداة المناسبة من القائمة الرئيسية
2. ارفع الملفات المطلوبة
3. انقر على "تحويل إلى PDF"
4. حمل الملف المحول

## ملاحظات مهمة

- أدوات JPG إلى PDF تعمل بشكل كامل
- باقي الأدوات هي نماذج أولية تحتاج تطوير إضافي
- للاستخدام في الإنتاج، يُنصح بتكامل مع خدمات التحويل المتخصصة
- جميع الأدوات تدعم رفع ملفات متعددة
- التحويل يتم محلياً في المتصفح (عدا الخدمات الخارجية)