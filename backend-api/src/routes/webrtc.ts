import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get WebRTC configuration
router.get('/config', auth, async (req, res) => {
  try {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers if available
        ...(process.env.TURN_SERVER_URL ? [{
          urls: process.env.TURN_SERVER_URL,
          username: process.env.TURN_SERVER_USERNAME,
          credential: process.env.TURN_SERVER_CREDENTIAL
        }] : [])
      ],
      sdpSemantics: 'unified-plan'
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('WebRTC config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get WebRTC configuration'
    });
  }
});

// Create WebRTC session
router.post('/session', [
  auth,
  body('sessionType').isIn(['ai-professor', 'peer-to-peer', 'group']),
  body('sessionName').optional().trim().isLength({ min: 1, max: 100 })
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

    const { sessionType, sessionName } = req.body;
    const userId = req.user!.userId;

    // Generate session ID
    const sessionId = `${sessionType}-${userId}-${Date.now()}`;

    const session = {
      id: sessionId,
      type: sessionType,
      name: sessionName || `${sessionType} Session`,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      participants: [userId],
      status: 'active',
      config: {
        video: true,
        audio: true,
        screenShare: true,
        recording: false
      }
    };

    // In a real application, you would save this to a database
    logger.info(`WebRTC session created: ${sessionId} by user ${userId}`);

    res.json({
      success: true,
      message: 'WebRTC session created successfully',
      data: session
    });
  } catch (error) {
    logger.error('Create WebRTC session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create WebRTC session'
    });
  }
});

// Join WebRTC session
router.post('/session/:sessionId/join', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    // In a real application, you would fetch the session from database
    // and add the user to participants list

    logger.info(`User ${userId} joined WebRTC session: ${sessionId}`);

    res.json({
      success: true,
      message: 'Successfully joined WebRTC session',
      data: {
        sessionId,
        userId,
        joinedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Join WebRTC session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join WebRTC session'
    });
  }
});

// Leave WebRTC session
router.post('/session/:sessionId/leave', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    // In a real application, you would remove the user from participants list
    // and clean up the session if no participants remain

    logger.info(`User ${userId} left WebRTC session: ${sessionId}`);

    res.json({
      success: true,
      message: 'Successfully left WebRTC session',
      data: {
        sessionId,
        userId,
        leftAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Leave WebRTC session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave WebRTC session'
    });
  }
});

// Get session statistics
router.get('/session/:sessionId/stats', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Mock session statistics
    const stats = {
      sessionId,
      duration: Math.floor(Math.random() * 3600), // Random duration in seconds
      participants: Math.floor(Math.random() * 10) + 1,
      messages: Math.floor(Math.random() * 100),
      quality: {
        video: 'good',
        audio: 'excellent',
        connection: 'stable'
      },
      bandwidth: {
        upload: Math.floor(Math.random() * 1000) + 500, // kbps
        download: Math.floor(Math.random() * 2000) + 1000 // kbps
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get session stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session statistics'
    });
  }
});

export default router;
