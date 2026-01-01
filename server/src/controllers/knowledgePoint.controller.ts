import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { KnowledgeStatus, AuditAction } from '@prisma/client';

export const getKnowledgePoints = async (req: AuthRequest, res: Response) => {
  try {
    const {
      status,
      typeId,
      cognitiveLevelId,
      creatorId,
      sectionId,
      themeId,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 访客只能查看已发布的知识点
    const where: any = {};
    if (!req.user) {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status;
    }

    if (typeId) where.typeId = parseInt(typeId as string);
    if (cognitiveLevelId) where.cognitiveLevelId = parseInt(cognitiveLevelId as string);
    if (creatorId) where.creatorId = parseInt(creatorId as string);
    if (sectionId) where.sectionId = parseInt(sectionId as string);

    const [knowledgePoints, total] = await Promise.all([
      prisma.knowledgePoint.findMany({
        where: themeId
          ? {
              ...where,
              themes: {
                some: {
                  themeId: parseInt(themeId as string),
                },
              },
            }
          : where,
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
          section: {
            include: {
              chapter: {
                include: {
                  book: {
                    include: {
                      grade: {
                        include: {
                          educationLevel: {
                            include: {
                              subject: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          themes: {
            include: {
              theme: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.knowledgePoint.count({
        where: themeId
          ? {
              ...where,
              themes: {
                some: {
                  themeId: parseInt(themeId as string),
                },
              },
            }
          : where,
      }),
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
    console.error('获取知识点列表错误:', error);
    res.status(500).json({ error: '获取知识点列表失败' });
  }
};

export const getKnowledgePointById = async (req: AuthRequest, res: Response) => {
  try {
    const kpId = parseInt(req.params.id);

    const knowledgePoint = await prisma.knowledgePoint.findUnique({
      where: { id: kpId },
      include: {
        type: true,
        cognitiveLevel: true,
        creator: {
          select: {
            id: true,
            username: true,
            realName: true,
            institution: true,
          },
        },
        section: {
          include: {
            chapter: {
              include: {
                book: {
                  include: {
                    grade: {
                      include: {
                        educationLevel: {
                          include: {
                            subject: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        themes: {
          include: {
            theme: true,
          },
        },
        sourceRelations: {
          include: {
            targetKp: {
              select: {
                id: true,
                content: true,
                status: true,
              },
            },
          },
        },
        targetRelations: {
          include: {
            sourceKp: {
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

    if (!knowledgePoint) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    // 访客只能查看已发布的知识点
    if (!req.user && knowledgePoint.status !== 'PUBLISHED') {
      return res.status(403).json({ error: '无权访问此知识点' });
    }

    res.json({ knowledgePoint });
  } catch (error) {
    console.error('获取知识点详情错误:', error);
    res.status(500).json({ error: '获取知识点详情失败' });
  }
};

export const createKnowledgePoint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const {
      content,
      typeId,
      cognitiveLevelId,
      sectionId,
      lessonId,
      themeIds,
      versionTag,
    } = req.body;

    const knowledgePoint = await prisma.knowledgePoint.create({
      data: {
        content,
        typeId,
        cognitiveLevelId: cognitiveLevelId || null,
        sectionId: sectionId || null,
        lessonId: lessonId || null,
        creatorId: req.user.id,
        status: 'DRAFT',
        versionTag: versionTag || null,
        themes: themeIds
          ? {
              create: themeIds.map((themeId: number) => ({
                themeId,
              })),
            }
          : undefined,
      },
      include: {
        type: true,
        cognitiveLevel: true,
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    res.status(201).json({ message: '创建成功', knowledgePoint });
  } catch (error) {
    console.error('创建知识点错误:', error);
    res.status(500).json({ error: '创建知识点失败' });
  }
};

export const updateKnowledgePoint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const kpId = parseInt(req.params.id);
    const {
      content,
      typeId,
      cognitiveLevelId,
      themeIds,
      versionTag,
    } = req.body;

    // 检查权限：只能修改自己的草稿或待审核状态的知识点
    const existingKp = await prisma.knowledgePoint.findUnique({
      where: { id: kpId },
    });

    if (!existingKp) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    if (
      existingKp.creatorId !== req.user.id &&
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'AUDITOR'
    ) {
      return res.status(403).json({ error: '无权修改此知识点' });
    }

    // 只能修改草稿或已驳回状态的知识点
    if (
      existingKp.status !== 'DRAFT' &&
      existingKp.status !== 'REJECTED' &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ error: '只能修改草稿或已驳回的知识点' });
    }

    // 更新知识点
    const updateData: any = {};
    if (content) updateData.content = content;
    if (typeId) updateData.typeId = typeId;
    if (cognitiveLevelId !== undefined) updateData.cognitiveLevelId = cognitiveLevelId;
    if (versionTag) updateData.versionTag = versionTag;

    const knowledgePoint = await prisma.knowledgePoint.update({
      where: { id: kpId },
      data: {
        ...updateData,
        ...(themeIds && {
          themes: {
            deleteMany: {},
            create: themeIds.map((themeId: number) => ({
              themeId,
            })),
          },
        }),
      },
      include: {
        type: true,
        cognitiveLevel: true,
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    res.json({ message: '更新成功', knowledgePoint });
  } catch (error) {
    console.error('更新知识点错误:', error);
    res.status(500).json({ error: '更新知识点失败' });
  }
};

export const deleteKnowledgePoint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const kpId = parseInt(req.params.id);

    const existingKp = await prisma.knowledgePoint.findUnique({
      where: { id: kpId },
    });

    if (!existingKp) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    if (
      existingKp.creatorId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ error: '无权删除此知识点' });
    }

    await prisma.knowledgePoint.delete({
      where: { id: kpId },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除知识点错误:', error);
    res.status(500).json({ error: '删除知识点失败' });
  }
};

export const submitForReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const kpId = parseInt(req.params.id);
    const { remark } = req.body;

    const knowledgePoint = await prisma.knowledgePoint.findUnique({
      where: { id: kpId },
    });

    if (!knowledgePoint) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    if (knowledgePoint.creatorId !== req.user.id) {
      return res.status(403).json({ error: '只能提交自己创建的知识点' });
    }

    if (knowledgePoint.status !== 'DRAFT' && knowledgePoint.status !== 'REJECTED') {
      return res.status(400).json({ error: '只能提交草稿或已驳回的知识点' });
    }

    // 创建快照
    const snapshot = {
      content: knowledgePoint.content,
      typeId: knowledgePoint.typeId,
      cognitiveLevelId: knowledgePoint.cognitiveLevelId,
      versionTag: knowledgePoint.versionTag,
      updatedAt: knowledgePoint.updatedAt,
    };

    // 更新状态并创建审核日志
    const [updatedKp] = await Promise.all([
      prisma.knowledgePoint.update({
        where: { id: kpId },
        data: { status: 'PENDING' },
      }),
      prisma.auditLog.create({
        data: {
          kpId,
          operatorId: req.user.id,
          submitterId: req.user.id,
          action: 'SUBMIT',
          remark: remark || null,
          snapshot: snapshot as any,
        },
      }),
    ]);

    res.json({ message: '提交审核成功', knowledgePoint: updatedKp });
  } catch (error) {
    console.error('提交审核错误:', error);
    res.status(500).json({ error: '提交审核失败' });
  }
};

export const getKnowledgePointRelations = async (req: AuthRequest, res: Response) => {
  try {
    const kpId = parseInt(req.params.id);

    const relations = await prisma.kpRelation.findMany({
      where: {
        OR: [{ sourceKpId: kpId }, { targetKpId: kpId }],
      },
      include: {
        sourceKp: {
          select: {
            id: true,
            content: true,
            status: true,
          },
        },
        targetKp: {
          select: {
            id: true,
            content: true,
            status: true,
          },
        },
      },
    });

    res.json({ relations });
  } catch (error) {
    console.error('获取知识点关联错误:', error);
    res.status(500).json({ error: '获取知识点关联失败' });
  }
};

export const createKnowledgePointRelation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const sourceKpId = parseInt(req.params.id);
    const { targetKpId, relationType, description } = req.body;

    if (sourceKpId === targetKpId) {
      return res.status(400).json({ error: '不能关联自己' });
    }

    const relation = await prisma.kpRelation.create({
      data: {
        sourceKpId,
        targetKpId,
        relationType,
        description: description || null,
      },
      include: {
        sourceKp: {
          select: {
            id: true,
            content: true,
          },
        },
        targetKp: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    res.status(201).json({ message: '创建关联成功', relation });
  } catch (error) {
    console.error('创建知识点关联错误:', error);
    res.status(500).json({ error: '创建知识点关联失败' });
  }
};

export const deleteKnowledgePointRelation = async (req: AuthRequest, res: Response) => {
  try {
    const relationId = parseInt(req.params.relationId);

    await prisma.kpRelation.delete({
      where: { id: relationId },
    });

    res.json({ message: '删除关联成功' });
  } catch (error) {
    console.error('删除知识点关联错误:', error);
    res.status(500).json({ error: '删除知识点关联失败' });
  }
};

export const getKnowledgePointHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const kpId = parseInt(req.params.id);

    // 检查权限：只能查看自己创建的知识点历史，或管理员/审核员可以查看所有
    const knowledgePoint = await prisma.knowledgePoint.findUnique({
      where: { id: kpId },
    });

    if (!knowledgePoint) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    if (
      knowledgePoint.creatorId !== req.user.id &&
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'AUDITOR'
    ) {
      return res.status(403).json({ error: '无权查看此知识点的历史' });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { kpId },
      include: {
        operator: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
        submitter: {
          select: {
            id: true,
            username: true,
            realName: true,
          },
        },
      },
      orderBy: { operateTime: 'desc' },
    });

    res.json({ history: auditLogs });
  } catch (error) {
    console.error('获取知识点历史错误:', error);
    res.status(500).json({ error: '获取知识点历史失败' });
  }
};

