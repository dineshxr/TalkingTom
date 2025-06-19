import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Heart } from 'lucide-react';
import { ConversationState } from '../types';

interface VoiceControlsProps {
  state: ConversationState;
  isRecording: boolean;
  volume: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleSettings: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  state,
  isRecording,
  volume,
  onStartRecording,
  onStopRecording,
  onToggleSettings
}) => {
  const getButtonColor = () => {
    switch (state) {
      case 'listening': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-300';
      case 'processing': return 'bg-purple-500 hover:bg-purple-600 shadow-purple-300';
      case 'thinking': return 'bg-orange-500 hover:bg-orange-600 shadow-orange-300';
      case 'speaking': return 'bg-green-500 hover:bg-green-600 shadow-green-300';
      default: return 'bg-pink-500 hover:bg-pink-600 shadow-pink-300';
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'listening': return '🎧 Listening to you...';
      case 'processing': return '🤔 Processing your words...';
      case 'thinking': return '💭 Thinking of a response...';
      case 'speaking': return '😸 Meowing back to you!';
      default: return '😺 Tap to chat with me!';
    }
  };

  const getStateEmoji = () => {
    switch (state) {
      case 'listening': return '👂';
      case 'processing': return '⚡';
      case 'thinking': return '🧠';
      case 'speaking': return '💬';
      default: return '😸';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Emotional state indicator */}
      <div className="flex items-center space-x-2 text-2xl">
        <span>{getStateEmoji()}</span>
        {state === 'speaking' && <Heart className="w-5 h-5 text-red-400 animate-pulse" />}
      </div>

      {/* Main voice button */}
      <div className="relative">
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={state === 'processing' || state === 'thinking' || state === 'speaking'}
          className={`
            relative w-24 h-24 rounded-full text-white font-semibold
            transform transition-all duration-300 ease-out
            shadow-2xl hover:shadow-3xl
            ${getButtonColor()}
            ${isRecording ? 'scale-110 animate-pulse' : 'hover:scale-105'}
            disabled:opacity-50 disabled:cursor-not-allowed
            border-4 border-white/20
          `}
        >
          {isRecording ? (
            <MicOff className="w-10 h-10 mx-auto" />
          ) : (
            <Mic className="w-10 h-10 mx-auto" />
          )}
          
          {/* Pulsing ring effect */}
          {isRecording && (
            <>
              <div 
                className="absolute inset-0 rounded-full bg-white opacity-10 animate-ping"
                style={{ 
                  transform: `scale(${1 + volume * 0.8})`,
                  animationDuration: `${Math.max(0.5, 2 - volume * 1.5)}s`
                }}
              />
              <div 
                className="absolute inset-0 rounded-full bg-white opacity-5 animate-pulse"
                style={{ 
                  transform: `scale(${1.2 + volume * 0.6})`,
                  animationDuration: `${Math.max(0.8, 3 - volume * 2)}s`
                }}
              />
            </>
          )}
        </button>
        
        {/* Enhanced volume indicator */}
        {isRecording && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    volume * 7 > i 
                      ? `bg-gradient-to-t from-blue-400 to-blue-200 h-${Math.min(6, Math.floor(volume * 7) + 2)}` 
                      : 'bg-gray-300 h-2'
                  }`}
                  style={{
                    height: volume * 7 > i ? `${Math.min(24, (volume * 7 - i + 1) * 8)}px` : '8px'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced state text with animations */}
      <div className="text-center min-h-[60px] flex flex-col items-center justify-center">
        <p className="text-lg font-medium text-gray-700 mb-1">
          {getStateText()}
        </p>
        {state === 'listening' && (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        {state === 'thinking' && (
          <div className="text-orange-500 animate-pulse">
            <span className="text-2xl">🤔💭</span>
          </div>
        )}
        {state === 'speaking' && (
          <div className="flex space-x-1 text-green-500">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>😸</span>
            <span className="animate-bounce" style={{ animationDelay: '200ms' }}>💬</span>
            <span className="animate-bounce" style={{ animationDelay: '400ms' }}>✨</span>
          </div>
        )}
      </div>

      {/* Enhanced control buttons */}
      <div className="flex space-x-6">
        <button
          onClick={onToggleSettings}
          className="group p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Voice Settings"
        >
          <Settings className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
        </button>
        
        <button
          className="group p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Volume Control"
        >
          <Volume2 className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
        </button>

        <button
          className="group p-4 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Show some love!"
        >
          <Heart className="w-6 h-6 text-pink-600 group-hover:text-pink-800 transition-colors duration-200" />
        </button>
      </div>
    </div>
  );
};