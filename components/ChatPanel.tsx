
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Message } from '../types';
import { createChat, sendMessageStream } from '../services/geminiService';

interface ChatPanelProps {
  systemInstruction: string;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <span className="text-gray-400">ИИ печатает</span>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

export const ChatPanel: React.FC<ChatPanelProps> = ({ systemInstruction }) => {
  const chatInstance = useRef<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
      {
          id: 'initial-ai-message',
          sender: 'ai',
          text: 'Чат запущен. Задайте мне вопрос!'
      }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatInstance.current = createChat(systemInstruction);
  }, [systemInstruction]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = currentInput.trim();
    if (!trimmedInput || isLoading || !chatInstance.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    // Add a placeholder for the AI response
    setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '' }]);
    
    try {
        const stream = sendMessageStream(chatInstance.current, trimmedInput);
        for await (const chunk of stream) {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: msg.text + chunk } : msg
            ));
        }
    } catch (error) {
        console.error("Failed to get stream response:", error);
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: 'Произошла ошибка при получении ответа.' } : msg
        ));
    } finally {
        setIsLoading(false);
    }

  }, [currentInput, isLoading]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full max-h-screen">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                AI
              </div>
            )}
            <div
              className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                <div className="bg-gray-700 rounded-2xl rounded-bl-none">
                    <TypingIndicator />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-6 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center bg-gray-800 rounded-lg p-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Введите ваше сообщение..."
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none px-3"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !currentInput.trim()}
            className="bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
