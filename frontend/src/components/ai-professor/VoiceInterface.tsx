import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';

interface VoiceInterfaceProps {
  onTranscript: (transcript: string) => void;
  isEnabled: boolean;
  className?: string;
}

export interface VoiceInterfaceRef {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
}

export const VoiceInterface = React.forwardRef<VoiceInterfaceRef, VoiceInterfaceProps>(({
  onTranscript,
  isEnabled,
  className = ''
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (!SpeechRecognition || !speechSynthesis) {
      setIsSupported(false);
      setError('Speech recognition or synthesis not supported in this browser');
      return;
    }

    synthesisRef.current = speechSynthesis;
    setIsSupported(true);
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setHasPermission(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // Send final transcript to parent
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
        setTranscript(''); // Clear after sending
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please enable microphone permissions.');
          setHasPermission(false);
          break;
        case 'no-speech':
          setError('No speech detected. Please try speaking again.');
          break;
        case 'audio-capture':
          setError('No microphone found. Please check your microphone connection.');
          break;
        case 'network':
          setError('Network error occurred during speech recognition.');
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
      
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [isSupported, onTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Failed to start speech recognition');
      }
    }
  }, [initializeSpeechRecognition, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!synthesisRef.current || !text.trim()) return;

    // Stop any current speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to use a more natural voice
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.includes('en-US')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    synthesisRef.current.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    startListening,
    stopListening,
    speak
  }), [startListening, stopListening, speak]);

  // Initialize on mount
  useEffect(() => {
    if (isSupported) {
      initializeSpeechRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [initializeSpeechRecognition, isSupported]);

  // Auto-start/stop based on isEnabled prop
  useEffect(() => {
    if (isEnabled && hasPermission && !isListening) {
      startListening();
    } else if (!isEnabled && isListening) {
      stopListening();
    }
  }, [isEnabled, hasPermission, isListening, startListening, stopListening]);

  if (!isSupported) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Voice features not supported in this browser</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Voice Interface
        </h3>
        <div className="flex items-center gap-2">
          {isListening && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-500">Listening</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-blue-500">Speaking</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isListening ? "default" : "outline"}
          size="sm"
          onClick={isListening ? stopListening : startListening}
          disabled={!hasPermission && !isListening}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Listening
            </>
          )}
        </Button>

        <Button
          variant={isSpeaking ? "default" : "outline"}
          size="sm"
          onClick={isSpeaking ? stopSpeaking : () => speak("Hello! I'm your AI Professor. How can I help you today?")}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 mr-2" />
              Stop Speaking
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Test Speech
            </>
          )}
        </Button>
      </div>

      {/* Live transcript */}
      {transcript && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-1">Live Transcript:</p>
          <p className="text-sm text-muted-foreground italic">"{transcript}"</p>
        </div>
      )}

      {/* Status indicators */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`} />
            Mic: {hasPermission ? 'Enabled' : 'Disabled'}
          </span>
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
            Recognition: {isListening ? 'Active' : 'Idle'}
          </span>
        </div>
        
        <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
          {isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Click "Start Listening" to enable voice input</p>
        <p>• Speak clearly and wait for the transcript to appear</p>
        <p>• Your speech will be automatically sent to the AI Professor</p>
      </div>
    </Card>
  );
});

VoiceInterface.displayName = 'VoiceInterface';
