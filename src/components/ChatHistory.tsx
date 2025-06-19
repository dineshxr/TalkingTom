import React from 'react';
import { User, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg">Start a conversation!</p>
        <p className="text-sm mt-2">Tap the microphone to begin talking with me.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 ${
            message.isUser ? 'flex-row-reverse space-x-reverse' : ''
          }`}
        >
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${message.isUser 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-green-100 text-green-600'
            }
          `}>
            {message.isUser ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          
          <div className={`
            flex-1 px-4 py-3 rounded-2xl max-w-xs lg:max-w-md
            ${message.isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }
          `}>
            <p className="text-sm leading-relaxed">{message.text}</p>
            <p className={`text-xs mt-1 opacity-70`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};