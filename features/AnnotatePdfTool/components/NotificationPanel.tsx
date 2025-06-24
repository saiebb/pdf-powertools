import React from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isVisible,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
  if (!isVisible) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute top-16 left-4 w-80 bg-white border border-[#D1D1D1] rounded-lg shadow-lg z-40 contextual-toolbar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#D1D1D1]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#555555]" />
          <span className="text-sm font-medium text-[#333333]">الإشعارات</span>
          {unreadCount > 0 && (
            <span className="bg-[#1A82E2] text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-[#666666] hover:text-[#1A82E2] transition-colors"
            >
              مسح الكل
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F0F0F0] rounded transition-colors"
            title="إغلاق"
          >
            <X size={16} className="text-[#555555]" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto adobe-scrollbar">
        {notifications.length > 0 ? (
          <div className="divide-y divide-[#F0F0F0]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-[#F8F9FA] transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${
                        !notification.isRead ? 'text-[#333333]' : 'text-[#666666]'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-[#1A82E2] rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-sm ${
                      !notification.isRead ? 'text-[#555555]' : 'text-[#999999]'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock size={12} className="text-[#999999]" />
                      <span className="text-xs text-[#999999]">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell size={32} className="text-[#CCCCCC] mx-auto mb-2" />
            <p className="text-sm text-[#999999]">لا توجد إشعارات</p>
          </div>
        )}
      </div>
    </div>
  );
};