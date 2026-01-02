import { Router } from 'express';
import { body } from 'express-validator';
import { findOrCreateSection } from '../controllers/section.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// 查找或创建 Section（需要认证，因为创建知识点时需要）
router.post(
  '/find-or-create',
  optionalAuth, // 允许访客也使用，但创建操作可能需要权限
  [
    body('subjectCode').trim().notEmpty().withMessage('科目代码不能为空'),
    body('educationLevelCode').trim().notEmpty().withMessage('学段代码不能为空'),
    body('gradeCode').trim().notEmpty().withMessage('年级代码不能为空'),
    body('bookCode').trim().notEmpty().withMessage('册别代码不能为空'),
    body('chapterName').trim().notEmpty().withMessage('章名称不能为空'),
    body('sectionName').trim().notEmpty().withMessage('节名称不能为空'),
  ],
  validate,
  findOrCreateSection
);

export default router;

