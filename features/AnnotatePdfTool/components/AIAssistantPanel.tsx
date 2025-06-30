import React, { useState } from 'react';
import { Bot, X, Send, Lightbulb, FileText, MessageSquare, Wand2 } from 'lucide-react';
import { Button } from '../../../components/uiElements';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantPanelProps {
  isVisible: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  documentContent?: string;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  isVisible,
  onClose,
  currentPage,
  totalPages,
  // documentContent
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي لتعديل ملفات PDF. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isVisible) return null;

  const quickActions = [
    {
      icon: <FileText size={16} />,
      title: 'تلخيص المستند',
      description: 'احصل على ملخص سريع للمحتوى',
      action: 'summarize'
    },
    {
      icon: <MessageSquare size={16} />,
      title: 'استخراج النقاط الرئيسية',
      description: 'استخرج أهم النقاط من النص',
      action: 'extract_points'
    },
    {
      icon: <Wand2 size={16} />,
      title: 'تحسين التنسيق',
      description: 'اقتراحات لتحسين تنسيق المستند',
      action: 'improve_formatting'
    },
    {
      icon: <Lightbulb size={16} />,
      title: 'اقتراحات التعديل',
      description: 'احصل على اقتراحات لتحسين المحتوى',
      action: 'suggest_edits'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `شكراً لسؤالك: "${inputMessage}". هذه إجابة تجريبية من المساعد الذكي. في التطبيق الحقيقي، سيتم دمج خدمة ذكاء اصطناعي حقيقية هنا.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'summarize':
        message = 'يرجى تلخيص محتوى هذا المستند';
        break;
      case 'extract_points':
        message = 'استخرج النقاط الرئيسية من هذا المستند';
        break;
      case 'improve_formatting':
        message = 'كيف يمكنني تحسين تنسيق هذا المستند؟';
        break;
      case 'suggest_edits':
        message = 'ما هي اقتراحاتك لتحسين محتوى هذا المستند؟';
        break;
    }
    setInputMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#D1D1D1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#7B29FF] to-[#9D4EDD] rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#333333]">مساعد AI</h3>
              <p className="text-sm text-[#666666]">صفحة {currentPage + 1} من {totalPages}</p>
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

        {/* Quick Actions */}
        <div className="p-4 border-b border-[#D1D1D1]">
          <h4 className="text-sm font-medium text-[#333333] mb-3">إجراءات سريعة:</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="p-3 text-left border border-[#D1D1D1] rounded-lg hover:border-[#1A82E2] hover:bg-[#F8F9FA] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[#1A82E2] group-hover:text-[#1668B8]">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium text-[#333333]">{action.title}</span>
                </div>
                <p className="text-xs text-[#666666]">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 adobe-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-[#1A82E2] text-white'
                    : 'bg-[#F8F9FA] text-[#333333] border border-[#E0E0E0]'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-[#999999]'
                }`}>
                  {message.timestamp.toLocaleTimeString('ar-SA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#F8F9FA] border border-[#E0E0E0] p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1A82E2]"></div>
                  <span className="text-sm text-[#666666]">المساعد يكتب...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#D1D1D1]">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب سؤالك أو طلبك هنا..."
              className="flex-1 p-3 border border-[#D1D1D1] rounded-lg resize-none focus:border-[#1A82E2] focus:outline-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#1A82E2] hover:bg-[#1668B8] text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Send size={16} />
              إرسال
            </Button>
          </div>
          <p className="text-xs text-[#999999] mt-2">
            اضغط Enter للإرسال، Shift+Enter لسطر جديد
          </p>
        </div>
      </div>
    </div>
  );
};