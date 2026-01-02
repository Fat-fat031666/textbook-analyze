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

### 前置要求

- Node.js 18+
- pnpm（或 npm/yarn）
- MySQL 8.0+
- 端口 3000 和 3001 可用

### 方式一：使用检查脚本（推荐）

```bash
# 1. 检查项目状态
./check-project.sh

# 2. 按照提示配置和启动
```

### 方式二：手动启动

#### 1. 安装依赖

```bash
# 前端
pnpm install

# 后端
cd server
pnpm install
```

#### 2. 配置数据库

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. 配置环境变量

在 `server` 目录下创建 `.env` 文件：

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/textbook_analyze?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
BCRYPT_ROUNDS=10
FRONTEND_URL="http://localhost:3000"
```

**重要**：请将 `your_password` 替换为您的 MySQL 密码。

#### 4. 初始化数据库

```bash
cd server
pnpm db:generate  # 生成 Prisma Client
pnpm db:push      # 推送数据库结构
pnpm db:seed      # 初始化种子数据（创建测试账号）
```

#### 5. 启动服务

```bash
# 终端1 - 后端
cd server
pnpm dev

# 终端2 - 前端
pnpm dev
```

#### 6. 访问应用

- 前端: http://localhost:3000
- 后端: http://localhost:3001

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
└── README.md             # 本文档
```

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

### 登录失败
1. 确保后端服务正在运行（http://localhost:3001）
2. 确保已运行 `pnpm db:seed` 初始化测试账号
3. 检查浏览器控制台是否有错误
4. 测试 API：
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```

### Prisma 错误
```bash
cd server
# 重新生成 Prisma Client
pnpm db:generate
```

### CORS 错误
- 检查 `server/.env` 中的 `FRONTEND_URL`
- 确保值为 `http://localhost:3000`

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

## 🔒 安全提示

- ⚠️ 生产环境请修改所有默认密码
- ⚠️ 使用强随机字符串作为 JWT_SECRET
- ⚠️ 不要将 `.env` 文件提交到 Git
- ⚠️ 定期备份数据库

## 📊 项目状态

### ✅ 已完成
- 后端 API 服务（Express + Prisma）
- 用户认证和权限管理（JWT + RBAC）
- 知识点 CRUD 操作
- 审核工作流
- 前端页面（登录、注册、数据录入、仪表盘、主页面、详情页）
- 所有页面已连接到后端 API
- 所有模拟数据已清除

### ⚠️ 待完善
- 选项数据 API（知识类型、认知层级、主题等）
- 类型名称到 ID 的映射
- 章节层级结构 API

## 📚 相关文档

- [server/README.md](./server/README.md) - 后端详细文档
- [server/ENV_SETUP.md](./server/ENV_SETUP.md) - 环境变量配置详细说明

## 🆘 获取帮助

1. 查看本文档的常见问题部分
2. 运行 `./check-project.sh` 检查项目状态
3. 查看浏览器控制台和终端日志
4. 参考后端文档 [server/README.md](./server/README.md)

---

**项目状态**: ✅ 可以运行（部分功能需要完善）

**最后更新**: 2024年
