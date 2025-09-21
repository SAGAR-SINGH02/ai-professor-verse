import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import { aiService } from '../services/aiService';
import { logger } from '../utils/logger';

const router = express.Router();

// Chat with AI Professor
router.post('/chat', [
  auth,
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('context').optional().isObject(),
  body('emotion').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, context, emotion } = req.body;
    const userId = req.user!.userId;

    const response = await aiService.generateResponse({
      message,
      userId,
      context,
      emotion
    });

    res.json({
      success: true,
      data: {
        response: response.message,
        emotion: response.professorEmotion,
        suggestions: response.suggestions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response'
    });
  }
});

// Generate course content
router.post('/generate-course', [
  auth,
  body('topic').trim().isLength({ min: 1 }).withMessage('Topic is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('duration').optional().isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1-480 minutes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { topic, level, duration = 60 } = req.body;
    const userId = req.user!.userId;

    const course = await aiService.generateCourse({
      topic,
      level,
      duration,
      userId
    });

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error('Course generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate course content'
    });
  }
});

// Analyze code and provide feedback
router.post('/analyze-code', [
  auth,
  body('code').trim().isLength({ min: 1 }).withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'html', 'css']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, language } = req.body;

    const analysis = await aiService.analyzeCode({
      code,
      language
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Code analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze code'
    });
  }
});

// Get personalized learning recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const recommendations = await aiService.getPersonalizedRecommendations(userId);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
});

// Process emotion data for adaptive tutoring
router.post('/emotion-feedback', [
  auth,
  body('emotion').isIn(['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral', 'confused', 'frustrated', 'bored']).withMessage('Invalid emotion'),
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
  body('context').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { emotion, confidence, context } = req.body;
    const userId = req.user!.userId;

    const adaptiveResponse = await aiService.processEmotionFeedback({
      userId,
      emotion,
      confidence,
      context
    });

    res.json({
      success: true,
      data: adaptiveResponse
    });
  } catch (error) {
    logger.error('Emotion feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process emotion feedback'
    });
  }
});

// Text-to-Speech for AI Professor
router.post('/text-to-speech', [
  auth,
  body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Text must be between 1-1000 characters'),
  body('voice').optional().isIn(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).withMessage('Invalid voice')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { text, voice = 'alloy' } = req.body;

    const audioBuffer = await aiService.textToSpeech({
      text,
      voice
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    
    res.send(audioBuffer);
  } catch (error) {
    logger.error('Text-to-speech error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate speech'
    });
  }
});

export default router;
