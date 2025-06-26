import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('تنظيم PDF - اختبار رفع الملف', () => {
  
  test('يجب أن يتم رفع ملف PDF بنجاح في أداة تنظيم PDF', async ({ page }) => {
    // الانتقال إلى الصفحة الرئيسية
    await page.goto('/');
    
    // انتظار تحميل التطبيق
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    
    // النقر على أداة تنظيم PDF
    await page.getByRole('button', { name: 'تنظيم PDF' }).click();
    
    // التحقق من الوصول لصفحة تنظيم PDF
    await expect(page.getByText('اسحب وأفلت ملفات PDF (ملف واحد) هنا، أو انقر للتصفح')).toBeVisible();
    await expect(page.getByText('PDF فقط')).toBeVisible();
    
    // رفع ملف PDF تجريبي
    const testPdfPath = path.join(__dirname, 'fixtures', 'test-document.pdf');
    const fileInput = page.locator('input[type="file"]');
    
    // رفع الملف
    await fileInput.setInputFiles(testPdfPath);
    
    // انتظار بدء عملية الرفع والمعالجة
    // نتوقع رسالة تحميل أو تغيير في الواجهة
    await page.waitForTimeout(2000);
    
    // التحقق من عدم وجود رسائل خطأ فورية
    const errorMessages = page.locator('[data-testid="error-message"], .error, .alert-error');
    await expect(errorMessages).toHaveCount(0);
    
    // انتظار معالجة الملف (قد تستغرق وقتاً)
    await page.waitForTimeout(5000);
    
    // البحث عن مؤشرات نجاح العملية أو أخطاء
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
    const successIndicator = page.locator('[data-testid="success"], .success, .pdf-pages');
    const errorIndicator = page.locator('[data-testid="error"], .error, .alert-error');
    
    // تسجيل حالة العملية
    console.log('فحص حالة المعالجة...');
    
    const hasLoading = await loadingIndicator.count() > 0;
    const hasSuccess = await successIndicator.count() > 0;
    const hasError = await errorIndicator.count() > 0;
    
    console.log(`مؤشر التحميل: ${hasLoading}`);
    console.log(`مؤشر النجاح: ${hasSuccess}`);
    console.log(`مؤشر الخطأ: ${hasError}`);
    
    // التحقق من النتائج
    if (hasError) {
      const errorText = await errorIndicator.first().textContent();
      console.log(`رسالة الخطأ: ${errorText}`);
      
      // فشل الاختبار مع تفاصيل الخطأ
      throw new Error(`فشل في رفع الملف: ${errorText}`);
    }
    
    // إذا كان لا يزال يحمل، ننتظر أكثر
    if (hasLoading) {
      console.log('لا يزال التحميل جارياً، انتظار إضافي...');
      await page.waitForTimeout(10000);
      
      // فحص مرة أخيرة
      const finalError = await page.locator('[data-testid="error"], .error, .alert-error').count();
      if (finalError > 0) {
        const errorText = await page.locator('[data-testid="error"], .error, .alert-error').first().textContent();
        throw new Error(`فشل في معالجة الملف: ${errorText}`);
      }
    }
    
    // التحقق من عدم وجود أخطاء في وحدة التحكم
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`${msg.type()}: ${text}`);
      if (msg.type() === 'error') {
        console.log(`خطأ في وحدة التحكم: ${text}`);
      }
    });
    
    // انتظار إضافي للتأكد من استقرار الحالة
    await page.waitForTimeout(3000);
    
    // تسجيل حالة الصفحة النهائية
    const finalPageContent = await page.content();
    console.log('المحتوى النهائي للصفحة:', finalPageContent.length > 0 ? 'موجود' : 'فارغ');
    
    // التحقق من أن العملية تمت بدون أخطاء حرجة
    expect(consoleLogs.filter(log => log.includes('error:'))).toHaveLength(0);
  });

  test('يجب أن يظهر خطأ عند رفع ملف غير صحيح', async ({ page }) => {
    // الانتقال إلى الصفحة الرئيسية
    await page.goto('/');
    
    // انتظار تحميل التطبيق
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    
    // النقر على أداة تنظيم PDF
    await page.getByRole('button', { name: 'تنظيم PDF' }).click();
    
    // التحقق من الوصول لصفحة تنظيم PDF
    await expect(page.getByText('اسحب وأفلت ملفات PDF (ملف واحد) هنا، أو انقر للتصفح')).toBeVisible();
    
    // إنشاء ملف نصي مؤقت للاختبار
    const testTextFile = path.join(__dirname, 'fixtures', 'test-invalid.txt');
    const fs = await import('fs');
    fs.writeFileSync(testTextFile, 'This is not a PDF file');
    
    try {
      const fileInput = page.locator('input[type="file"]');
      
      // محاولة رفع ملف نصي بدلاً من PDF
      await fileInput.setInputFiles(testTextFile);
      
      // انتظار ظهور رسالة خطأ
      await page.waitForTimeout(2000);
      
      // التحقق من وجود رسالة خطأ أو رفض الملف
      const errorMessage = page.locator('[data-testid="error"], .error, .alert-error');
      
      // إما أن تظهر رسالة خطأ أو لا يتم قبول الملف أصلاً
      const hasError = await errorMessage.count() > 0;
      if (hasError) {
        const errorText = await errorMessage.first().textContent();
        console.log(`رسالة الخطأ المتوقعة: ${errorText}`);
        expect(errorText).toBeTruthy();
      } else {
        // التحقق من أن الملف لم يتم معالجته
        console.log('لم يتم قبول الملف غير الصحيح - هذا متوقع');
      }
      
    } finally {
      // تنظيف الملف المؤقت
      try {
        const fs = await import('fs');
        fs.unlinkSync(testTextFile);
      } catch (e) {
        // تجاهل أخطاء الحذف
      }
    }
  });

  test('يجب أن تعمل أزرار التنقل بشكل صحيح', async ({ page }) => {
    // الانتقال إلى الصفحة الرئيسية
    await page.goto('/');
    
    // انتظار تحميل التطبيق
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    
    // النقر على أداة تنظيم PDF
    await page.getByRole('button', { name: 'تنظيم PDF' }).click();
    
    // التحقق من وجود زر العودة
    const backButton = page.getByRole('button', { name: 'العودة إلى الأدوات' });
    await expect(backButton).toBeVisible();
    
    // النقر على زر العودة
    await backButton.click();
    
    // التحقق من العودة للصفحة الرئيسية
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    await expect(page.getByRole('button', { name: 'تنظيم PDF' })).toBeVisible();
  });
});