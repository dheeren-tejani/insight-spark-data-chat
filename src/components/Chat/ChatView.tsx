
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { geminiService } from '../../services/geminiApi';
import { Send, MessageCircle, Bot, User, Sparkles } from 'lucide-react';

const ChatView: React.FC = () => {
  const { currentDataset, chatMessages, addChatMessage, isChatLoading, setChatLoading } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentDataset || isChatLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    addChatMessage(userMessage);
    setInputValue('');
    setChatLoading(true);

    try {
      const response = await geminiService.generateResponse(inputValue, currentDataset);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: response,
        timestamp: new Date()
      };

      addChatMessage(aiMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      addChatMessage(errorMessage);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    "Summarize this data",
    "Find correlations",
    "Detect outliers",
    "Show trends",
    "Compare segments"
  ];

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Dataset Selected</h3>
          <p className="text-gray-400">Select a dataset to start chatting with AI about your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] pb-4 mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Chat with AI</h1>
        <p className="text-gray-400">
          Ask questions about <span className="text-[#00d4ff]">{currentDataset.name}</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ask me anything about your data!</h3>
            <p className="text-gray-400 mb-6">I can help you analyze patterns, find insights, and answer questions</p>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-3">Quick actions:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(action)}
                    className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-gray-300 hover:border-[#00d4ff]/50 hover:text-white transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-[#00d4ff] to-[#7c3aed]'
                    : 'bg-[#2a2a2a]'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#00d4ff]" />
                  )}
                </div>
                <div className={`rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] text-white'
                    : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isChatLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-[#00d4ff]" />
                </motion.div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#2a2a2a] pt-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your data..."
              rows={1}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4ff]/50 resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isChatLoading}
            className="px-4 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
