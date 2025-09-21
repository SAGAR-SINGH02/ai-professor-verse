import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Send, 
  Code, 
  MessageCircle, 
  Settings,
  Monitor,
  MonitorOff,
  Brain,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { ProfessorAvatar } from './ProfessorAvatar';
import { VoiceInterface } from './VoiceInterface';
import { EmotionDetection } from './EmotionDetection';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { aiAPI } from '@/services/api';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  type: 'user' | 'professor';
  content: string;
  timestamp: number;
  emotion?: string;
}

interface EmotionData {
  emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral' | 'confused' | 'frustrated' | 'bored';
  confidence: number;
  timestamp: number;
}

interface CodeError {
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export const AIProfessorInterface: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // UI State
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [professorEmotion, setProfessorEmotion] = useState<'neutral' | 'happy' | 'concerned' | 'encouraging' | 'thinking'>('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [studentEmotion, setStudentEmotion] = useState<EmotionData | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeErrors, setCodeErrors] = useState<CodeError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  // WebRTC State
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isEmotionDetectionEnabled, setIsEmotionDetectionEnabled] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Custom hooks
  const { 
    localStream, 
    remoteStream, 
    isConnected, 
    startCall, 
    endCall, 
    toggleVideo, 
    toggleAudio,
    startScreenShare,
    stopScreenShare
  } = useWebRTC();
  
  const { socket, isConnected: isSocketConnected } = useSocket();

  // Initialize AI Professor session
  useEffect(() => {
    if (user && socket) {
      const sessionId = `ai-session-${user.id}-${Date.now()}`;
      socket.emit('join-ai-session', {
        sessionId,
        userInfo: {
          name: user.name,
          avatar: user.profile.avatar,
          preferences: user.profile.preferences
        }
      });

      // Add welcome message
      const welcomeMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'professor',
        content: `Hello ${user.name}! I'm your AI Professor. I'm here to help you learn and understand complex concepts. What would you like to explore today?`,
        timestamp: Date.now(),
        emotion: 'happy'
      };
      
      setMessages([welcomeMessage]);
    }
  }, [user, socket]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle emotion detection
  const handleEmotionDetected = useCallback((emotionData: EmotionData) => {
    setStudentEmotion(emotionData);
    
    // Send emotion data to backend for adaptive responses
    if (socket && emotionData.confidence > 0.7) {
      socket.emit('emotion-detected', {
        emotion: emotionData.emotion,
        confidence: emotionData.confidence,
        sessionId: `ai-session-${user?.id}`
      });
    }
  }, [socket, user]);

  // Send message to AI Professor
  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: currentInput,
      timestamp: Date.now(),
      emotion: studentEmotion?.emotion
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsProcessing(true);

    try {
      // Send to AI service
      const response = await aiAPI.chat(
        currentInput,
        { previousMessages: messages.slice(-5) }, // Send last 5 messages for context
        studentEmotion?.emotion
      );

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        type: 'professor',
        content: response.data.response,
        timestamp: Date.now(),
        emotion: response.data.emotion
      };

      setMessages(prev => [...prev, aiMessage]);
      setProfessorEmotion(response.data.emotion);

      // Convert response to speech if audio is enabled
      if (isAudioEnabled && response.data.response) {
        try {
          const audioBlob = await aiAPI.textToSpeech(response.data.response, 'alloy');
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);
          await audio.play();
        } catch (speechError) {
          console.error('Text-to-speech error:', speechError);
        }
      }

      // Send AI message through socket for real-time updates
      if (socket) {
        socket.emit('ai-message', {
          message: response.data.response,
          sessionId: `ai-session-${user?.id}`,
          context: { emotion: response.data.emotion }
        });
      }

    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: "Communication Error",
        description: "Failed to communicate with AI Professor. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        type: 'professor',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: Date.now(),
        emotion: 'concerned'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [currentInput, messages, studentEmotion, isProcessing, isAudioEnabled, socket, user, toast]);

  // Handle code analysis
  const handleAnalyzeCode = useCallback(async () => {
    if (!codeInput.trim()) return;

    try {
      setIsProcessing(true);
      const response = await aiAPI.analyzeCode(codeInput, 'javascript'); // Default to JavaScript
      
      setCodeErrors(response.data.errors || []);
      
      // Add code analysis message
      const analysisMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'professor',
        content: `I've analyzed your code! Quality score: ${response.data.quality}/10. ${response.data.suggestions?.join(' ') || 'Great job!'}`,
        timestamp: Date.now(),
        emotion: response.data.quality > 7 ? 'happy' : 'encouraging'
      };
      
      setMessages(prev => [...prev, analysisMessage]);
      
    } catch (error) {
      console.error('Code analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [codeInput, toast]);

  // WebRTC Controls
  const handleStartVideo = useCallback(async () => {
    try {
      await startCall();
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      
      toast({
        title: "Video Call Started",
        description: "You're now in a face-to-face session with your AI Professor!",
      });
    } catch (error) {
      console.error('Video call error:', error);
      toast({
        title: "Video Call Failed",
        description: "Unable to start video call. Please check your camera permissions.",
        variant: "destructive",
      });
    }
  }, [startCall, toast]);

  const handleEndVideo = useCallback(() => {
    endCall();
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    
    toast({
      title: "Video Call Ended",
      description: "You've ended the face-to-face session.",
    });
  }, [endCall, toast]);

  const handleToggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
        setIsScreenSharing(false);
        toast({
          title: "Screen Share Stopped",
          description: "You've stopped sharing your screen.",
        });
      } else {
        await startScreenShare();
        setIsScreenSharing(true);
        toast({
          title: "Screen Share Started",
          description: "You're now sharing your screen with the AI Professor.",
        });
      }
    } catch (error) {
      console.error('Screen share error:', error);
      toast({
        title: "Screen Share Error",
        description: "Unable to toggle screen sharing. Please try again.",
        variant: "destructive",
      });
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare, toast]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center glow-primary">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-neural">AI Professor Session</h1>
              <p className="text-sm text-muted-foreground">
                {isSocketConnected ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 connection-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Connecting...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Connection Status & Controls */}
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Video & Professor Avatar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Video Call Section */}
            <Card className="p-4 glass-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Face-to-Face Session
                  </h3>
                  <Button
                    variant={isEmotionDetectionEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEmotionDetectionEnabled(!isEmotionDetectionEnabled)}
                  >
                    {isEmotionDetectionEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Video Display */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {isVideoEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ProfessorAvatar 
                        emotion={professorEmotion}
                        isSpeaking={isSpeaking}
                        className="w-32 h-32"
                      />
                    </div>
                  )}
                  
                  {/* Emotion Detection Overlay */}
                  {isEmotionDetectionEnabled && studentEmotion && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {studentEmotion.emotion} ({Math.round(studentEmotion.confidence * 100)}%)
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="flex justify-center gap-2">
                  {!isVideoEnabled ? (
                    <Button onClick={handleStartVideo} className="gradient-primary">
                      <Video className="w-4 h-4 mr-2" />
                      Start Video
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={isVideoEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          toggleVideo();
                          setIsVideoEnabled(!isVideoEnabled);
                        }}
                      >
                        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant={isAudioEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          toggleAudio();
                          setIsAudioEnabled(!isAudioEnabled);
                        }}
                      >
                        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant={isScreenSharing ? "default" : "outline"}
                        size="sm"
                        onClick={handleToggleScreenShare}
                      >
                        {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </Button>
                      
                      <Button variant="destructive" size="sm" onClick={handleEndVideo}>
                        End Call
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Emotion Detection */}
            {isEmotionDetectionEnabled && (
              <EmotionDetection
                onEmotionDetected={handleEmotionDetected}
                isEnabled={isVideoEnabled}
              />
            )}

            {/* Voice Interface */}
            <VoiceInterface
              onTranscript={(transcript) => setCurrentInput(transcript)}
              isEnabled={isAudioEnabled}
            />
          </div>

          {/* Right Panel - Chat & Code Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] glass-card">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <div className="border-b p-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat with Professor
                    </TabsTrigger>
                    <TabsTrigger value="code" className="gap-2">
                      <Code className="w-4 h-4" />
                      Code Analysis
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="chat" className="flex flex-col h-[calc(100%-80px)] p-4">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'glass border'
                          }`}
                        >
                          {message.type === 'professor' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-3 h-3 text-accent" />
                              <span className="text-xs font-medium text-accent">AI Professor</span>
                              {message.emotion && (
                                <Badge variant="outline" className="text-xs">
                                  {message.emotion}
                                </Badge>
                              )}
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start">
                        <div className="glass border p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span className="text-sm text-muted-foreground">Professor is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask your AI Professor anything..."
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] resize-none"
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentInput.trim() || isProcessing}
                      className="gradient-primary hover-lift"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="flex flex-col h-[calc(100%-80px)] p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Paste your code for AI analysis:
                      </label>
                      <Textarea
                        placeholder="// Paste your code here..."
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>

                    <Button
                      onClick={handleAnalyzeCode}
                      disabled={!codeInput.trim() || isProcessing}
                      className="gradient-primary hover-lift"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Analyze Code
                    </Button>

                    {/* Code Errors Display */}
                    {codeErrors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Code Analysis Results:</h4>
                        {codeErrors.map((error, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded border-l-4 ${
                              error.severity === 'error'
                                ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                : error.severity === 'warning'
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                                : 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                                Line {error.line}
                              </Badge>
                              <span className="text-sm">{error.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
