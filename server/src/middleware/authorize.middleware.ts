import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
};

// 检查是否为资源所有者或管理员
export const authorizeOwnerOrAdmin = (getUserId: (req: AuthRequest) => number | null) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const resourceUserId = getUserId(req);
    const isOwner = resourceUserId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'AUDITOR';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: '只能操作自己的资源' });
    }

    next();
  };
};

