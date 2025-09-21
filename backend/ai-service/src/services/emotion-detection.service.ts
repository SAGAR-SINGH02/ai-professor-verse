import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tf from '@tensorflow/tfjs-node';
import { EmotionType, EmotionData } from '@ai-professor/shared';

export interface FacialEmotionRequest {
  userId: string;
  sessionId: string;
  imageData: string; // Base64 encoded image
  timestamp: Date;
}

export interface VoiceEmotionRequest {
  userId: string;
  sessionId: string;
  audioData: Buffer;
  duration: number;
  timestamp: Date;
}

export interface TextEmotionRequest {
  userId: string;
  sessionId: string;
  text: string;
  timestamp: Date;
}

export interface EmotionAnalysisResult {
  emotions: EmotionPrediction[];
  dominantEmotion: EmotionType;
  confidence: number;
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (excited)
  metadata: {
    processingTime: number;
    modelVersion: string;
    source: 'facial' | 'voice' | 'text';
  };
}

export interface EmotionPrediction {
  emotion: EmotionType;
  confidence: number;
}

export interface EmotionTrend {
  userId: string;
  sessionId: string;
  timeframe: 'minute' | 'hour' | 'session';
  emotions: EmotionData[];
  averageValence: number;
  averageArousal: number;
  emotionChanges: number;
  engagementScore: number; // 0-1
}

@Injectable()
export class EmotionDetectionService {
  private readonly logger = new Logger(EmotionDetectionService.name);
  private facialModel: tf.LayersModel | null = null;
  private textModel: tf.LayersModel | null = null;
  private isInitialized = false;

  // Emotion mappings
  private readonly emotionLabels: EmotionType[] = [
    EmotionType.NEUTRAL,
    EmotionType.HAPPY,
    EmotionType.CONFUSED,
    EmotionType.FRUSTRATED,
    EmotionType.ENGAGED,
    EmotionType.BORED,
    EmotionType.EXCITED,
  ];

  // Text emotion keywords
  private readonly emotionKeywords = {
    [EmotionType.HAPPY]: ['great', 'awesome', 'excellent', 'love', 'amazing', 'wonderful', 'fantastic'],
    [EmotionType.FRUSTRATED]: ['difficult', 'hard', 'stuck', 'confused', 'dont understand', 'help'],
    [EmotionType.CONFUSED]: ['what', 'how', 'why', 'unclear', 'dont get', 'explain', 'clarify'],
    [EmotionType.ENGAGED]: ['interesting', 'cool', 'want to learn', 'tell me more', 'curious'],
    [EmotionType.BORED]: ['boring', 'tired', 'uninteresting', 'skip', 'next', 'done'],
    [EmotionType.EXCITED]: ['wow', 'incredible', 'cant wait', 'excited', 'eager', 'enthusiastic'],
  };

  constructor(private readonly configService: ConfigService) {
    this.initializeModels();
  }

  private async initializeModels(): Promise<void> {
    try {
      this.logger.log('🧠 Initializing emotion detection models...');

      // Initialize TensorFlow backend
      await tf.ready();

      // Load pre-trained facial emotion model (placeholder - would load actual model)
      // In production, you would load a trained model from a file or URL
      this.facialModel = await this.createMockFacialModel();
      
      // Load text emotion model (placeholder)
      this.textModel = await this.createMockTextModel();

      this.isInitialized = true;
      this.logger.log('✅ Emotion detection models initialized successfully');

    } catch (error) {
      this.logger.error('❌ Failed to initialize emotion detection models:', error);
      throw new Error('Failed to initialize emotion detection service');
    }
  }

  async detectFacialEmotion(request: FacialEmotionRequest): Promise<EmotionAnalysisResult> {
    const startTime = Date.now();

    if (!this.isInitialized || !this.facialModel) {
      throw new Error('Facial emotion model not initialized');
    }

    try {
      // Decode base64 image
      const imageBuffer = Buffer.from(request.imageData, 'base64');
      
      // Preprocess image for model input
      const preprocessedImage = await this.preprocessImage(imageBuffer);
      
      // Run inference
      const predictions = this.facialModel.predict(preprocessedImage) as tf.Tensor;
      const predictionData = await predictions.data();
      
      // Convert predictions to emotion results
      const emotions = this.emotionLabels.map((emotion, index) => ({
        emotion,
        confidence: predictionData[index],
      })).sort((a, b) => b.confidence - a.confidence);

      const dominantEmotion = emotions[0].emotion;
      const confidence = emotions[0].confidence;
      
      // Calculate valence and arousal
      const { valence, arousal } = this.calculateValenceArousal(emotions);

      const processingTime = Date.now() - startTime;

      // Cleanup tensors
      predictions.dispose();
      preprocessedImage.dispose();

      const result: EmotionAnalysisResult = {
        emotions,
        dominantEmotion,
        confidence,
        valence,
        arousal,
        metadata: {
          processingTime,
          modelVersion: '1.0.0',
          source: 'facial',
        },
      };

      this.logger.log(`😊 Detected facial emotion: ${dominantEmotion} (${(confidence * 100).toFixed(1)}%) for user ${request.userId}`);
      return result;

    } catch (error) {
      this.logger.error(`❌ Failed to detect facial emotion for user ${request.userId}:`, error);
      throw new Error('Failed to detect facial emotion');
    }
  }

  async detectVoiceEmotion(request: VoiceEmotionRequest): Promise<EmotionAnalysisResult> {
    const startTime = Date.now();

    try {
      // Extract audio features (placeholder implementation)
      const audioFeatures = await this.extractAudioFeatures(request.audioData);
      
      // Analyze voice characteristics
      const emotions = await this.analyzeVoiceCharacteristics(audioFeatures);
      
      const dominantEmotion = emotions[0].emotion;
      const confidence = emotions[0].confidence;
      
      const { valence, arousal } = this.calculateValenceArousal(emotions);
      const processingTime = Date.now() - startTime;

      const result: EmotionAnalysisResult = {
        emotions,
        dominantEmotion,
        confidence,
        valence,
        arousal,
        metadata: {
          processingTime,
          modelVersion: '1.0.0',
          source: 'voice',
        },
      };

      this.logger.log(`🎤 Detected voice emotion: ${dominantEmotion} (${(confidence * 100).toFixed(1)}%) for user ${request.userId}`);
      return result;

    } catch (error) {
      this.logger.error(`❌ Failed to detect voice emotion for user ${request.userId}:`, error);
      throw new Error('Failed to detect voice emotion');
    }
  }

  async detectTextEmotion(request: TextEmotionRequest): Promise<EmotionAnalysisResult> {
    const startTime = Date.now();

    try {
      // Analyze text using keyword matching and sentiment analysis
      const emotions = this.analyzeTextEmotion(request.text);
      
      const dominantEmotion = emotions[0].emotion;
      const confidence = emotions[0].confidence;
      
      const { valence, arousal } = this.calculateValenceArousal(emotions);
      const processingTime = Date.now() - startTime;

      const result: EmotionAnalysisResult = {
        emotions,
        dominantEmotion,
        confidence,
        valence,
        arousal,
        metadata: {
          processingTime,
          modelVersion: '1.0.0',
          source: 'text',
        },
      };

      this.logger.log(`📝 Detected text emotion: ${dominantEmotion} (${(confidence * 100).toFixed(1)}%) for user ${request.userId}`);
      return result;

    } catch (error) {
      this.logger.error(`❌ Failed to detect text emotion for user ${request.userId}:`, error);
      throw new Error('Failed to detect text emotion');
    }
  }

  async analyzeEmotionTrend(
    userId: string,
    sessionId: string,
    emotions: EmotionData[],
    timeframe: 'minute' | 'hour' | 'session' = 'session',
  ): Promise<EmotionTrend> {
    try {
      // Filter emotions by timeframe
      const now = new Date();
      const cutoffTime = this.getTimeframeCutoff(now, timeframe);
      const recentEmotions = emotions.filter(e => e.timestamp >= cutoffTime);

      if (recentEmotions.length === 0) {
        return {
          userId,
          sessionId,
          timeframe,
          emotions: [],
          averageValence: 0,
          averageArousal: 0,
          emotionChanges: 0,
          engagementScore: 0,
        };
      }

      // Calculate averages
      const totalValence = recentEmotions.reduce((sum, e) => sum + this.getEmotionValence(e.emotion), 0);
      const totalArousal = recentEmotions.reduce((sum, e) => sum + this.getEmotionArousal(e.emotion), 0);
      
      const averageValence = totalValence / recentEmotions.length;
      const averageArousal = totalArousal / recentEmotions.length;

      // Count emotion changes
      let emotionChanges = 0;
      for (let i = 1; i < recentEmotions.length; i++) {
        if (recentEmotions[i].emotion !== recentEmotions[i - 1].emotion) {
          emotionChanges++;
        }
      }

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(recentEmotions);

      return {
        userId,
        sessionId,
        timeframe,
        emotions: recentEmotions,
        averageValence,
        averageArousal,
        emotionChanges,
        engagementScore,
      };

    } catch (error) {
      this.logger.error(`❌ Failed to analyze emotion trend for user ${userId}:`, error);
      throw new Error('Failed to analyze emotion trend');
    }
  }

  async getAdaptiveTutoringRecommendations(emotionTrend: EmotionTrend): Promise<string[]> {
    const recommendations: string[] = [];

    // Analyze dominant emotions
    const emotionCounts = this.countEmotions(emotionTrend.emotions);
    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion as EmotionType);

    // Generate recommendations based on emotional state
    if (dominantEmotions.includes(EmotionType.FRUSTRATED)) {
      recommendations.push('Break down complex concepts into smaller steps');
      recommendations.push('Provide more examples and analogies');
      recommendations.push('Offer encouragement and positive reinforcement');
    }

    if (dominantEmotions.includes(EmotionType.CONFUSED)) {
      recommendations.push('Clarify key concepts with simpler explanations');
      recommendations.push('Ask probing questions to identify knowledge gaps');
      recommendations.push('Provide visual aids or diagrams');
    }

    if (dominantEmotions.includes(EmotionType.BORED)) {
      recommendations.push('Increase interactivity and engagement');
      recommendations.push('Introduce more challenging material');
      recommendations.push('Add gamification elements');
    }

    if (dominantEmotions.includes(EmotionType.ENGAGED)) {
      recommendations.push('Maintain current teaching approach');
      recommendations.push('Introduce advanced topics');
      recommendations.push('Encourage deeper exploration');
    }

    // Low engagement score recommendations
    if (emotionTrend.engagementScore < 0.3) {
      recommendations.push('Suggest a short break');
      recommendations.push('Change teaching modality (visual to auditory)');
      recommendations.push('Introduce interactive exercises');
    }

    // High emotion variability recommendations
    if (emotionTrend.emotionChanges > emotionTrend.emotions.length * 0.5) {
      recommendations.push('Focus on emotional regulation techniques');
      recommendations.push('Provide consistent, calming presence');
      recommendations.push('Check in on student well-being');
    }

    return recommendations;
  }

  private async createMockFacialModel(): Promise<tf.LayersModel> {
    // Create a simple mock model for demonstration
    // In production, you would load a pre-trained model
    const model = tf.sequential({
      layers: [
        tf.layers.flatten({ inputShape: [48, 48, 1] }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: this.emotionLabels.length, activation: 'softmax' }),
      ],
    });

    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private async createMockTextModel(): Promise<tf.LayersModel> {
    // Create a simple mock model for text emotion detection
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [100] }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: this.emotionLabels.length, activation: 'softmax' }),
      ],
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<tf.Tensor> {
    // Convert image buffer to tensor and preprocess
    // This is a simplified implementation
    const imageTensor = tf.node.decodeImage(imageBuffer, 1);
    const resized = tf.image.resizeBilinear(imageTensor, [48, 48]);
    const normalized = resized.div(255.0);
    const batched = normalized.expandDims(0);
    
    imageTensor.dispose();
    resized.dispose();
    normalized.dispose();
    
    return batched;
  }

  private async extractAudioFeatures(audioData: Buffer): Promise<number[]> {
    // Extract audio features like MFCC, pitch, energy, etc.
    // This is a placeholder implementation
    const features: number[] = [];
    
    // Mock feature extraction
    for (let i = 0; i < 13; i++) {
      features.push(Math.random());
    }
    
    return features;
  }

  private async analyzeVoiceCharacteristics(features: number[]): Promise<EmotionPrediction[]> {
    // Analyze voice characteristics to determine emotion
    // This is a simplified implementation
    const emotions: EmotionPrediction[] = [];
    
    // Mock analysis based on features
    this.emotionLabels.forEach(emotion => {
      emotions.push({
        emotion,
        confidence: Math.random(),
      });
    });
    
    return emotions.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeTextEmotion(text: string): EmotionPrediction[] {
    const lowerText = text.toLowerCase();
    const emotions: { [key in EmotionType]: number } = {
      [EmotionType.NEUTRAL]: 0.1,
      [EmotionType.HAPPY]: 0,
      [EmotionType.CONFUSED]: 0,
      [EmotionType.FRUSTRATED]: 0,
      [EmotionType.ENGAGED]: 0,
      [EmotionType.BORED]: 0,
      [EmotionType.EXCITED]: 0,
    };

    // Keyword-based emotion detection
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      const emotionType = emotion as EmotionType;
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          emotions[emotionType] += 0.3;
        }
      });
    });

    // Question marks might indicate confusion
    const questionMarks = (text.match(/\?/g) || []).length;
    emotions[EmotionType.CONFUSED] += questionMarks * 0.2;

    // Exclamation marks might indicate excitement or frustration
    const exclamationMarks = (text.match(/!/g) || []).length;
    emotions[EmotionType.EXCITED] += exclamationMarks * 0.15;

    // Normalize and convert to predictions
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    const normalizedEmotions = Object.entries(emotions).map(([emotion, score]) => ({
      emotion: emotion as EmotionType,
      confidence: total > 0 ? score / total : 1 / this.emotionLabels.length,
    }));

    return normalizedEmotions.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateValenceArousal(emotions: EmotionPrediction[]): { valence: number; arousal: number } {
    // Map emotions to valence-arousal space
    const emotionMapping = {
      [EmotionType.HAPPY]: { valence: 0.8, arousal: 0.6 },
      [EmotionType.EXCITED]: { valence: 0.9, arousal: 0.9 },
      [EmotionType.ENGAGED]: { valence: 0.6, arousal: 0.7 },
      [EmotionType.NEUTRAL]: { valence: 0.0, arousal: 0.3 },
      [EmotionType.CONFUSED]: { valence: -0.3, arousal: 0.5 },
      [EmotionType.FRUSTRATED]: { valence: -0.7, arousal: 0.8 },
      [EmotionType.BORED]: { valence: -0.4, arousal: 0.1 },
    };

    let weightedValence = 0;
    let weightedArousal = 0;
    let totalWeight = 0;

    emotions.forEach(({ emotion, confidence }) => {
      const mapping = emotionMapping[emotion];
      if (mapping) {
        weightedValence += mapping.valence * confidence;
        weightedArousal += mapping.arousal * confidence;
        totalWeight += confidence;
      }
    });

    return {
      valence: totalWeight > 0 ? weightedValence / totalWeight : 0,
      arousal: totalWeight > 0 ? weightedArousal / totalWeight : 0.3,
    };
  }

  private getTimeframeCutoff(now: Date, timeframe: 'minute' | 'hour' | 'session'): Date {
    const cutoff = new Date(now);
    
    switch (timeframe) {
      case 'minute':
        cutoff.setMinutes(cutoff.getMinutes() - 1);
        break;
      case 'hour':
        cutoff.setHours(cutoff.getHours() - 1);
        break;
      case 'session':
        cutoff.setHours(cutoff.getHours() - 24); // Last 24 hours for session
        break;
    }
    
    return cutoff;
  }

  private getEmotionValence(emotion: EmotionType): number {
    const valenceMap = {
      [EmotionType.HAPPY]: 0.8,
      [EmotionType.EXCITED]: 0.9,
      [EmotionType.ENGAGED]: 0.6,
      [EmotionType.NEUTRAL]: 0.0,
      [EmotionType.CONFUSED]: -0.3,
      [EmotionType.FRUSTRATED]: -0.7,
      [EmotionType.BORED]: -0.4,
    };
    
    return valenceMap[emotion] || 0;
  }

  private getEmotionArousal(emotion: EmotionType): number {
    const arousalMap = {
      [EmotionType.HAPPY]: 0.6,
      [EmotionType.EXCITED]: 0.9,
      [EmotionType.ENGAGED]: 0.7,
      [EmotionType.NEUTRAL]: 0.3,
      [EmotionType.CONFUSED]: 0.5,
      [EmotionType.FRUSTRATED]: 0.8,
      [EmotionType.BORED]: 0.1,
    };
    
    return arousalMap[emotion] || 0.3;
  }

  private calculateEngagementScore(emotions: EmotionData[]): number {
    if (emotions.length === 0) return 0;

    const engagementWeights = {
      [EmotionType.ENGAGED]: 1.0,
      [EmotionType.EXCITED]: 0.9,
      [EmotionType.HAPPY]: 0.7,
      [EmotionType.CONFUSED]: 0.4, // Still engaged, just needs help
      [EmotionType.NEUTRAL]: 0.3,
      [EmotionType.FRUSTRATED]: 0.2,
      [EmotionType.BORED]: 0.0,
    };

    const totalScore = emotions.reduce((sum, emotion) => {
      const weight = engagementWeights[emotion.emotion] || 0;
      return sum + (weight * emotion.confidence);
    }, 0);

    return Math.min(1, totalScore / emotions.length);
  }

  private countEmotions(emotions: EmotionData[]): { [key in EmotionType]: number } {
    const counts = {
      [EmotionType.NEUTRAL]: 0,
      [EmotionType.HAPPY]: 0,
      [EmotionType.CONFUSED]: 0,
      [EmotionType.FRUSTRATED]: 0,
      [EmotionType.ENGAGED]: 0,
      [EmotionType.BORED]: 0,
      [EmotionType.EXCITED]: 0,
    };

    emotions.forEach(emotion => {
      counts[emotion.emotion]++;
    });

    return counts;
  }

  async healthCheck(): Promise<boolean> {
    return this.isInitialized && this.facialModel !== null && this.textModel !== null;
  }
}
