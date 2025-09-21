import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Camera, AlertCircle } from 'lucide-react';

interface EmotionData {
  emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral' | 'confused' | 'frustrated' | 'bored';
  confidence: number;
  timestamp: number;
}

interface EmotionDetectionProps {
  onEmotionDetected: (emotion: EmotionData) => void;
  isEnabled: boolean;
  className?: string;
}

// Mock emotion detection - In production, this would use TensorFlow.js or MediaPipe
const detectEmotion = async (imageData: ImageData): Promise<EmotionData> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock emotion detection results
  const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral', 'confused', 'frustrated', 'bored'] as const;
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const confidence = 0.6 + Math.random() * 0.4; // Random confidence between 0.6-1.0
  
  return {
    emotion: randomEmotion,
    confidence,
    timestamp: Date.now()
  };
};

export const EmotionDetection: React.FC<EmotionDetectionProps> = ({
  onEmotionDetected,
  isEnabled,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
      setHasPermission(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please enable camera permissions for emotion detection.');
      setHasPermission(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setHasPermission(false);
  }, [stream]);

  // Process frame for emotion detection
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isEnabled || isProcessing) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Detect emotion (mock implementation)
      const emotionData = await detectEmotion(imageData);

      // Only update if confidence is above threshold
      if (emotionData.confidence > 0.7) {
        setCurrentEmotion(emotionData);
        onEmotionDetected(emotionData);
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [isEnabled, isProcessing, onEmotionDetected]);

  // Start/stop emotion detection
  useEffect(() => {
    if (isEnabled && hasPermission) {
      // Process frames every 2 seconds to avoid overwhelming the system
      intervalRef.current = setInterval(processFrame, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, hasPermission, processFrame]);

  // Initialize camera when enabled
  useEffect(() => {
    if (isEnabled && !hasPermission) {
      initializeCamera();
    } else if (!isEnabled && hasPermission) {
      stopCamera();
    }
  }, [isEnabled, hasPermission, initializeCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stopCamera]);

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'bg-green-500';
      case 'sad': return 'bg-blue-500';
      case 'angry': return 'bg-red-500';
      case 'surprised': return 'bg-yellow-500';
      case 'fearful': return 'bg-purple-500';
      case 'disgusted': return 'bg-orange-500';
      case 'confused': return 'bg-pink-500';
      case 'frustrated': return 'bg-red-400';
      case 'bored': return 'bg-gray-500';
      default: return 'bg-cyan-500';
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😲';
      case 'fearful': return '😨';
      case 'disgusted': return '🤢';
      case 'confused': return '😕';
      case 'frustrated': return '😤';
      case 'bored': return '😴';
      default: return '😐';
    }
  };

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Emotion Detection
        </h3>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {!hasPermission && !error && (
        <div className="text-center space-y-3">
          <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Camera access required for emotion detection
          </p>
          <Button onClick={initializeCamera} size="sm">
            Enable Camera
          </Button>
        </div>
      )}

      {hasPermission && (
        <div className="space-y-3">
          {/* Hidden video element for processing */}
          <video
            ref={videoRef}
            className="hidden"
            autoPlay
            muted
            playsInline
          />
          
          {/* Hidden canvas for frame processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Current emotion display */}
          {currentEmotion && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getEmotionEmoji(currentEmotion.emotion)}</span>
                <div>
                  <p className="font-medium capitalize">{currentEmotion.emotion}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(currentEmotion.confidence * 100)}% confidence
                  </p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getEmotionColor(currentEmotion.emotion)}`} />
            </div>
          )}

          {/* Emotion history */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Emotions</h4>
            <div className="flex flex-wrap gap-1">
              {currentEmotion && (
                <Badge variant="outline" className="text-xs">
                  {getEmotionEmoji(currentEmotion.emotion)} {currentEmotion.emotion}
                </Badge>
              )}
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`} />
              Camera: {hasPermission ? 'Active' : 'Inactive'}
            </span>
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
              Processing: {isProcessing ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
