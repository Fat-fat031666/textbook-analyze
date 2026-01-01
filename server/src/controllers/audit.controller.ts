import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { KnowledgeStatus, AuditAction } from '@prisma/client';

export const getPendingReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [knowledgePoints, total] = await Promise.all([
      prisma.knowledgePoint.findMany({
        where: { status: 'PENDING' },
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
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.knowledgePoint.count({
        where: { status: 'PENDING' },
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
    console.error('获取待审核列表错误:', error);
    res.status(500).json({ error: '获取待审核列表失败' });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kpId,
      operatorId,
      action,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (kpId) where.kpId = parseInt(kpId as string);
    if (operatorId) where.operatorId = parseInt(operatorId as string);
    if (action) where.action = action;

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          knowledgePoint: {
            select: {
              id: true,
              content: true,
              status: true,
            },
          },
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
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      auditLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('获取审核日志错误:', error);
    res.status(500).json({ error: '获取审核日志失败' });
  }
};

export const getAuditLogById = async (req: AuthRequest, res: Response) => {
  try {
    const logId = parseInt(req.params.id);

    const auditLog = await prisma.auditLog.findUnique({
      where: { id: logId },
      include: {
        knowledgePoint: {
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
        },
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
    });

    if (!auditLog) {
      return res.status(404).json({ error: '审核日志不存在' });
    }

    res.json({ auditLog });
  } catch (error) {
    console.error('获取审核日志详情错误:', error);
    res.status(500).json({ error: '获取审核日志详情失败' });
  }
};

export const approveKnowledgePoint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const kpId = parseInt(req.params.kpId);
    const { remark } = req.body;

    const knowledgePoint = await prisma.knowledgePoint.findUnique({
      where: { id: kpId },
    });

    if (!knowledgePoint) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    if (knowledgePoint.status !== 'PENDING') {
      return res.status(400).json({ error: '只能审核待审核状态的知识点' });
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
    const [updatedKp, auditLog] = await Promise.all([
      prisma.knowledgePoint.update({
        where: { id: kpId },
        data: { status: 'PUBLISHED' },
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
      }),
      prisma.auditLog.create({
        data: {
          kpId,
          operatorId: req.user.id,
          submitterId: knowledgePoint.creatorId,
          action: 'APPROVE',
          remark: remark || null,
          snapshot: snapshot as any,
        },
      }),
    ]);

    res.json({ message: '审核通过', knowledgePoint: updatedKp, auditLog });
  } catch (error) {
    console.error('审核通过错误:', error);
    res.status(500).json({ error: '审核操作失败' });
  }
};

export const rejectKnowledgePoint = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '需要认证' });
    }

    const kpId = parseInt(req.params.kpId);
    const { remark } = req.body;

    if (!remark || remark.trim().length === 0) {
      return res.status(400).json({ error: '驳回理由不能为空' });
    }

    const knowledgePoint = await prisma.knowledgePoint.findUnique({
      where: { id: kpId },
    });

    if (!knowledgePoint) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    if (knowledgePoint.status !== 'PENDING') {
      return res.status(400).json({ error: '只能审核待审核状态的知识点' });
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
    const [updatedKp, auditLog] = await Promise.all([
      prisma.knowledgePoint.update({
        where: { id: kpId },
        data: { status: 'REJECTED' },
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
      }),
      prisma.auditLog.create({
        data: {
          kpId,
          operatorId: req.user.id,
          submitterId: knowledgePoint.creatorId,
          action: 'REJECT',
          remark: remark.trim(),
          snapshot: snapshot as any,
        },
      }),
    ]);

    res.json({ message: '已驳回', knowledgePoint: updatedKp, auditLog });
  } catch (error) {
    console.error('审核驳回错误:', error);
    res.status(500).json({ error: '审核操作失败' });
  }
};

