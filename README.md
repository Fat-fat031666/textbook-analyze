# 教材分析系统

一个用于分析和管理教材知识点的Web应用系统，支持知识点分类、认知层级标注、审核工作流、知识关联可视化等功能。

## ✨ 功能特性

- 🔐 用户认证与权限管理（RBAC）
- 📝 知识点 CRUD 操作
- 🏷️ 知识点类型分类（概念性知识、原理规则、技能、事实性知识）
- 🧠 认知层级标注（识记、理解、应用、分析、综合、评价）
- ✅ 审核工作流（草稿 → 待审核 → 已发布/已驳回）
- 🔗 知识点关联（前置知识、后继知识、类比知识等）
- 🎯 主题体系管理
- 💬 评论系统（支持回复）
- 📊 数据统计和可视化

## 🚀 快速开始

### 方式一：使用检查脚本（推荐）

```bash
# 1. 检查项目状态
./check-project.sh

# 2. 按照提示配置和启动
```

### 方式二：手动启动

详细步骤请查看 [QUICK_START.md](./QUICK_START.md) 或 [START_PROJECT.md](./START_PROJECT.md)

### 快速命令

```bash
# 检查项目
./check-project.sh

# 启动后端（终端1）
cd server && pnpm dev

# 启动前端（终端2）
pnpm dev
```

## 📋 前置要求

- Node.js 18+
- pnpm（或 npm/yarn）
- MySQL 8.0+
- 端口 3000 和 3001 可用

## 🔧 配置步骤

### 1. 安装依赖

```bash
# 前端
pnpm install

# 后端
cd server
pnpm install
```

### 2. 配置数据库

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置环境变量

```bash
cd server
# 创建 .env 文件
cp .env.example .env
# 编辑 .env，修改数据库密码
```

### 4. 初始化数据库

```bash
cd server
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 5. 启动服务

```bash
# 终端1 - 后端
cd server
pnpm dev

# 终端2 - 前端
pnpm dev
```

## 🧪 测试账号

初始化后会创建以下测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | admin123 |
| 审核员 | auditor@example.com | auditor123 |
| 师范生 | student@example.com | student123 |

## 📁 项目结构

```
textbook/
├── src/                    # 前端源代码
│   ├── pages/             # 页面组件
│   ├── components/        # 通用组件
│   ├── lib/              # 工具库（API等）
│   └── ...
├── server/                # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── middleware/   # 中间件
│   │   └── ...
│   └── prisma/           # 数据库模型
├── check-project.sh      # 项目检查脚本
└── 文档...
```

## 📚 文档

- [QUICK_START.md](./QUICK_START.md) - 快速启动指南
- [START_PROJECT.md](./START_PROJECT.md) - 完整启动指南
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 问题排查
- [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) - 前后端集成
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 项目状态
- [server/README.md](./server/README.md) - 后端文档

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router

### 后端
- Express.js + TypeScript
- Prisma ORM
- MySQL
- JWT 认证

## 🔍 检查项目状态

运行检查脚本：

```bash
./check-project.sh
```

这会检查：
- Node.js 和包管理器
- MySQL 服务
- 依赖安装情况
- 环境变量配置
- 端口占用情况
- 关键文件存在性

## ⚠️ 常见问题

### 数据库连接失败
- 检查 MySQL 服务是否运行
- 检查 `.env` 中的 `DATABASE_URL`
- 确认数据库已创建

### 端口被占用
- 修改 `server/.env` 中的 `PORT`
- 或关闭占用端口的程序

### pnpm 未找到
```bash
npm install -g pnpm
# 或使用 npm 替代
```

更多问题请查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📝 开发命令

### 前端
```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
```

### 后端
```bash
cd server
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm db:generate  # 生成 Prisma Client
pnpm db:push      # 推送数据库结构
pnpm db:seed      # 初始化种子数据
pnpm db:studio    # 打开 Prisma Studio
```

## 🎯 API 端点

主要 API：

- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/knowledge-points` - 获取知识点列表
- `POST /api/knowledge-points` - 创建知识点
- `POST /api/audit/:kpId/approve` - 审核通过
- `POST /api/audit/:kpId/reject` - 审核驳回

完整 API 文档请查看 [server/README.md](./server/README.md)

## 🔒 安全提示

- ⚠️ 生产环境请修改所有默认密码
- ⚠️ 使用强随机字符串作为 JWT_SECRET
- ⚠️ 不要将 `.env` 文件提交到 Git
- ⚠️ 定期备份数据库

## 📄 许可证

本项目由 [网站开发专家](https://space.coze.cn/) 创建。

## 🆘 获取帮助

1. 查看文档目录中的相关指南
2. 运行 `./check-project.sh` 检查项目状态
3. 查看浏览器控制台和终端日志
4. 参考 `TROUBLESHOOTING.md` 排查问题

---

**项目状态**: ✅ 可以运行（部分功能需要完善）

**最后更新**: 2024年

