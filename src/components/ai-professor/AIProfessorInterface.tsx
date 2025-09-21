import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Sun, Settings, Send, Code, MessageCircle, Camera, CameraOff } from 'lucide-react';
import { ProfessorAvatar } from './ProfessorAvatar';
import { VoiceInterface, VoiceInterfaceRef } from './VoiceInterface';
import { EmotionDetection } from './EmotionDetection';
import { useToast } from '@/hooks/use-toast';

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
  const [isNightMode, setIsNightMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [professorEmotion, setProfessorEmotion] = useState<'neutral' | 'happy' | 'concerned' | 'encouraging' | 'thinking'>('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [studentEmotion, setStudentEmotion] = useState<EmotionData | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeErrors, setCodeErrors] = useState<CodeError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const voiceRef = useRef<VoiceInterfaceRef>(null);
  const { toast } = useToast();

  // Simulate AI response generation
  const generateAIResponse = useCallback(async (userInput: string, emotion?: EmotionData): Promise<string> => {
    setIsProcessing(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = {
      greeting: [
        "Hello! I'm your AI professor. I'm here to help you learn and understand complex concepts. What would you like to explore today?",
        "Welcome to our learning session! I'm excited to help you on your educational journey. What topic interests you?",
        "Greetings, student! I'm ready to assist you with any questions or concepts you'd like to understand better."
      ],
      confused: [
        "I can see you might be feeling a bit confused. Let me break this down into simpler steps for you.",
        "No worries if this seems complex! Let's approach it from a different angle that might be clearer.",
        "I notice some confusion - that's completely normal! Learning is a process, and I'm here to guide you through it."
      ],
      frustrated: [
        "I can sense some frustration. Take a deep breath - we'll work through this together, step by step.",
        "Feeling frustrated is part of learning! Let's try a different approach that might click better for you.",
        "I understand this can be challenging. Remember, every expert was once a beginner. Let's break it down."
      ],
      happy: [
        "I love seeing your enthusiasm! Let's build on that positive energy and dive deeper into this topic.",
        "Your excitement is contagious! This is exactly the right mindset for learning. What shall we explore next?",
        "Wonderful! I can see you're engaged and ready to learn. Let's make the most of this momentum."
      ],
      bored: [
        "I notice you might be feeling a bit disengaged. Let me try to make this more interesting with a practical example.",
        "Let's spice things up! How about we approach this with a real-world application that might grab your attention?",
        "I can see this might not be holding your interest. Let me try a different teaching approach."
      ],
      default: [
        "That's an interesting question! Let me think about the best way to explain this concept to you.",
        "Great question! This is actually a fundamental concept that connects to many other areas.",
        "I appreciate your curiosity! Let's explore this topic together and see where it leads us."
      ]
    };

    let responseCategory = 'default';

    // Determine response based on emotion and input
    if (emotion) {
      if (emotion.emotion === 'confused') responseCategory = 'confused';
      else if (emotion.emotion === 'frustrated') responseCategory = 'frustrated';
      else if (emotion.emotion === 'happy') responseCategory = 'happy';
      else if (emotion.emotion === 'bored') responseCategory = 'bored';
    }

    if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
      responseCategory = 'greeting';
    }

    const categoryResponses = responses[responseCategory as keyof typeof responses];
    const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

    setIsProcessing(false);
    return response;
  }, []);

  // Handle speech input
  const handleSpeechDetected = useCallback(async (text: string) => {
    if (text.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: text,
        timestamp: Date.now(),
        emotion: studentEmotion?.emotion
      };

      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      const aiResponse = await generateAIResponse(text, studentEmotion);

      const professorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'professor',
        content: aiResponse,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, professorMessage]);

      // Speak the response
      if (voiceRef.current) {
        voiceRef.current.speak(aiResponse);
      }

      // Update professor emotion based on context
      if (studentEmotion?.emotion === 'confused' || studentEmotion?.emotion === 'frustrated') {
        setProfessorEmotion('concerned');
      } else if (studentEmotion?.emotion === 'happy') {
        setProfessorEmotion('encouraging');
      } else {
        setProfessorEmotion('neutral');
      }
    }
  }, [studentEmotion, generateAIResponse]);

  // Handle text input
  const handleTextSubmit = useCallback(async () => {
    if (currentInput.trim()) {
      await handleSpeechDetected(currentInput);
      setCurrentInput('');
    }
  }, [currentInput, handleSpeechDetected]);

  // Handle emotion detection
  const handleEmotionDetected = useCallback((emotion: EmotionData) => {
    setStudentEmotion(emotion);

    // Adapt professor behavior based on student emotion
    if (emotion.confidence > 0.7) {
      if (emotion.emotion === 'confused' || emotion.emotion === 'frustrated') {
        setProfessorEmotion('concerned');
      } else if (emotion.emotion === 'bored') {
        setProfessorEmotion('encouraging');
      } else if (emotion.emotion === 'happy') {
        setProfessorEmotion('happy');
      }
    }
  }, []);

  // Code error detection (simplified)
  const analyzeCode = useCallback((code: string): CodeError[] => {
    const errors: CodeError[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Simple syntax checks
      if (line.includes('console.log') && !line.includes(';')) {
        errors.push({
          line: index + 1,
          message: 'Missing semicolon after console.log statement',
          severity: 'warning'
        });
      }

      if (line.includes('function') && !line.includes('{')) {
        errors.push({
          line: index + 1,
          message: 'Function declaration missing opening brace',
          severity: 'error'
        });
      }

      if (line.includes('if') && !line.includes('(')) {
        errors.push({
          line: index + 1,
          message: 'If statement missing condition parentheses',
          severity: 'error'
        });
      }
    });

    return errors;
  }, []);

  // Handle code input changes
  useEffect(() => {
    if (codeInput) {
      const errors = analyzeCode(codeInput);
      setCodeErrors(errors);

      // Provide verbal feedback for errors
      if (errors.length > 0 && voiceRef.current) {
        const errorMessage = `I found ${errors.length} issue${errors.length > 1 ? 's' : ''} in your code. ${errors[0].message}`;
        setTimeout(() => {
          if (voiceRef.current) {
            voiceRef.current.speak(errorMessage);
          }
        }, 500);
      }
    }
  }, [codeInput, analyzeCode]);

  // Toggle night mode
  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
    toast({
      title: `${!isNightMode ? 'Night' : 'Day'} Mode Activated`,
      description: `Switched to ${!isNightMode ? 'dark' : 'light'} theme for better visibility.`,
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isNightMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <Card className={`p-4 ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                AI Professor Interface
              </h1>
              <p className={`${isNightMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Interactive 3D AI tutor with emotion detection and voice interaction
              </p>
            </div>

            <div className="flex items-center gap-2">
              {studentEmotion && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full bg-${studentEmotion.emotion === 'happy' ? 'green' : studentEmotion.emotion === 'frustrated' ? 'red' : 'blue'}-500`}></div>
                  {studentEmotion.emotion}
                </Badge>
              )}

              <Button
                onClick={toggleNightMode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isNightMode ? <Sun size={16} /> : <Moon size={16} />}
                {isNightMode ? 'Day' : 'Night'} Mode
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - 3D Avatar and Video Feed */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 3D Avatar */}
              <Card className={`${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="h-48">
                  <ProfessorAvatar
                    isNightMode={isNightMode}
                    emotion={professorEmotion}
                    isSpeaking={isSpeaking}
                  />
                </div>
              </Card>
              
              {/* AI Professor Image */}
              <Card className={`${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} overflow-hidden`}>
                <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
                  <img 
                    src="/images/ai-professor-avatar.svg" 
                    alt="AI Professor" 
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Card>
            </div>

            {/* AI Professor Controls */}
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Settings size={16} />
                Customize Avatar
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Camera size={16} />
                Change Pose
              </Button>
            </div>

            {/* Emotion Detection */}
            <EmotionDetection
              onEmotionDetected={handleEmotionDetected}
              isNightMode={isNightMode}
              isActive={true}
            />
          </div>

          {/* Right Column - Interaction Panels */}
          <div className="space-y-4">
            <VoiceInterface
              ref={voiceRef}
              onSpeechDetected={handleSpeechDetected}
              onSpeakingStateChange={setIsSpeaking}
              isNightMode={isNightMode}
            />

            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code size={16} />
                  Code Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-4">
                <Card className={`p-4 ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="h-64 overflow-y-auto space-y-2">
                      {messages.length === 0 ? (
                        <p className={`text-center ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Start a conversation with your AI professor...
                        </p>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${message.type === 'user'
                              ? isNightMode ? 'bg-blue-900 ml-8' : 'bg-blue-100 ml-8'
                              : isNightMode ? 'bg-gray-700 mr-8' : 'bg-gray-100 mr-8'
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              <strong className={`${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                                {message.type === 'user' ? 'You' : 'Professor'}:
                              </strong>
                              {message.emotion && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.emotion}
                                </Badge>
                              )}
                            </div>
                            <p className={`mt-1 ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {message.content}
                            </p>
                          </div>
                        ))
                      )}

                      {isProcessing && (
                        <div className={`p-3 rounded-lg mr-8 ${isNightMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className={`${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Professor is thinking...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Input */}
                    <div className="flex gap-2">
                      <Textarea
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Type your question or use voice input..."
                        className={`flex-1 ${isNightMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTextSubmit();
                          }
                        }}
                      />
                      <Button onClick={handleTextSubmit} disabled={!currentInput.trim()}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <Card className={`p-4 ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                      Code Review & Error Detection
                    </h3>

                    <Textarea
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Paste your code here for real-time analysis..."
                      className={`h-32 font-mono ${isNightMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />

                    {/* Error Display */}
                    {codeErrors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className={`font-medium ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                          Issues Found:
                        </h4>
                        {codeErrors.map((error, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded border-l-4 ${error.severity === 'error'
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                                Line {error.line}
                              </Badge>
                              <span className={`text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {error.message}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {codeInput && codeErrors.length === 0 && (
                      <div className={`p-2 rounded border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20`}>
                        <span className={`text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          ✅ No issues found in your code!
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
