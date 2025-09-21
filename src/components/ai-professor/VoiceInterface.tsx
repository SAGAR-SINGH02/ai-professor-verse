import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterfaceProps {
  onSpeechDetected: (text: string) => void;
  onSpeakingStateChange: (isSpeaking: boolean) => void;
  isNightMode?: boolean;
}

export interface VoiceInterfaceRef {
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

export const VoiceInterface = React.forwardRef<VoiceInterfaceRef, VoiceInterfaceProps>(({
  onSpeechDetected,
  onSpeakingStateChange,
  isNightMode = false
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      
      // Initialize Speech Recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
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
        
        setTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          onSpeechDetected(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "There was an issue with speech recognition. Please try again.",
          variant: "destructive"
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      // Initialize Speech Synthesis
      synthRef.current = speechSynthesis;
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition or synthesis.",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onSpeechDetected, toast]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now, I'm listening to your question.",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string, voice?: SpeechSynthesisVoice) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      if (voice) {
        utterance.voice = voice;
      } else {
        // Try to find a good default voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Microsoft') ||
          v.lang.startsWith('en')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        onSpeakingStateChange(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        onSpeakingStateChange(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        onSpeakingStateChange(false);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      onSpeakingStateChange(false);
    }
  };

  // Expose speak function to parent component via ref
  React.useImperativeHandle(ref, () => ({
    speak,
    stopSpeaking
  }));

  if (!isSupported) {
    return (
      <Card className={`p-4 ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <p className={`text-center ${isNightMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Voice features are not supported in your browser.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-4 space-y-4 ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
          Voice Interface
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? 'Stop' : 'Listen'}
          </Button>
          
          <Button
            onClick={isSpeaking ? stopSpeaking : () => speak("Hello! I'm your AI professor. How can I help you today?")}
            variant={isSpeaking ? "destructive" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {isSpeaking ? 'Stop' : 'Test'}
          </Button>
        </div>
      </div>
      
      {/* Live transcript display */}
      {transcript && (
        <div className={`p-3 rounded-lg ${isNightMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-sm ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>You said:</strong> {transcript}
          </p>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="flex gap-4 text-sm">
        <div className={`flex items-center gap-2 ${isListening ? 'text-green-500' : isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          Listening: {isListening ? 'Active' : 'Inactive'}
        </div>
        
        <div className={`flex items-center gap-2 ${isSpeaking ? 'text-blue-500' : isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
          Speaking: {isSpeaking ? 'Active' : 'Inactive'}
        </div>
      </div>
    </Card>
  );
});

// Hook to use voice interface
export const useVoiceInterface = () => {
  const voiceRef = useRef<{ speak: (text: string) => void; stopSpeaking: () => void }>(null);
  
  return {
    speak: (text: string) => voiceRef.current?.speak(text),
    stopSpeaking: () => voiceRef.current?.stopSpeaking(),
    voiceRef
  };
};
