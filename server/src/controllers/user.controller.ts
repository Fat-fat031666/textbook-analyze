import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          realName: true,
          institution: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        realName: true,
        institution: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // 检查权限：只能修改自己的信息，或管理员可以修改任何人的信息
    if (userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权修改此用户信息' });
    }

    const { email, phone, realName, institution } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email }),
        ...(phone && { phone }),
        ...(realName && { realName }),
        ...(institution !== undefined && { institution }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        realName: true,
        institution: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ message: '更新成功', user });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ error: '更新用户失败' });
  }
};

export const activateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        realName: true,
        role: true,
        isActive: true,
      },
    });

    res.json({ message: '用户已激活', user });
  } catch (error) {
    console.error('激活用户错误:', error);
    res.status(500).json({ error: '激活用户失败' });
  }
};

