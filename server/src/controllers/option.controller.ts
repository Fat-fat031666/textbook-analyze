import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

// 获取知识类型列表
export const getKnowledgeTypes = async (req: AuthRequest, res: Response) => {
  try {
    const knowledgeTypes = await prisma.knowledgeType.findMany({
      orderBy: { id: 'asc' },
    });

    res.json({ knowledgeTypes });
  } catch (error: any) {
    console.error('获取知识类型失败:', error);
    res.status(500).json({ error: '获取知识类型失败' });
  }
};

// 获取认知层级列表
export const getCognitiveLevels = async (req: AuthRequest, res: Response) => {
  try {
    const cognitiveLevels = await prisma.cognitiveLevel.findMany({
      orderBy: { level: 'asc' },
    });

    res.json({ cognitiveLevels });
  } catch (error: any) {
    console.error('获取认知层级失败:', error);
    res.status(500).json({ error: '获取认知层级失败' });
  }
};

