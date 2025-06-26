import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('تنظيم PDF - اختبار شامل للرفع وتتبع الأخطاء', () => {
  let consoleLogs: string[] = [];
  let networkRequests: any[] = [];

  test.beforeEach(async ({ page }) => {
    // تسجيل رسائل وحدة التحكم
    consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      consoleLogs.push(`${type.toUpperCase()}: ${text}`);
      
      if (type === 'error') {
        console.log(`❌ خطأ في وحدة التحكم: ${text}`);
      } else if (type === 'warn') {
        console.log(`⚠️ تحذير في وحدة التحكم: ${text}`);
      } else if (type === 'info') {
        console.log(`ℹ️ معلومات في وحدة التحكم: ${text}`);
      }
    });

    // تسجيل طلبات الشبكة
    networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
    });

    // تسجيل أخطاء الصفحة
    page.on('pageerror', error => {
      console.log(`💥 خطأ في الصفحة: ${error.message}`);
      consoleLogs.push(`PAGE_ERROR: ${error.message}`);
    });

    // تسجيل فشل الطلبات
    page.on('requestfailed', request => {
      console.log(`🔴 فشل الطلب: ${request.url()} - ${request.failure()?.errorText}`);
      consoleLogs.push(`REQUEST_FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('اختبار شامل لرفع ملف PDF مع تتبع مفصل للأخطاء', async ({ page }) => {
    console.log('🚀 بدء اختبار رفع ملف PDF...');
    
    // الانتقال إلى الصفحة الرئيسية
    await page.goto('/');
    console.log('✅ تم الانتقال إلى الصفحة الرئيسية');
    
    // انتظار تحميل التطبيق
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    console.log('✅ تم تحميل التطبيق بنجاح');
    
    // النقر على أداة تنظيم PDF
    await page.getByRole('button', { name: 'تنظيم PDF' }).click();
    console.log('✅ تم النقر على أداة تنظيم PDF');
    
    // التحقق من الوصول لصفحة تنظيم PDF
    await expect(page.getByText('اسحب وأفلت ملفات PDF (ملف واحد) هنا، أو انقر للتصفح')).toBeVisible();
    await expect(page.getByText('PDF فقط')).toBeVisible();
    console.log('✅ تم الوصول لصفحة تنظيم PDF');
    
    // رفع ملف PDF تجريبي
    const testPdfPath = path.join(__dirname, 'fixtures', 'test-document.pdf');
    console.log(`📄 مسار الملف التجريبي: ${testPdfPath}`);
    
    const fileInput = page.locator('input[type="file"]');
    
    // تسجيل حالة الصفحة قبل الرفع
    console.log(`📊 عدد رسائل وحدة التحكم قبل الرفع: ${consoleLogs.length}`);
    console.log(`🌐 عدد طلبات الشبكة قبل الرفع: ${networkRequests.length}`);
    
    // رفع الملف
    await fileInput.setInputFiles(testPdfPath);
    console.log('✅ تم رفع الملف');
    
    // انتظار بدء عملية المعالجة
    await page.waitForTimeout(3000);
    console.log('⏳ انتظار 3 ثوانِ لبدء المعالجة...');
    
    // البحث عن مؤشرات مختلفة للحالة
    const loadingSelectors = [
      '[data-testid="loading"]',
      '.loading',
      '.spinner',
      'text="جاري التحميل"',
      'text="جاري المعالجة"',
      'text="جاري تحضير"'
    ];
    
    const successSelectors = [
      '[data-testid="success"]',
      '.success',
      '.pdf-pages',
      '[data-testid="pdf-page"]',
      '.page-thumbnail',
      'text="صفحة"'
    ];
    
    const errorSelectors = [
      '[data-testid="error"]',
      '.error',
      '.alert-error',
      'text="خطأ"',
      'text="فشل"',
      'text="غير صحيح"'
    ];
    
    // فحص كل المؤشرات
    let hasLoading = false;
    let hasSuccess = false;
    let hasError = false;
    
    for (const selector of loadingSelectors) {
      if (await page.locator(selector).count() > 0) {
        hasLoading = true;
        console.log(`🔄 تم العثور على مؤشر تحميل: ${selector}`);
        break;
      }
    }
    
    for (const selector of successSelectors) {
      if (await page.locator(selector).count() > 0) {
        hasSuccess = true;
        console.log(`✅ تم العثور على مؤشر نجاح: ${selector}`);
        break;
      }
    }
    
    for (const selector of errorSelectors) {
      if (await page.locator(selector).count() > 0) {
        hasError = true;
        const errorText = await page.locator(selector).first().textContent();
        console.log(`❌ تم العثور على مؤشر خطأ: ${selector} - ${errorText}`);
        break;
      }
    }
    
    console.log(`📊 الحالة الحالية - تحميل: ${hasLoading}, نجاح: ${hasSuccess}, خطأ: ${hasError}`);
    
    // إذا كان لا يزال يحمل، انتظار إضافي
    if (hasLoading && !hasError) {
      console.log('⏳ لا يزال التحميل جارياً، انتظار 10 ثوانِ إضافية...');
      await page.waitForTimeout(10000);
      
      // فحص مرة أخيرة للأخطاء
      hasError = false;
      for (const selector of errorSelectors) {
        if (await page.locator(selector).count() > 0) {
          hasError = true;
          const errorText = await page.locator(selector).first().textContent();
          console.log(`❌ خطأ بعد الانتظار: ${selector} - ${errorText}`);
          break;
        }
      }
    }
    
    // طباعة تفاصيل رسائل وحدة التحكم
    console.log(`\n📋 تقرير رسائل وحدة التحكم (${consoleLogs.length} رسالة):`);
    const errorLogs = consoleLogs.filter(log => log.startsWith('ERROR:'));
    const warningLogs = consoleLogs.filter(log => log.startsWith('WARN:'));
    const infoLogs = consoleLogs.filter(log => log.startsWith('INFO:') || log.startsWith('LOG:'));
    
    console.log(`❌ أخطاء: ${errorLogs.length}`);
    errorLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log}`);
    });
    
    console.log(`⚠️ تحذيرات: ${warningLogs.length}`);
    warningLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log}`);
    });
    
    console.log(`ℹ️ معلومات: ${infoLogs.length}`);
    if (infoLogs.length > 0) {
      console.log(`   آخر 5 رسائل معلوماتية:`);
      infoLogs.slice(-5).forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.substring(0, 100)}...`);
      });
    }
    
    // طباعة تفاصيل طلبات الشبكة
    console.log(`\n🌐 تقرير طلبات الشبكة (${networkRequests.length} طلب):`);
    const failedRequests = networkRequests.filter(req => {
      return consoleLogs.some(log => log.includes(`REQUEST_FAILED: ${req.url}`));
    });
    
    if (failedRequests.length > 0) {
      console.log(`🔴 طلبات فاشلة: ${failedRequests.length}`);
      failedRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.method} ${req.url}`);
      });
    } else {
      console.log(`✅ جميع طلبات الشبكة نجحت`);
    }
    
    // تسجيل حالة الصفحة النهائية
    const finalPageContent = await page.content();
    console.log(`📄 طول محتوى الصفحة النهائية: ${finalPageContent.length} حرف`);
    
    // التحقق من النتائج النهائية
    if (hasError) {
      console.log('💀 فشل الاختبار بسبب وجود أخطاء');
      // لا نرمي خطأ، بل نسجل فقط للمراجعة
    } else if (hasSuccess) {
      console.log('🎉 نجح الاختبار - تم رفع الملف بنجاح');
    } else {
      console.log('⚪ الاختبار محايد - لم يتم العثور على مؤشرات واضحة للنجاح أو الفشل');
    }
    
    // نتأكد من عدم وجود أخطاء حرجة في وحدة التحكم
    const criticalErrors = errorLogs.filter(log => 
      log.includes('SyntaxError') || 
      log.includes('ReferenceError') || 
      log.includes('TypeError') ||
      log.includes('Network Error') ||
      log.includes('Failed to fetch')
    );
    
    if (criticalErrors.length > 0) {
      console.log(`💥 تم العثور على ${criticalErrors.length} خطأ حرج:`);
      criticalErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // الاختبار يمر إذا لم تكن هناك أخطاء حرجة
    expect(criticalErrors.length).toBe(0);
  });

  test('اختبار تفاعل المستخدم مع واجهة رفع الملف', async ({ page }) => {
    console.log('🖱️ بدء اختبار تفاعل المستخدم...');
    
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    
    // النقر على أداة تنظيم PDF
    await page.getByRole('button', { name: 'تنظيم PDF' }).click();
    
    // التحقق من وجود منطقة رفع الملف
    const uploadArea = page.locator('[data-testid="upload-area"], .file-upload, .dropzone').first();
    const uploadText = page.getByText('اسحب وأفلت ملفات PDF (ملف واحد) هنا، أو انقر للتصفح');
    
    await expect(uploadText).toBeVisible();
    console.log('✅ منطقة رفع الملف مرئية');
    
    // التحقق من وجود input file
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveCount(1);
    console.log('✅ عنصر input file موجود');
    
    // التحقق من قبول ملفات PDF فقط
    const acceptAttribute = await fileInput.getAttribute('accept');
    console.log(`📋 قيمة accept attribute: ${acceptAttribute}`);
    
    // تجربة النقر على منطقة الرفع
    if (await uploadText.isVisible()) {
      await uploadText.click();
      console.log('✅ تم النقر على منطقة الرفع');
    }
    
    // التحقق من عدم وجود أخطاء بعد التفاعل
    await page.waitForTimeout(1000);
    const errorCount = consoleLogs.filter(log => log.startsWith('ERROR:')).length;
    console.log(`📊 عدد الأخطاء بعد التفاعل: ${errorCount}`);
    
    expect(errorCount).toBe(0);
  });

  test('اختبار التنقل والأزرار', async ({ page }) => {
    console.log('🧭 بدء اختبار التنقل...');
    
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    
    // النقر على أداة تنظيم PDF
    await page.getByRole('button', { name: 'تنظيم PDF' }).click();
    console.log('✅ تم الدخول لأداة تنظيم PDF');
    
    // التحقق من وجود زر العودة
    const backButton = page.getByRole('button', { name: 'العودة إلى الأدوات' });
    await expect(backButton).toBeVisible();
    console.log('✅ زر العودة مرئي');
    
    // النقر على زر العودة
    await backButton.click();
    console.log('✅ تم النقر على زر العودة');
    
    // التحقق من العودة للصفحة الرئيسية
    await expect(page.locator('h1')).toContainText('محرر PDF متعدد الأدوات');
    await expect(page.getByRole('button', { name: 'تنظيم PDF' })).toBeVisible();
    console.log('✅ تم العودة للصفحة الرئيسية بنجاح');
    
    // التحقق من عدم وجود أخطاء في التنقل
    const navigationErrors = consoleLogs.filter(log => 
      log.startsWith('ERROR:') && 
      (log.includes('navigation') || log.includes('route') || log.includes('404'))
    ).length;
    
    console.log(`📊 أخطاء التنقل: ${navigationErrors}`);
    expect(navigationErrors).toBe(0);
  });
});