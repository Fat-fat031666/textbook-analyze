import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  getAuditLogs,
  getAuditLogById,
  approveKnowledgePoint,
  rejectKnowledgePoint,
  getPendingReviews,
} from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// 所有路由需要认证和审核员权限
router.use(authenticate);
router.use(authorize('AUDITOR', 'ADMIN'));

// 获取待审核列表
router.get(
  '/pending',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getPendingReviews
);

// 获取审核日志列表
router.get(
  '/logs',
  [
    query('kpId').optional().isInt(),
    query('operatorId').optional().isInt(),
    query('action').optional().isIn(['SUBMIT', 'APPROVE', 'REJECT', 'REVISE']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAuditLogs
);

// 获取审核日志详情
router.get('/logs/:id', getAuditLogById);

// 通过审核
router.post(
  '/:kpId/approve',
  [
    body('remark').optional().isString(),
  ],
  validate,
  approveKnowledgePoint
);

// 驳回审核
router.post(
  '/:kpId/reject',
  [
    body('remark').trim().notEmpty().withMessage('驳回理由不能为空'),
  ],
  validate,
  rejectKnowledgePoint
);

export default router;

