# 教材分析系统 - 后端服务

基于 Express + TypeScript + Prisma + MySQL 构建的后端 API 服务。

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: MySQL
- **认证**: JWT
- **密码加密**: bcryptjs

## 功能特性

### 核心功能

1. **用户认证与权限管理**
   - 用户注册/登录
   - JWT Token 认证
   - RBAC 角色权限控制（访客、师范生、教研员、审核员、管理员）

2. **知识点管理**
   - 知识点的 CRUD 操作
   - 知识点类型分类（概念性知识、原理规则、技能、事实性知识）
   - 认知层级标注（识记、理解、应用、分析、综合、评价）
   - 知识点状态管理（草稿、待审核、已发布、已驳回）

3. **审核工作流**
   - 提交审核
   - 审核通过/驳回
   - 审核日志记录
   - 历史版本查看

4. **知识点关联**
   - 知识点之间的关联关系（前置知识、后继知识、类比知识等）
   - 知识图谱可视化支持

5. **主题体系**
   - 核心主题管理
   - 知识点与主题的关联
   - 跨章节主题检索

6. **评论系统**
   - 多层级评论（支持回复）
   - 评论的 CRUD 操作

## 项目结构

```
server/
├── src/
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── routes/          # 路由
│   ├── lib/             # 工具库
│   ├── utils/           # 工具函数
│   ├── scripts/         # 脚本
│   └── index.ts         # 入口文件
├── prisma/
│   └── schema.prisma    # 数据库模型定义
├── package.json
└── tsconfig.json
```

## 快速开始

### 1. 安装依赖

```bash
cd server
pnpm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="mysql://user:password@localhost:3306/textbook_analyze?schema=public"

# JWT密钥
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# 服务器配置
PORT=3001
NODE_ENV=development

# 密码加密轮数
BCRYPT_ROUNDS=10
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
pnpm db:generate

# 推送数据库结构（开发环境）
pnpm db:push

# 或使用迁移（生产环境）
pnpm db:migrate

# 初始化种子数据
pnpm db:seed
```

### 4. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3001` 启动。

## API 文档

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户管理

- `GET /api/users` - 获取用户列表（管理员/审核员）
- `GET /api/users/:id` - 获取用户详情
- `PATCH /api/users/:id` - 更新用户信息
- `PATCH /api/users/:id/activate` - 激活用户（管理员）

### 知识点管理

- `GET /api/knowledge-points` - 获取知识点列表
- `GET /api/knowledge-points/:id` - 获取知识点详情
- `POST /api/knowledge-points` - 创建知识点
- `PATCH /api/knowledge-points/:id` - 更新知识点
- `DELETE /api/knowledge-points/:id` - 删除知识点
- `POST /api/knowledge-points/:id/submit` - 提交审核
- `GET /api/knowledge-points/:id/history` - 获取历史版本
- `GET /api/knowledge-points/:id/relations` - 获取知识点关联
- `POST /api/knowledge-points/:id/relations` - 创建知识点关联
- `DELETE /api/knowledge-points/:id/relations/:relationId` - 删除知识点关联

### 主题管理

- `GET /api/themes` - 获取主题列表
- `GET /api/themes/:id` - 获取主题详情
- `GET /api/themes/:id/knowledge-points` - 获取主题下的知识点
- `POST /api/themes` - 创建主题（管理员/教研员）
- `PATCH /api/themes/:id` - 更新主题
- `DELETE /api/themes/:id` - 删除主题（管理员）

### 评论系统

- `GET /api/interactions` - 获取评论列表
- `GET /api/interactions/:id` - 获取评论详情
- `GET /api/interactions/:id/replies` - 获取评论回复
- `POST /api/interactions` - 创建评论
- `PATCH /api/interactions/:id` - 更新评论
- `DELETE /api/interactions/:id` - 删除评论

### 审核管理

- `GET /api/audit/pending` - 获取待审核列表（审核员）
- `GET /api/audit/logs` - 获取审核日志列表
- `GET /api/audit/logs/:id` - 获取审核日志详情
- `POST /api/audit/:kpId/approve` - 通过审核
- `POST /api/audit/:kpId/reject` - 驳回审核

## 数据库模型

### 核心表

- `users` - 用户表
- `knowledge_points` - 知识点表
- `knowledge_types` - 知识类型表
- `cognitive_levels` - 认知层级表
- `math_themes` - 主题表
- `kp_relations` - 知识点关联表
- `kp_theme_link` - 知识点-主题关联表
- `audit_logs` - 审核日志表
- `interactions` - 评论表
- `roles_permissions` - 角色权限表

### 层级结构表

- `subjects` - 学科表
- `education_levels` - 教育阶段表
- `grades` - 年级表
- `books` - 教材表
- `chapters` - 章节表
- `sections` - 节表
- `lessons` - 课时表

## 权限说明

### 角色定义

- **GUEST (访客)**: 只能查看已发布的知识点
- **STUDENT (师范生)**: 可以创建和编辑自己的知识点，提交审核
- **RESEARCHER (教研员)**: 可以创建知识点、创建主题
- **AUDITOR (审核员)**: 可以审核知识点，查看所有数据
- **ADMIN (管理员)**: 拥有所有权限，可以管理用户

### 知识点状态流转

```
DRAFT (草稿) 
  ↓ [提交审核]
PENDING (待审核)
  ↓ [审核通过]      ↓ [审核驳回]
PUBLISHED (已发布)  REJECTED (已驳回)
                      ↓ [修改后重新提交]
                    PENDING (待审核)
```

## 开发命令

```bash
# 开发模式（热重载）
pnpm dev

# 构建
pnpm build

# 启动生产服务器
pnpm start

# Prisma 相关
pnpm db:generate    # 生成 Prisma Client
pnpm db:push        # 推送数据库结构（开发）
pnpm db:migrate     # 创建迁移（生产）
pnpm db:studio      # 打开 Prisma Studio
pnpm db:seed        # 初始化种子数据
```

## 注意事项

1. **环境变量**: 确保在生产环境中设置强密码的 `JWT_SECRET`
2. **数据库**: 确保 MySQL 服务已启动并创建了对应的数据库
3. **权限**: 用户注册后默认未激活，需要管理员激活后才能登录
4. **CORS**: 根据前端地址配置 `FRONTEND_URL` 环境变量

## 默认账号

初始化种子数据后会创建以下测试账号：

- 管理员: `admin` / `admin123`
- 审核员: `auditor` / `auditor123`
- 师范生: `student` / `student123`

**⚠️ 生产环境请务必修改默认密码！**

