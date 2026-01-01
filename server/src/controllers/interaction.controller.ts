import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getInteractions = async (req: AuthRequest, res: Response) => {
  try {
    const {
      targetType,
      targetId,
      parentId,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      targetType: targetType as string,
      targetId: targetId as string,
    };

    if (parentId) {
      where.parentId = parseInt(parentId as string);
    } else {
      where.parentId = null; // 只获取顶级评论
    }

    const [interactions, total] = await Promise.all([
      prisma.interaction.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              realName: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  realName: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interaction.count({ where }),
    ]);

    res.json({
      interactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ error: '获取评论列表失败' });
  }
};

export const getInteractionById = async (req: AuthRequest, res: Response) => {
  try {
    const interactionId = parseInt(req.params.id);

    const interaction = await prisma.interaction.findUnique({
      where: { id: interactionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                realName: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                realName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!interaction) {
      return res.status(404).json({ error: '评论不存在' });
    }

    res.json({ interaction });
  } catch (error) {
    console.error('获取评论详情错误:', error);
    res.status(500).json({ error: '获取评论详情失败' });
  }
};

export const getInteractionReplies = async (req: AuthRequest, res: Response) => {
  try {
    const interactionId = parseInt(req.params.id);

    const replies = await prisma.interaction.findMany({
      where: { parentId: interactionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ replies });
  } catch (error) {
    console.error('获取评论回复错误:', error);
    res.status(500).json({ error: '获取评论回复失败' });
  }
};

export const createInteraction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const {
      targetType,
      targetId,
      content,
      parentId,
      knowledgePointId,
    } = req.body;

    const interaction = await prisma.interaction.create({
      data: {
        targetType,
        targetId,
        content,
        userId: req.user.id,
        parentId: parentId ? parseInt(parentId) : null,
        knowledgePointId: knowledgePointId ? parseInt(knowledgePointId) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
        parent: parentId
          ? {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    realName: true,
                  },
                },
              },
            }
          : undefined,
      },
    });

    res.status(201).json({ message: '评论成功', interaction });
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({ error: '创建评论失败' });
  }
};

export const updateInteraction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const interactionId = parseInt(req.params.id);
    const { content } = req.body;

    // 检查权限
    const existingInteraction = await prisma.interaction.findUnique({
      where: { id: interactionId },
    });

    if (!existingInteraction) {
      return res.status(404).json({ error: '评论不存在' });
    }

    if (existingInteraction.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权修改此评论' });
    }

    const interaction = await prisma.interaction.update({
      where: { id: interactionId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
      },
    });

    res.json({ message: '更新成功', interaction });
  } catch (error) {
    console.error('更新评论错误:', error);
    res.status(500).json({ error: '更新评论失败' });
  }
};

export const deleteInteraction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const interactionId = parseInt(req.params.id);

    // 检查权限
    const existingInteraction = await prisma.interaction.findUnique({
      where: { id: interactionId },
    });

    if (!existingInteraction) {
      return res.status(404).json({ error: '评论不存在' });
    }

    if (existingInteraction.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    await prisma.interaction.delete({
      where: { id: interactionId },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ error: '删除评论失败' });
  }
};

