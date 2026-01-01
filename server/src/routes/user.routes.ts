import { Router } from 'express';
import { getUsers, getUserById, updateUser, activateUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 获取用户列表（管理员/审核员）
router.get('/', authorize('ADMIN', 'AUDITOR'), getUsers);

// 获取单个用户信息
router.get('/:id', getUserById);

// 更新用户信息
router.patch('/:id', updateUser);

// 激活用户（管理员）
router.patch('/:id/activate', authorize('ADMIN'), activateUser);

export default router;

