import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getKnowledgePoints,
  getKnowledgePointById,
  createKnowledgePoint,
  updateKnowledgePoint,
  deleteKnowledgePoint,
  submitForReview,
  getKnowledgePointRelations,
  createKnowledgePointRelation,
  deleteKnowledgePointRelation,
  getKnowledgePointHistory,
} from '../controllers/knowledgePoint.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { authorize, authorizeOwnerOrAdmin } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// 获取知识点列表（支持访客查看已发布的）
router.get(
  '/',
  optionalAuth,
  [
    query('status').optional().isIn(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED']),
    query('typeId').optional().isInt(),
    query('cognitiveLevelId').optional().isInt(),
    query('creatorId').optional().isInt(),
    query('sectionId').optional().isInt(),
    query('themeId').optional().isInt(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getKnowledgePoints
);

// 获取知识点详情
router.get('/:id', optionalAuth, getKnowledgePointById);

// 获取知识点历史版本
router.get('/:id/history', authenticate, getKnowledgePointHistory);

// 获取知识点关联
router.get('/:id/relations', optionalAuth, getKnowledgePointRelations);

// 创建知识点（需要认证）
router.post(
  '/',
  authenticate,
  [
    body('content').trim().notEmpty().withMessage('知识点内容不能为空'),
    body('typeId').isInt().withMessage('知识类型ID无效'),
    body('cognitiveLevelId').optional().isInt(),
    body('sectionId').optional().isInt(),
    body('lessonId').optional().isString(),
    body('themeIds').optional().isArray(),
    body('versionTag').optional().isString(),
  ],
  validate,
  createKnowledgePoint
);

// 更新知识点（仅创建者或管理员）
router.patch(
  '/:id',
  authenticate,
  authorizeOwnerOrAdmin((req) => {
    // 从数据库获取创建者ID
    return null; // 将在控制器中处理
  }),
  [
    body('content').optional().trim().notEmpty(),
    body('typeId').optional().isInt(),
    body('cognitiveLevelId').optional().isInt(),
    body('themeIds').optional().isArray(),
    body('versionTag').optional().isString(),
  ],
  validate,
  updateKnowledgePoint
);

// 提交审核
router.post(
  '/:id/submit',
  authenticate,
  [
    body('remark').optional().isString(),
  ],
  validate,
  submitForReview
);

// 创建知识点关联
router.post(
  '/:id/relations',
  authenticate,
  [
    body('targetKpId').isInt().withMessage('目标知识点ID无效'),
    body('relationType').isIn(['PREREQUISITE', 'SUCCESSOR', 'ANALOGY', 'RELATED']).withMessage('关系类型无效'),
    body('description').optional().isString(),
  ],
  validate,
  createKnowledgePointRelation
);

// 删除知识点关联
router.delete('/:id/relations/:relationId', authenticate, deleteKnowledgePointRelation);

// 删除知识点（仅创建者或管理员）
router.delete('/:id', authenticate, authorizeOwnerOrAdmin((req) => null), deleteKnowledgePoint);

export default router;

