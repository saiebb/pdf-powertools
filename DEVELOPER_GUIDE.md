# دليل المطور - تقسيم الأدوات إلى مجموعات

## 🏗️ البنية الجديدة

### تعريف المجموعات
```typescript
interface ToolGroup {
  id: string;           // معرف فريد للمجموعة
  name: string;         // اسم المجموعة بالعربية
  description: string;  // وصف المجموعة
  icon: LucideIcon;     // أيقونة المجموعة
  color: string;        // لون المجموعة (blue, green, purple, red)
  tools: Tool[];        // قائمة الأدوات في المجموعة
}
```

### إضافة أداة جديدة

#### 1. إضافة الأداة إلى types.ts
```typescript
export enum ToolId {
  // ... الأدوات الموجودة
  NEW_TOOL = 'new_tool',
}
```

#### 2. إضافة الأداة إلى قائمة TOOLS
```typescript
const TOOLS: Tool[] = [
  // ... الأدوات الموجودة
  { 
    id: ToolId.NEW_TOOL, 
    name: "أداة جديدة", 
    description: "وصف الأداة الجديدة", 
    icon: NewIcon, 
    acceptMultipleFiles: false, 
    acceptMimeType: "application/pdf" 
  },
];
```

#### 3. إضافة الأداة إلى المجموعة المناسبة
```typescript
const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'appropriate-group',
    // ... باقي خصائص المجموعة
    tools: TOOLS.filter(tool => [
      // ... الأدوات الموجودة
      ToolId.NEW_TOOL,  // إضافة الأداة الجديدة
    ].includes(tool.id))
  },
];
```

#### 4. إضافة معالج الأداة في renderSpecificToolUI
```typescript
switch (currentTool?.id) {
  // ... الحالات الموجودة
  case ToolId.NEW_TOOL:
    return <NewToolComponent uploadedFile={singleUploadedFile} />;
}
```

### إضافة مجموعة جديدة

```typescript
const TOOL_GROUPS: ToolGroup[] = [
  // ... المجموعات الموجودة
  {
    id: 'new-group',
    name: 'مجموعة جديدة',
    description: 'وصف المجموعة الجديدة',
    icon: NewGroupIcon,
    color: 'orange', // تأكد من إضافة اللون في getColorClasses
    tools: TOOLS.filter(tool => [
      ToolId.TOOL1,
      ToolId.TOOL2,
    ].includes(tool.id))
  }
];
```

### إضافة لون جديد للمجموعات

```typescript
const getColorClasses = (color: string) => {
  const colorMap = {
    // ... الألوان الموجودة
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      header: 'bg-orange-100',
      hover: 'hover:bg-orange-200'
    }
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};
```

## 🎨 تخصيص التصميم

### إضافة انيميشن جديد في index.css
```css
.new-animation {
  transition: all 0.3s ease-in-out;
}

.new-animation:hover {
  transform: scale(1.05);
}

@keyframes newKeyframe {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

### تخصيص ألوان المجموعات
```css
:root {
  --color-group-orange: #ea580c;
  --color-group-orange-light: #fed7aa;
}
```

## 🔍 ميزة البحث

### تخصيص منطق البحث
```typescript
const getFilteredGroups = () => {
  if (!searchQuery.trim()) {
    return TOOL_GROUPS;
  }

  const query = searchQuery.toLowerCase().trim();
  return TOOL_GROUPS.map(group => ({
    ...group,
    tools: group.tools.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      // إضافة معايير بحث جديدة
      tool.id.toLowerCase().includes(query)
    )
  })).filter(group => group.tools.length > 0);
};
```

### إضافة اختصارات لوحة مفاتيح جديدة
```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // اختصار موجود
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      // ...
    }
    
    // اختصار جديد
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      // منطق الاختصار الجديد
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

## 📱 التصميم المتجاوب

### نقاط التوقف المستخدمة
- `sm`: 640px وأكثر
- `md`: 768px وأكثر  
- `lg`: 1024px وأكثر
- `xl`: 1280px وأكثر

### تخصيص الشبكة
```typescript
// للأدوات داخل المجموعات
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// للإحصائيات السريعة
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```

## ♿ إمكانية الوصول

### إضافة دعم قارئات الشاشة
```typescript
<button
  aria-label="وصف واضح للزر"
  aria-expanded={isExpanded}
  aria-controls="element-id"
  role="button"
>
```

### إضافة دعم لوحة المفاتيح
```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
}}
```

## 🧪 الاختبار

### اختبار المجموعات
```typescript
// اختبار تصفية المجموعات
test('should filter groups based on search query', () => {
  // منطق الاختبار
});

// اختبار طي/توسيع المجموعات
test('should toggle group expansion', () => {
  // منطق الاختبار
});
```

## 📊 مراقبة الأداء

### قياس أداء البحث
```typescript
const startTime = performance.now();
const filteredGroups = getFilteredGroups();
const endTime = performance.now();
console.log(`البحث استغرق ${endTime - startTime} ميلي ثانية`);
```

## 🔧 نصائح للتطوير

1. **استخدم TypeScript**: للحصول على أفضل تجربة تطوير
2. **اتبع نمط التسمية**: استخدم أسماء واضحة ومعبرة
3. **اختبر على أجهزة مختلفة**: تأكد من التصميم المتجاوب
4. **راعي إمكانية الوصول**: اختبر مع قارئات الشاشة
5. **استخدم Git**: احفظ التغييرات بانتظام

## 🐛 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### المجموعة لا تظهر
- تأكد من إضافة الأدوات إلى المجموعة
- تحقق من تطابق ToolId

#### البحث لا يعمل
- تأكد من تحديث filteredGroups
- تحقق من منطق التصفية

#### الألوان لا تظهر
- تأكد من إضافة اللون في getColorClasses
- تحقق من أسماء الكلاسات في Tailwind

## 📚 مراجع مفيدة

- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React Icons](https://lucide.dev/)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)