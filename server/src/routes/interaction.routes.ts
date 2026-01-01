import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getInteractions,
  getInteractionById,
  createInteraction,
  updateInteraction,
  deleteInteraction,
  getInteractionReplies,
} from '../controllers/interaction.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { authorizeOwnerOrAdmin } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// 获取评论列表
router.get(
  '/',
  optionalAuth,
  [
    query('targetType').isIn(['KNOWLEDGE_POINT', 'LESSON', 'CHAPTER', 'SECTION']),
    query('targetId').notEmpty(),
    query('parentId').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getInteractions
);

// 获取评论详情
router.get('/:id', optionalAuth, getInteractionById);

// 获取评论的回复
router.get('/:id/replies', optionalAuth, getInteractionReplies);

// 创建评论（需要认证）
router.post(
  '/',
  authenticate,
  [
    body('targetType').isIn(['KNOWLEDGE_POINT', 'LESSON', 'CHAPTER', 'SECTION']).withMessage('目标类型无效'),
    body('targetId').notEmpty().withMessage('目标ID不能为空'),
    body('content').trim().notEmpty().withMessage('评论内容不能为空'),
    body('parentId').optional().isInt(),
    body('knowledgePointId').optional().isInt(),
  ],
  validate,
  createInteraction
);

// 更新评论（仅创建者）
router.patch(
  '/:id',
  authenticate,
  authorizeOwnerOrAdmin((req) => null), // 将在控制器中处理
  [
    body('content').trim().notEmpty().withMessage('评论内容不能为空'),
  ],
  validate,
  updateInteraction
);

// 删除评论（仅创建者或管理员）
router.delete('/:id', authenticate, authorizeOwnerOrAdmin((req) => null), deleteInteraction);

export default router;

