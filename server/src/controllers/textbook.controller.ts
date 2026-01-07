import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

// 获取完整的教材结构树
export const getTextbookStructure = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId } = req.query;

    // 构建查询条件
    const where: any = {};
    if (subjectId) {
      where.subjectId = parseInt(subjectId as string);
    }

    // 获取所有学科
    const subjects = await prisma.subject.findMany({
      where: subjectId ? { id: parseInt(subjectId as string) } : undefined,
      include: {
        educationLevels: {
          include: {
            grades: {
              include: {
                books: {
                  include: {
                    chapters: {
                      include: {
                        sections: {
                          orderBy: { order: 'asc' },
                        },
                      },
                      orderBy: { order: 'asc' },
                    },
                  },
                  orderBy: { code: 'asc' },
                },
              },
              orderBy: { code: 'asc' },
            },
          },
          orderBy: { code: 'asc' },
        },
      },
      orderBy: { code: 'asc' },
    });

    res.json({ subjects });
  } catch (error: any) {
    console.error('获取教材结构失败:', error);
    res.status(500).json({ error: '获取教材结构失败: ' + error.message });
  }
};

