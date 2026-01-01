import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// 注册
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度应在3-50字符之间'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少6位'),
    body('realName').trim().notEmpty().withMessage('真实姓名不能为空'),
    body('institution').optional().trim(),
    body('role').isIn(['GUEST', 'STUDENT', 'RESEARCHER', 'ADMIN']).withMessage('角色无效'),
  ],
  validate,
  register
);

// 登录
router.post(
  '/login',
  [
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validate,
  login
);

// 获取当前用户信息
router.get('/me', authenticate, getCurrentUser);

export default router;

