# 🔗 AI Professor Verse - Frontend Integration Guide

This guide explains how to integrate your existing React frontend with the comprehensive backend system.

## Overview

The backend provides a complete microservices architecture that enhances your 3D professor system with:
- **AI-powered tutoring** with GPT-4 integration
- **Real-time emotion detection** and adaptive responses
- **Secure code execution** sandbox
- **Advanced analytics** and learning insights
- **Scalable WebRTC** communication
- **Multi-tenant** organization support

## Quick Start Integration

### 1. Install Backend SDK

```bash
cd ai-professor-verse
npm install axios socket.io-client @types/socket.io-client
```

### 2. Environment Configuration

Create or update your frontend `.env` file:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WEBSOCKET_URL=ws://localhost:3003/realtime
VITE_AI_SERVICE_URL=http://localhost:3002
VITE_REALTIME_SERVICE_URL=http://localhost:3003

# Authentication
VITE_JWT_STORAGE_KEY=ai_professor_token
VITE_REFRESH_TOKEN_KEY=ai_professor_refresh

# Features
VITE_ENABLE_EMOTION_DETECTION=true
VITE_ENABLE_CODE_EXECUTION=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE_CHAT=true
```

### 3. Create API Client

Create `src/services/api.ts`:

```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
      localStorage.setItem(import.meta.env.VITE_JWT_STORAGE_KEY, accessToken);
      localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, newRefreshToken);
    } catch (error) {
      this.logout();
    }
  }

  private logout(): void {
    localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY);
    localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
    window.location.href = '/login';
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any): Promise<ApiResponse> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  // AI methods
  async chatWithAI(message: string, context: string[] = [], sessionId?: string): Promise<ApiResponse> {
    const response = await this.client.post('/ai/chat', {
      message,
      context,
      sessionId,
      subject: 'General',
      difficulty: 'intermediate',
    });
    return response.data;
  }

  async analyzeCode(code: string, language: string): Promise<ApiResponse> {
    const response = await this.client.post('/ai/code/analyze', {
      code,
      language,
      analysisType: 'review',
    });
    return response.data;
  }

  async detectEmotion(imageData: string, sessionId: string): Promise<ApiResponse> {
    const response = await this.client.post('/ai/emotion/detect', {
      type: 'facial',
      data: imageData,
      sessionId,
    });
    return response.data;
  }

  // Code execution
  async executeCode(code: string, language: string, input?: string): Promise<ApiResponse> {
    const response = await this.client.post('/code/execute', {
      code,
      language,
      input,
      timeout: 10000,
      memoryLimit: 128,
    });
    return response.data;
  }

  // Analytics
  async getLearningAnalytics(timeframe: string = 'week'): Promise<ApiResponse> {
    const response = await this.client.get(`/analytics/learning?timeframe=${timeframe}`);
    return response.data;
  }

  async getLearningPatterns(): Promise<ApiResponse> {
    const response = await this.client.get('/analytics/patterns');
    return response.data;
  }

  // User profile
  async getUserProfile(): Promise<ApiResponse> {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(data: any): Promise<ApiResponse> {
    const response = await this.client.put('/users/profile', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### 4. Create WebSocket Service

Create `src/services/websocket.ts`:

```typescript
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
      const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
      
      this.socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
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
  onUserJoined(callback: (data: any) => void): void {
    this.socket?.on('user_joined', callback);
  }

  onUserLeft(callback: (data: any) => void): void {
    this.socket?.on('user_left', callback);
  }

  onNewMessage(callback: (message: ChatMessage) => void): void {
    this.socket?.on('new_message', (event) => {
      callback(event.payload);
    });
  }

  onEmotionDetected(callback: (data: any) => void): void {
    this.socket?.on('emotion_detected', callback);
  }

  onTutoringRecommendations(callback: (data: any) => void): void {
    this.socket?.on('tutoring_recommendations', callback);
  }

  // WebRTC signaling
  sendWebRTCSignal(targetUserId: string, signal: any, type: 'offer' | 'answer' | 'ice-candidate'): void {
    if (this.sessionId) {
      this.socket?.emit('webrtc_signal', {
        sessionId: this.sessionId,
        targetUserId,
        signal,
        type,
      });
    }
  }

  onWebRTCSignal(callback: (data: any) => void): void {
    this.socket?.on('webrtc_signal', callback);
  }
}

export const websocketService = new WebSocketService();
```

### 5. Enhanced AI Professor Interface

Update your `AIProfessorInterface.tsx` to integrate with the backend:

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { ProfessorAvatar } from './ProfessorAvatar';
import { VoiceInterface } from './VoiceInterface';
import { EmotionDetection } from './EmotionDetection';
import { apiClient } from '../../services/api';
import { websocketService, type EmotionData, type ChatMessage } from '../../services/websocket';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

export const AIProfessorInterface: React.FC = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [codeToAnalyze, setCodeToAnalyze] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeAnalysis, setCodeAnalysis] = useState<any>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
        
        // Generate session ID
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        websocketService.joinSession(newSessionId, 'student');

        // Set up event listeners
        websocketService.onNewMessage((message) => {
          setMessages(prev => [...prev, message]);
          if (message.senderType === 'ai') {
            setAiResponse(message.content);
          }
        });

        websocketService.onEmotionDetected((data) => {
          console.log('Emotion detected:', data);
        });

        websocketService.onTutoringRecommendations((data) => {
          setRecommendations(data.recommendations);
        });

      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
      }
    };

    initializeConnection();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Handle emotion detection
  const handleEmotionDetected = useCallback((emotion: EmotionData) => {
    setCurrentEmotion(emotion);
    
    // Send emotion update to backend
    if (isConnected) {
      websocketService.sendEmotionUpdate(emotion);
    }
  }, [isConnected]);

  // Send message to AI
  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: 'user',
        senderType: 'user',
        content: currentMessage,
        type: 'text',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send via WebSocket for real-time updates
      websocketService.sendMessage(currentMessage, 'text');

      // Also send to AI service for processing
      const context = messages.slice(-5).map(m => m.content);
      const response = await apiClient.chatWithAI(currentMessage, context, sessionId);
      
      if (response.success) {
        // AI response will come through WebSocket
        setCurrentMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze code
  const analyzeCode = async () => {
    if (!codeToAnalyze.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.analyzeCode(codeToAnalyze, codeLanguage);
      if (response.success) {
        setCodeAnalysis(response.data);
      }
    } catch (error) {
      console.error('Failed to analyze code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute code
  const executeCode = async () => {
    if (!codeToAnalyze.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.executeCode(codeToAnalyze, codeLanguage);
      if (response.success) {
        const executionMessage: ChatMessage = {
          id: `exec_${Date.now()}`,
          senderId: 'system',
          senderType: 'system',
          content: `Code Output:\n${response.data.output || response.data.error}`,
          type: 'code',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, executionMessage]);
      }
    } catch (error) {
      console.error('Failed to execute code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Professor Verse
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {currentEmotion && (
              <Badge variant="outline">
                Emotion: {currentEmotion.emotion} ({Math.round(currentEmotion.confidence * 100)}%)
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Avatar Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>AI Professor Avatar</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <ProfessorAvatar
                  emotion={currentEmotion?.emotion as any}
                  isSpeaking={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Emotion Detection */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <EmotionDetection
                  onEmotionDetected={handleEmotionDetected}
                  isActive={isConnected}
                />
              </CardContent>
            </Card>

            {/* Voice Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceInterface
                  onTranscription={(text) => {
                    setCurrentMessage(text);
                    sendMessage();
                  }}
                  isEnabled={isConnected}
                />
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                        {rec}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chat and Code Interface */}
        <div className="mt-6">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="code">Code Review</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chat with AI Professor</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 p-3 rounded-lg ${
                          message.senderType === 'user'
                            ? 'bg-blue-500 text-white ml-auto max-w-xs'
                            : 'bg-white dark:bg-gray-700 max-w-xs'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.senderType === 'user' ? 'You' : 'AI Professor'}
                        </div>
                        <div className="text-sm">{message.content}</div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask the AI professor anything..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={isLoading || !isConnected}>
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Code Review & Execution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                    <Button onClick={analyzeCode} disabled={isLoading}>
                      Analyze Code
                    </Button>
                    <Button onClick={executeCode} disabled={isLoading} variant="outline">
                      Execute Code
                    </Button>
                  </div>

                  <Textarea
                    value={codeToAnalyze}
                    onChange={(e) => setCodeToAnalyze(e.target.value)}
                    placeholder="Paste your code here for analysis..."
                    className="h-40 font-mono"
                  />

                  {codeAnalysis && (
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h4 className="font-semibold mb-2">Analysis Results:</h4>
                      <p className="text-sm mb-2">{codeAnalysis.analysis}</p>
                      
                      {codeAnalysis.suggestions?.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium mb-1">Suggestions:</h5>
                          <ul className="text-sm space-y-1">
                            {codeAnalysis.suggestions.map((suggestion: any, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.type}
                                </Badge>
                                <span>{suggestion.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Analytics dashboard will be implemented here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
```

## Advanced Integration Features

### 1. Emotion-Driven Avatar Responses

The backend's emotion detection service can drive your 3D avatar's behavior:

```typescript
// In your ProfessorAvatar component
useEffect(() => {
  if (currentEmotion) {
    // Adapt avatar behavior based on detected emotion
    switch (currentEmotion.emotion) {
      case 'confused':
        // Show more supportive gestures
        setAvatarMood('supportive');
        break;
      case 'frustrated':
        // Slow down explanations
        setAvatarSpeed('slow');
        break;
      case 'engaged':
        // Continue current approach
        setAvatarMood('encouraging');
        break;
    }
  }
}, [currentEmotion]);
```

### 2. Real-time Code Collaboration

Enable live code sharing and review:

```typescript
// Real-time code sharing
const shareCode = (code: string) => {
  websocketService.sendMessage(code, 'code');
};

// Receive code from others
websocketService.onNewMessage((message) => {
  if (message.type === 'code') {
    setSharedCode(message.content);
  }
});
```

### 3. Analytics Dashboard Integration

Create a comprehensive analytics view:

```typescript
const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState(null);
  const [patterns, setPatterns] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const [analyticsRes, patternsRes] = await Promise.all([
        apiClient.getLearningAnalytics('week'),
        apiClient.getLearningPatterns(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (patternsRes.success) setPatterns(patternsRes.data);
    };

    loadAnalytics();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Study time chart */}
      {/* Engagement metrics */}
      {/* Learning recommendations */}
    </div>
  );
};
```

## Deployment Integration

### 1. Environment-Specific Configuration

```typescript
// src/config/environment.ts
export const config = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api/v1',
    websocketUrl: 'ws://localhost:3003/realtime',
  },
  staging: {
    apiBaseUrl: 'https://api-staging.ai-professor-verse.com/api/v1',
    websocketUrl: 'wss://realtime-staging.ai-professor-verse.com/realtime',
  },
  production: {
    apiBaseUrl: 'https://api.ai-professor-verse.com/api/v1',
    websocketUrl: 'wss://realtime.ai-professor-verse.com/realtime',
  },
};
```

### 2. Error Handling and Retry Logic

```typescript
// Enhanced error handling
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
};
```

## Next Steps

1. **Start the Backend Services**:
   ```bash
   cd backend
   ./scripts/setup-dev.sh
   ```

2. **Update Frontend Dependencies**:
   ```bash
   npm install axios socket.io-client
   ```

3. **Test Integration**:
   - Start both frontend and backend
   - Test AI chat functionality
   - Verify emotion detection
   - Test code execution

4. **Deploy to Production**:
   ```bash
   cd backend
   ./scripts/deploy-k8s.sh
   ```

## Support

- **Backend API Docs**: `/backend/API_DOCUMENTATION.md`
- **Architecture Overview**: `/backend/README.md`
- **Deployment Guide**: `/backend/scripts/deploy-k8s.sh`

Your AI Professor Verse now has a production-ready, scalable backend that enhances every aspect of the learning experience! 🚀
