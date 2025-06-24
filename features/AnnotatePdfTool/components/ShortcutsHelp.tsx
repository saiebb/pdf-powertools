import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { shortcuts, shortcutCategories, formatShortcutKey, getShortcutsByCategory } from '../config/shortcuts';

interface ShortcutsHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const categories = Object.keys(shortcutCategories);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D1D1D1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A82E2] rounded-full flex items-center justify-center">
              <Keyboard size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#333333]">اختصارات لوحة المفاتيح</h3>
              <p className="text-sm text-[#666666]">جميع الاختصارات المتاحة في محرر PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
            title="إغلاق"
          >
            <X size={20} className="text-[#555555]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Global Shortcuts */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1A82E2] rounded-full"></span>
                  اختصارات عامة
                </h4>
                <div className="space-y-2">
                  {Object.entries(shortcuts.global).map(([key, shortcut]) => (
                    <div key={key} className="flex items-center justify-between p-2 hover:bg-[#F8F9FA] rounded">
                      <span className="text-sm text-[#666666]">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-[#F0F0F0] border border-[#D1D1D1] rounded text-xs font-mono">
                        {formatShortcutKey(key)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tool Shortcuts */}
              <div>
                <h4 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#28A745] rounded-full"></span>
                  أدوات التحرير
                </h4>
                <div className="space-y-2">
                  {Object.entries(shortcuts.tools).map(([key, shortcut]) => (
                    <div key={key} className="flex items-center justify-between p-2 hover:bg-[#F8F9FA] rounded">
                      <span className="text-sm text-[#666666]">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-[#F0F0F0] border border-[#D1D1D1] rounded text-xs font-mono">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel Shortcuts */}
              <div>
                <h4 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#FFC107] rounded-full"></span>
                  إدارة اللوحات
                </h4>
                <div className="space-y-2">
                  {Object.entries(shortcuts.panels).map(([key, shortcut]) => (
                    <div key={key} className="flex items-center justify-between p-2 hover:bg-[#F8F9FA] rounded">
                      <span className="text-sm text-[#666666]">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-[#F0F0F0] border border-[#D1D1D1] rounded text-xs font-mono">
                        {formatShortcutKey(key)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation and Text Editing */}
            <div className="space-y-6">
              {/* Navigation Shortcuts */}
              <div>
                <h4 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#17A2B8] rounded-full"></span>
                  التنقل والعرض
                </h4>
                <div className="space-y-2">
                  {Object.entries(shortcuts.navigation).map(([key, shortcut]) => (
                    <div key={key} className="flex items-center justify-between p-2 hover:bg-[#F8F9FA] rounded">
                      <span className="text-sm text-[#666666]">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-[#F0F0F0] border border-[#D1D1D1] rounded text-xs font-mono">
                        {formatShortcutKey(key)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Editing Shortcuts */}
              <div>
                <h4 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#7B29FF] rounded-full"></span>
                  تنسيق النص
                </h4>
                <div className="space-y-2">
                  {Object.entries(shortcuts.textEditing).map(([key, shortcut]) => (
                    <div key={key} className="flex items-center justify-between p-2 hover:bg-[#F8F9FA] rounded">
                      <span className="text-sm text-[#666666]">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-[#F0F0F0] border border-[#D1D1D1] rounded text-xs font-mono">
                        {formatShortcutKey(key)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-4">
                <h5 className="font-semibold text-[#333333] mb-2">نصائح مفيدة:</h5>
                <ul className="text-sm text-[#666666] space-y-1">
                  <li>• استخدم مفتاح Escape لإغلاق أي لوحة مفتوحة</li>
                  <li>• يمكن استخدام اختصارات الأدوات في أي وقت</li>
                  <li>• اختصارات تنسيق النص تعمل فقط عند تحديد أداة النص</li>
                  <li>• استخدم Ctrl+F للبحث السريع في المستند</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#D1D1D1] bg-[#F8F9FA]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#666666]">
              يمكنك الوصول لهذه المساعدة في أي وقت من قائمة المساعدة
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A82E2] text-white rounded-lg hover:bg-[#1668B8] transition-colors"
            >
              فهمت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};