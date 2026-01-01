import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getThemes,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
  getThemeKnowledgePoints,
} from '../controllers/theme.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// 获取主题列表
router.get(
  '/',
  optionalAuth,
  [
    query('subjectId').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getThemes
);

// 获取主题详情
router.get('/:id', optionalAuth, getThemeById);

// 获取主题下的知识点
router.get('/:id/knowledge-points', optionalAuth, getThemeKnowledgePoints);

// 创建主题（管理员/教研员）
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  [
    body('name').trim().notEmpty().withMessage('主题名称不能为空'),
    body('description').optional().isString(),
    body('subjectId').optional().isInt(),
  ],
  validate,
  createTheme
);

// 更新主题
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'RESEARCHER'),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().isString(),
  ],
  validate,
  updateTheme
);

// 删除主题
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTheme);

export default router;

