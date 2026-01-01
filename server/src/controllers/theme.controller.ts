import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getThemes = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (subjectId) {
      where.subjectId = parseInt(subjectId as string);
    }

    const [themes, total] = await Promise.all([
      prisma.mathTheme.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          subject: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mathTheme.count({ where }),
    ]);

    res.json({
      themes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取主题列表错误:', error);
    res.status(500).json({ error: '获取主题列表失败' });
  }
};

export const getThemeById = async (req: AuthRequest, res: Response) => {
  try {
    const themeId = parseInt(req.params.id);

    const theme = await prisma.mathTheme.findUnique({
      where: { id: themeId },
      include: {
        subject: true,
        knowledgePoints: {
          include: {
            knowledgePoint: {
              select: {
                id: true,
                content: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!theme) {
      return res.status(404).json({ error: '主题不存在' });
    }

    res.json({ theme });
  } catch (error) {
    console.error('获取主题详情错误:', error);
    res.status(500).json({ error: '获取主题详情失败' });
  }
};

export const getThemeKnowledgePoints = async (req: AuthRequest, res: Response) => {
  try {
    const themeId = parseInt(req.params.id);
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 访客只能查看已发布的知识点
    const where: any = {
      themes: {
        some: {
          themeId,
        },
      },
    };

    if (!req.user) {
      where.status = 'PUBLISHED';
    }

    const [knowledgePoints, total] = await Promise.all([
      prisma.knowledgePoint.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          type: true,
          cognitiveLevel: true,
          creator: {
            select: {
              id: true,
              username: true,
              realName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.knowledgePoint.count({ where }),
    ]);

    res.json({
      knowledgePoints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取主题知识点错误:', error);
    res.status(500).json({ error: '获取主题知识点失败' });
  }
};

export const createTheme = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const { name, description, subjectId } = req.body;

    // 检查主题名是否已存在
    const existingTheme = await prisma.mathTheme.findUnique({
      where: { name },
    });

    if (existingTheme) {
      return res.status(400).json({ error: '主题名称已存在' });
    }

    const theme = await prisma.mathTheme.create({
      data: {
        name,
        description: description || null,
        subjectId: subjectId ? parseInt(subjectId) : null,
      },
      include: {
        subject: true,
      },
    });

    res.status(201).json({ message: '创建成功', theme });
  } catch (error) {
    console.error('创建主题错误:', error);
    res.status(500).json({ error: '创建主题失败' });
  }
};

export const updateTheme = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const themeId = parseInt(req.params.id);
    const { name, description } = req.body;

    const theme = await prisma.mathTheme.update({
      where: { id: themeId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        subject: true,
      },
    });

    res.json({ message: '更新成功', theme });
  } catch (error) {
    console.error('更新主题错误:', error);
    res.status(500).json({ error: '更新主题失败' });
  }
};

export const deleteTheme = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const themeId = parseInt(req.params.id);

    await prisma.mathTheme.delete({
      where: { id: themeId },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除主题错误:', error);
    res.status(500).json({ error: '删除主题失败' });
  }
};

