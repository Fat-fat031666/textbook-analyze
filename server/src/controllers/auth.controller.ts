import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, phone, password, realName, institution, role } = req.body;

    // 验证邮箱或手机号至少提供一个
    if (!email && !phone) {
      return res.status(400).json({ error: '请至少提供邮箱或手机号' });
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone },
      });
      if (existingPhone) {
        return res.status(400).json({ error: '手机号已被注册' });
      }
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户（默认未激活，需要管理员审核）
    const user = await prisma.user.create({
      data: {
        username,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        realName,
        institution: institution || null,
        role: role || 'STUDENT',
        isActive: false, // 需要管理员激活
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
        createdAt: true,
      },
    });

    res.status(201).json({
      message: '注册成功，请等待管理员审核后激活账号',
      user,
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: '请提供邮箱或手机号' });
    }

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: '邮箱/手机号或密码错误' });
    }

    // 验证密码
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱/手机号或密码错误' });
    }

    // 检查账号是否激活
    if (!user.isActive) {
      return res.status(403).json({ error: '账号未激活，请联系管理员' });
    }

    // 生成token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        realName: user.realName,
        institution: user.institution,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

