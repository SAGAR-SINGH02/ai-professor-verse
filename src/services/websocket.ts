import { io, Socket } from 'socket.io-client';

export interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: Date;
  source: 'facial' | 'voice' | 'text';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'ai' | 'system';
  content: string;
  type: 'text' | 'voice' | 'image' | 'code';
  timestamp: Date;
}

class WebSocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('ai_professor_token');
      
      this.socket = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3003/realtime', {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('👋 Disconnected from WebSocket server');
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinSession(sessionId: string, userType: 'student' | 'professor' = 'student'): void {
    this.sessionId = sessionId;
    this.socket?.emit('join_session', { sessionId, userType });
  }

  leaveSession(): void {
    if (this.sessionId) {
      this.socket?.emit('leave_session', { sessionId: this.sessionId });
      this.sessionId = null;
    }
  }

  sendMessage(content: string, type: 'text' | 'voice' | 'code' = 'text'): void {
    if (this.sessionId) {
      this.socket?.emit('send_message', {
        sessionId: this.sessionId,
        content,
        type,
      });
    }
  }

  sendEmotionUpdate(emotion: EmotionData): void {
    if (this.sessionId) {
      this.socket?.emit('emotion_update', {
        sessionId: this.sessionId,
        emotion,
      });
    }
  }

  // Event listeners
  onUserJoined(callback: (data: { userId: string; username: string }) => void): void {
    this.socket?.on('user_joined', callback);
  }

  onUserLeft(callback: (data: { userId: string; username: string }) => void): void {
    this.socket?.on('user_left', callback);
  }

  onNewMessage(callback: (message: ChatMessage) => void): void {
    this.socket?.on('new_message', (event) => {
      callback(event.payload);
    });
  }

  onEmotionDetected(callback: (data: EmotionData) => void): void {
    this.socket?.on('emotion_detected', callback);
  }

  onTutoringRecommendations(callback: (data: { recommendations: string[]; priority: 'high' | 'medium' | 'low' }) => void): void {
    this.socket?.on('tutoring_recommendations', callback);
  }

  // WebRTC signaling
  sendWebRTCSignal(targetUserId: string, signal: unknown, type: 'offer' | 'answer' | 'ice-candidate'): void {
    if (this.sessionId) {
      this.socket?.emit('webrtc_signal', {
        sessionId: this.sessionId,
        targetUserId,
        signal,
        type,
      });
    }
  }

  onWebRTCSignal(callback: (data: { targetUserId: string; signal: unknown; type: 'offer' | 'answer' | 'ice-candidate' }) => void): void {
    this.socket?.on('webrtc_signal', callback);
  }
}

export const websocketService = new WebSocketService();
