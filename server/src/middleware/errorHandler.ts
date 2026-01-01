import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('错误:', err);

  // Prisma错误处理
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: '数据库操作失败',
      message: err.message,
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '无效的认证令牌',
    });
  }

  // 默认错误
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

