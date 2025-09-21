import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  auth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  });
};

export const teacherAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  auth(req, res, () => {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher privileges required.'
      });
    }
    next();
  });
};
