export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export type ConversationState = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'thinking' 
  | 'speaking';

export interface AudioVisualizationData {
  frequency: Uint8Array;
  volume: number;
}

export interface EmotionalState {
  happiness: number;
  excitement: number;
  curiosity: number;
  confusion: number;
}