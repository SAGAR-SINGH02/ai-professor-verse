import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmotionData {
  emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'neutral' | 'confused' | 'frustrated' | 'bored';
  confidence: number;
  timestamp: number;
}

interface FacialLandmarks {
  x: number;
  y: number;
  z?: number;
}

interface EmotionDetectionProps {
  onEmotionDetected: (emotion: EmotionData) => void;
  isNightMode?: boolean;
  isActive?: boolean;
}

export const EmotionDetection: React.FC<EmotionDetectionProps> = ({
  onEmotionDetected,
  isNightMode = false,
  isActive = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionData | null>(null);
  const [emotionStartTime, setEmotionStartTime] = useState<number>(0);
  const [faceLandmarks, setFaceLandmarks] = useState<FacialLandmarks[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  
  const { toast } = useToast();

  // Simple emotion detection based on facial geometry
  const analyzeEmotionFromLandmarks = useCallback((landmarks: FacialLandmarks[]): EmotionData => {
    if (landmarks.length === 0) {
      return {
        emotion: 'neutral',
        confidence: 0.5,
        timestamp: Date.now()
      };
    }
    
    // Add a minimum confidence threshold
    const MIN_CONFIDENCE = 0.7; // Require at least 70% confidence
    const currentTime = Date.now();

    // Simple heuristic-based emotion detection
    // In a real implementation, you'd use ML models like MediaPipe or TensorFlow.js
    
    // Calculate mouth curve (smile/frown detection)
    const mouthLeft = landmarks[61] || { x: 0, y: 0 };
    const mouthRight = landmarks[291] || { x: 0, y: 0 };
    const mouthCenter = landmarks[13] || { x: 0, y: 0 };
    
    const mouthCurve = (mouthLeft.y + mouthRight.y) / 2 - mouthCenter.y;
    
    // Calculate eyebrow position (surprise/anger detection)
    const leftEyebrow = landmarks[70] || { x: 0, y: 0 };
    const rightEyebrow = landmarks[107] || { x: 0, y: 0 };
    const eyeLevel = (landmarks[33]?.y || 0 + landmarks[263]?.y || 0) / 2;
    
    const eyebrowRaise = eyeLevel - (leftEyebrow.y + rightEyebrow.y) / 2;
    
    // Calculate eye openness (boredom/fatigue detection)
    const leftEyeTop = landmarks[159] || { x: 0, y: 0 };
    const leftEyeBottom = landmarks[145] || { x: 0, y: 0 };
    const eyeOpenness = Math.abs(leftEyeTop.y - leftEyeBottom.y);
    
    // Determine emotion based on facial features
    let emotion: EmotionData['emotion'] = 'neutral';
    let confidence = 0.6;
    
    if (mouthCurve > 0.02) {
      emotion = 'happy';
      confidence = Math.min(0.9, 0.6 + mouthCurve * 10);
    } else if (mouthCurve < -0.02) {
      emotion = 'sad';
      confidence = Math.min(0.9, 0.6 + Math.abs(mouthCurve) * 10);
    } else if (eyebrowRaise > 0.03) {
      emotion = 'surprised';
      confidence = Math.min(0.9, 0.6 + eyebrowRaise * 8);
    } else if (eyebrowRaise < -0.02) {
      emotion = 'angry';
      confidence = Math.min(0.9, 0.6 + Math.abs(eyebrowRaise) * 8);
    } else if (eyeOpenness < 0.01) {
      emotion = 'bored';
      confidence = Math.min(0.8, 0.6 + (0.01 - eyeOpenness) * 20);
    }
    
    // Only update emotion if confidence is above threshold
    if (confidence < MIN_CONFIDENCE) {
      // If confidence is low, maintain the current emotion or revert to neutral
      if (currentEmotion && (currentTime - currentEmotion.timestamp < 2000)) {
        return {
          emotion: currentEmotion.emotion,
          confidence: currentEmotion.confidence * 0.9, // Decay confidence
          timestamp: currentTime
        };
      }
      return {
        emotion: 'neutral',
        confidence: 0.5,
        timestamp: currentTime
      };
    }
    
    // Add some randomness to simulate more complex detection (less frequently)
    if (Math.random() > 0.95) { // Very rare random emotion changes
      const randomFactor = Math.random() * 0.1;
      const emotions: EmotionData['emotion'][] = ['confused', 'frustrated', 'neutral'];
      emotion = emotions[Math.floor(Math.random() * emotions.length)];
      confidence = 0.5 + randomFactor;
    }
    
    return {
      emotion,
      confidence,
      timestamp: Date.now()
    };
  }, []);

  // Track emotion changes over time
  const updateEmotionWithDelay = useCallback((newEmotion: EmotionData) => {
    const currentTime = Date.now();
    
    // If this is a new emotion, start the timer
    if (!detectedEmotion || detectedEmotion.emotion !== newEmotion.emotion) {
      setDetectedEmotion(newEmotion);
      setEmotionStartTime(currentTime);
      return;
    }
    
    // Only update the current emotion if we've seen the same emotion for 7 seconds
    if (currentTime - emotionStartTime >= 7000) {
      setCurrentEmotion(newEmotion);
      onEmotionDetected(newEmotion);
    }
  }, [detectedEmotion, emotionStartTime, onEmotionDetected]);

  // Mock face detection (in real implementation, use MediaPipe or similar)
  const detectFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Mock landmark detection (generate random landmarks for demo)
    const mockLandmarks: FacialLandmarks[] = [];
    for (let i = 0; i < 468; i++) {
      mockLandmarks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 0.1
      });
    }
    
    setFaceLandmarks(mockLandmarks);
    
    // Analyze emotion
    const emotionData = analyzeEmotionFromLandmarks(mockLandmarks);
    updateEmotionWithDelay(emotionData);
    
    // Draw face detection overlay
    ctx.strokeStyle = isNightMode ? '#60a5fa' : '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      canvas.width * 0.25,
      canvas.height * 0.2,
      canvas.width * 0.5,
      canvas.height * 0.6
    );
    
    // Draw emotion label
    ctx.fillStyle = isNightMode ? '#ffffff' : '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(
      `${emotionData.emotion} (${(emotionData.confidence * 100).toFixed(0)}%)`,
      10,
      30
    );
  }, [analyzeEmotionFromLandmarks, onEmotionDetected, isNightMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsDetecting(true);
      setIsSupported(true);
      
      toast({
        title: "Camera Started",
        description: "Emotion detection is now active.",
      });
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsDetecting(false);
    setCurrentEmotion(null);
    setFaceLandmarks([]);
  };

  useEffect(() => {
    // Check for camera support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsSupported(true);
    }
    
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let animationFrame: number;
    let lastDetectionTime = 0;
    const DETECTION_INTERVAL = 500; // Run detection every 500ms
    
    if (isDetecting && isActive) {
      const animate = (timestamp: number) => {
        // Only run detection at the specified interval
        if (timestamp - lastDetectionTime > DETECTION_INTERVAL) {
          detectFace();
          lastDetectionTime = timestamp;
        }
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isDetecting, isActive, detectFace]);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'text-green-500',
      sad: 'text-blue-500',
      angry: 'text-red-500',
      surprised: 'text-yellow-500',
      fearful: 'text-purple-500',
      disgusted: 'text-orange-500',
      neutral: isNightMode ? 'text-gray-300' : 'text-gray-600',
      confused: 'text-pink-500',
      frustrated: 'text-red-400',
      bored: 'text-gray-400'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <p className={`text-center ${isNightMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Camera access is not supported in your browser.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-4 space-y-4 ${isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
          Emotion Detection
        </h3>
        <Button
          onClick={isDetecting ? stopCamera : startCamera}
          variant={isDetecting ? "destructive" : "default"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isDetecting ? <CameraOff size={16} /> : <Camera size={16} />}
          {isDetecting ? 'Stop' : 'Start'} Camera
        </Button>
      </div>
      
      {/* Video feed and canvas overlay */}
      <div className="relative">
        <video
          ref={videoRef}
          className={`w-full h-48 object-cover rounded-lg ${!isDetecting ? 'hidden' : ''}`}
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={`absolute top-0 left-0 w-full h-48 ${!isDetecting ? 'hidden' : ''}`}
        />
        
        {!isDetecting && (
          <div className={`w-full h-48 rounded-lg flex items-center justify-center ${isNightMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Camera not active
            </p>
          </div>
        )}
      </div>
      
      {/* Current emotion display */}
      {currentEmotion && (
        <div className={`p-3 rounded-lg ${isNightMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-lg font-medium ${getEmotionColor(currentEmotion.emotion)}`}>
              {currentEmotion.emotion.charAt(0).toUpperCase() + currentEmotion.emotion.slice(1)}
            </span>
            <span className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {(currentEmotion.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          
          {/* Confidence bar */}
          <div className={`mt-2 w-full h-2 rounded-full ${isNightMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${currentEmotion.confidence * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Status indicator */}
      <div className={`flex items-center gap-2 text-sm ${isDetecting ? 'text-green-500' : isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        Detection: {isDetecting ? 'Active' : 'Inactive'}
      </div>
    </Card>
  );
};
