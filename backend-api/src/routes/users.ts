import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import User from '../models/User';
import { logger } from '../utils/logger';

const router = express.Router();

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const progress = {
      coursesCompleted: user.profile.learningStats?.coursesCompleted || 0,
      totalLearningTime: user.profile.learningStats?.totalLearningTime || 0,
      currentStreak: user.profile.learningStats?.currentStreak || 0,
      achievements: user.profile.learningStats?.achievements || [],
      recentActivity: [
        {
          type: 'course_completed',
          title: 'JavaScript Fundamentals',
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          points: 100
        },
        {
          type: 'ai_session',
          title: 'AI Professor Chat Session',
          date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          duration: 30
        }
      ]
    };

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress'
    });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }),
  body('bio').optional().isLength({ max: 500 }),
  body('preferences.theme').optional().isIn(['light', 'dark']),
  body('preferences.language').optional().isString(),
  body('preferences.notifications').optional().isBoolean()
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

    const { name, bio, preferences } = req.body;
    const user = await User.findById(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (bio !== undefined) user.profile.bio = bio;
    if (preferences) {
      user.profile.preferences = { ...user.profile.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const achievements = [
      {
        id: 'first_login',
        title: 'Welcome to AI Professor Verse',
        description: 'Completed your first login',
        icon: '🎉',
        earned: true,
        earnedAt: user.createdAt,
        points: 10
      },
      {
        id: 'first_ai_chat',
        title: 'AI Conversation Starter',
        description: 'Had your first conversation with an AI Professor',
        icon: '🤖',
        earned: user.profile.learningStats?.totalLearningTime ? user.profile.learningStats.totalLearningTime > 0 : false,
        earnedAt: user.profile.learningStats?.totalLearningTime ? new Date() : null,
        points: 25
      },
      {
        id: 'course_complete',
        title: 'Course Completion',
        description: 'Completed your first course',
        icon: '🎓',
        earned: user.profile.learningStats?.coursesCompleted ? user.profile.learningStats.coursesCompleted > 0 : false,
        earnedAt: user.profile.learningStats?.coursesCompleted ? new Date() : null,
        points: 100
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        icon: '🔥',
        earned: user.profile.learningStats?.currentStreak ? user.profile.learningStats.currentStreak >= 7 : false,
        earnedAt: user.profile.learningStats?.currentStreak ? new Date() : null,
        points: 200
      }
    ];

    const totalPoints = achievements
      .filter(achievement => achievement.earned)
      .reduce((sum, achievement) => sum + achievement.points, 0);

    res.json({
      success: true,
      data: {
        achievements,
        totalPoints,
        earnedCount: achievements.filter(a => a.earned).length,
        totalCount: achievements.length
      }
    });
  } catch (error) {
    logger.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements'
    });
  }
});

// Update learning stats
router.post('/learning-stats', [
  auth,
  body('courseCompleted').optional().isBoolean(),
  body('learningTime').optional().isInt({ min: 0 }),
  body('activity').optional().isString()
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

    const { courseCompleted, learningTime, activity } = req.body;
    const user = await User.findById(req.user!.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update learning stats
    if (courseCompleted) {
      user.profile.learningStats!.coursesCompleted += 1;
    }
    
    if (learningTime) {
      user.profile.learningStats!.totalLearningTime += learningTime;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Learning stats updated successfully',
      data: {
        learningStats: user.profile.learningStats
      }
    });
  } catch (error) {
    logger.error('Update learning stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update learning stats'
    });
  }
});

export default router;
