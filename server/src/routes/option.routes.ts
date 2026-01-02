import { Router } from 'express';
import { getKnowledgeTypes, getCognitiveLevels } from '../controllers/option.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// 获取知识类型列表
router.get('/knowledge-types', optionalAuth, getKnowledgeTypes);

// 获取认知层级列表
router.get('/cognitive-levels', optionalAuth, getCognitiveLevels);

export default router;

