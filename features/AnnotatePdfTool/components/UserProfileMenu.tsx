import React from 'react';
import { User, Settings, LogOut, HelpCircle, FileText, Crown } from 'lucide-react';

interface UserProfileMenuProps {
  isVisible: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'enterprise';
  };
  onAction: (action: string) => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  isVisible,
  onClose,
  user = {
    name: 'المستخدم',
    email: 'user@example.com',
    plan: 'free'
  },
  onAction
}) => {
  if (!isVisible) return null;

  const menuItems = [
    {
      icon: <User size={16} />,
      label: 'الملف الشخصي',
      action: 'profile',
      description: 'إدارة معلوماتك الشخصية'
    },
    {
      icon: <Settings size={16} />,
      label: 'الإعدادات',
      action: 'settings',
      description: 'تخصيص تفضيلاتك'
    },
    {
      icon: <FileText size={16} />,
      label: 'ملفاتي',
      action: 'my_files',
      description: 'عرض الملفات المحفوظة'
    },
    {
      icon: <Crown size={16} />,
      label: 'ترقية الحساب',
      action: 'upgrade',
      description: 'احصل على المزيد من الميزات',
      highlight: user.plan === 'free'
    },
    {
      icon: <HelpCircle size={16} />,
      label: 'المساعدة والدعم',
      action: 'help',
      description: 'احصل على المساعدة'
    }
  ];

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { label: 'مجاني', color: 'bg-gray-100 text-gray-600' },
      pro: { label: 'احترافي', color: 'bg-blue-100 text-blue-600' },
      enterprise: { label: 'مؤسسي', color: 'bg-purple-100 text-purple-600' }
    };
    return badges[plan as keyof typeof badges] || badges.free;
  };

  const planBadge = getPlanBadge(user.plan);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-30" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute top-16 left-4 w-72 bg-white border border-[#D1D1D1] rounded-lg shadow-lg z-40 contextual-toolbar">
        {/* User Info */}
        <div className="p-4 border-b border-[#D1D1D1]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#1A82E2] to-[#4A9EFF] rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[#333333] truncate">
                {user.name}
              </h3>
              <p className="text-xs text-[#666666] truncate">
                {user.email}
              </p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${planBadge.color}`}>
                {planBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                onAction(item.action);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors
                ${item.highlight ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''}
              `}
            >
              <div className={`flex-shrink-0 ${
                item.highlight ? 'text-[#7B29FF]' : 'text-[#555555]'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  item.highlight ? 'text-[#7B29FF]' : 'text-[#333333]'
                }`}>
                  {item.label}
                  {item.highlight && (
                    <span className="ml-2 bg-[#7B29FF] text-white text-xs px-2 py-1 rounded-full">
                      جديد
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#666666]">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-[#D1D1D1] p-2">
          <button
            onClick={() => {
              onAction('logout');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors rounded-md"
          >
            <LogOut size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-500">تسجيل الخروج</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#D1D1D1] bg-[#F8F9FA]">
          <p className="text-xs text-[#999999] text-center">
            PDF Editor v2.0.0
          </p>
        </div>
      </div>
    </>
  );
};