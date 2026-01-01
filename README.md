# 教材分析系统

项目编号: 7590290323075940618

本项目是由 [网站开发专家](https://space.coze.cn/) 创建.

[**项目地址**](https://space.coze.cn/task/7590290323075940618)

## 项目简介

教材分析系统是一个用于分析和管理教材知识点的Web应用，支持知识点分类、认知层级标注、审核工作流、知识关联可视化等功能。

## 技术栈

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

## 项目结构

```
textbook/
├── src/              # 前端源代码
├── server/           # 后端服务
│   ├── src/         # 后端源代码
│   ├── prisma/      # 数据库模型
│   └── package.json
├── package.json      # 前端依赖
└── README.md
```

## 本地开发

### 环境准备

- 安装 [Node.js](https://nodejs.org/en) (推荐 v18+)
- 安装 [pnpm](https://pnpm.io/installation)
- 安装 [MySQL](https://dev.mysql.com/downloads/) (推荐 8.0+)

### 数据库设置

1. 创建 MySQL 数据库：

```sql
CREATE DATABASE textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置数据库连接（在 `server/.env` 中）：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/textbook_analyze?schema=public"
```

### 后端启动

1. 进入后端目录并安装依赖：

```sh
cd server
pnpm install
```

2. 初始化数据库：

```sh
# 生成 Prisma Client
pnpm db:generate

# 推送数据库结构
pnpm db:push

# 初始化种子数据（可选，会创建测试账号）
pnpm db:seed
```

3. 启动后端服务：

```sh
pnpm dev
```

后端服务将在 `http://localhost:3001` 启动。

### 前端启动

1. 在项目根目录安装依赖：

```sh
pnpm install
```

2. 启动开发服务器：

```sh
pnpm run dev
```

3. 在浏览器访问 http://localhost:3000

## 默认测试账号

初始化种子数据后会创建以下测试账号：

- **管理员**: `admin` / `admin123`
- **审核员**: `auditor` / `auditor123`
- **师范生**: `student` / `student123`

⚠️ **生产环境请务必修改默认密码！**

## API 文档

后端 API 文档请参考 [server/README.md](./server/README.md)

主要 API 端点：

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/knowledge-points` - 获取知识点列表
- `POST /api/knowledge-points` - 创建知识点
- `POST /api/audit/:kpId/approve` - 审核通过
- `POST /api/audit/:kpId/reject` - 审核驳回

## 功能特性

- ✅ 用户认证与权限管理（RBAC）
- ✅ 知识点 CRUD 操作
- ✅ 知识点类型分类（概念性知识、原理规则、技能、事实性知识）
- ✅ 认知层级标注（识记、理解、应用、分析、综合、评价）
- ✅ 审核工作流（草稿 → 待审核 → 已发布/已驳回）
- ✅ 知识点关联（前置知识、后继知识、类比知识等）
- ✅ 主题体系管理
- ✅ 评论系统（支持回复）
- ✅ 审核日志和历史版本查看

## 开发命令

### 前端

```sh
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
```

### 后端

```sh
cd server
pnpm dev          # 启动开发服务器（热重载）
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm db:generate  # 生成 Prisma Client
pnpm db:push     # 推送数据库结构
pnpm db:migrate  # 创建数据库迁移
pnpm db:studio   # 打开 Prisma Studio（数据库可视化工具）
pnpm db:seed     # 初始化种子数据
```

## 注意事项

1. 确保 MySQL 服务已启动
2. 确保后端服务在 3001 端口运行
3. 前端需要配置 API 基础 URL 指向后端服务
4. 生产环境请修改 `.env` 中的敏感信息（JWT_SECRET、数据库密码等）
