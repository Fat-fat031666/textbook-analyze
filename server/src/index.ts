import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import knowledgePointRoutes from './routes/knowledgePoint.routes.js';
import themeRoutes from './routes/theme.routes.js';
import interactionRoutes from './routes/interaction.routes.js';
import auditRoutes from './routes/audit.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/knowledge-points', knowledgePointRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/audit', auditRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
});

