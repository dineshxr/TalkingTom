import React, { useState, useCallback, useEffect } from 'react';
import { Character3D } from './components/Character3D';
import { VoiceControls } from './components/VoiceControls';
import { ChatHistory } from './components/ChatHistory';
import { SettingsPanel } from './components/SettingsPanel';
import { ApiKeyInput } from './components/ApiKeyInput';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { openAIService } from './services/openai';
import { ttsService } from './services/textToSpeech';
import { ChatMessage, ConversationState, VoiceSettings } from './types';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8
  });

  const {
    isRecording,
    audioBlob,
    volume,
    startRecording,
    stopRecording,
    clearRecording
  } = useAudioRecording();

  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  useEffect(() => {
    if (apiKey) {
      openAIService.setApiKey(apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (isRecording || isListening) {
      setConversationState('listening');
    } else if (conversationState === 'listening') {
      setConversationState('idle');
    }
  }, [isRecording, isListening, conversationState]);

  useEffect(() => {
    if (transcript && !isListening) {
      handleUserMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening]);

  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationState('thinking');

    try {
      const allMessages = [...messages, userMessage];
      const response = await openAIService.sendMessage(allMessages);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationState('speaking');

      // Speak the response
      await ttsService.speak(response, voiceSettings);
      setConversationState('idle');

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble right now. Please try again!",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setConversationState('idle');
    }
  }, [messages, voiceSettings]);

  const handleStartRecording = useCallback(async () => {
    try {
      if (speechSupported) {
        startListening();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  }, [speechSupported, startListening, startRecording]);

  const handleStopRecording = useCallback(() => {
    if (speechSupported) {
      stopListening();
    } else {
      stopRecording();
    }
  }, [speechSupported, stopListening, stopRecording]);

  if (!apiKey) {
    return <ApiKeyInput onApiKeySubmit={setApiKey} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Voice Companion
          </h1>
          <p className="text-gray-600">
            Your interactive 3D AI friend powered by advanced voice technology
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* 3D Character */}
          <div className="bg-white rounded-3xl shadow-xl p-6 h-96">
            <Character3D state={conversationState} volume={volume} />
          </div>

          {/* Chat Interface */}
          <div className="space-y-6">
            {/* Chat History */}
            <div className="bg-white rounded-3xl shadow-xl p-6 min-h-96">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Conversation</h2>
              <ChatHistory messages={messages} />
            </div>

            {/* Voice Controls */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <VoiceControls
                state={conversationState}
                isRecording={isRecording || isListening}
                volume={volume}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onToggleSettings={() => setShowSettings(true)}
              />
            </div>
          </div>
        </div>

        {/* Current transcript display */}
        {(transcript || isListening) && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg">
            {transcript || "Listening..."}
          </div>
        )}

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={voiceSettings}
          onSettingsChange={setVoiceSettings}
        />
      </div>
    </div>
  );
}

export default App;