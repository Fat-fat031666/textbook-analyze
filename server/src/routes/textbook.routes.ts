import { Router } from 'express';
import { query } from 'express-validator';
import { getTextbookStructure } from '../controllers/textbook.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// 获取教材结构树（支持访客查看）
router.get(
  '/structure',
  optionalAuth,
  [
    query('subjectId').optional().isInt(),
  ],
  validate,
  getTextbookStructure
);

export default router;

