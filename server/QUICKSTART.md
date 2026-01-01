# 快速开始指南

## 1. 安装依赖

```bash
cd server
pnpm install
```

## 2. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/textbook_analyze?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
BCRYPT_ROUNDS=10
FRONTEND_URL="http://localhost:3000"
```

## 3. 创建数据库

在 MySQL 中执行：

```sql
CREATE DATABASE textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 4. 初始化数据库

```bash
# 生成 Prisma Client
pnpm db:generate

# 推送数据库结构
pnpm db:push

# 初始化种子数据（创建测试账号）
pnpm db:seed
```

## 5. 启动服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3001` 启动。

## 6. 测试 API

### 登录测试

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 获取知识点列表

```bash
curl http://localhost:3001/api/knowledge-points
```

## 默认账号

- 管理员: `admin@example.com` / `admin123`
- 审核员: `auditor@example.com` / `auditor123`
- 师范生: `student@example.com` / `student123`

## 常见问题

### 1. 数据库连接失败

- 检查 MySQL 服务是否运行
- 检查 `.env` 中的 `DATABASE_URL` 配置是否正确
- 检查数据库用户权限

### 2. Prisma 错误

- 确保已运行 `pnpm db:generate`
- 确保数据库已创建
- 尝试删除 `node_modules/.prisma` 后重新生成

### 3. 端口被占用

- 修改 `.env` 中的 `PORT` 配置
- 或关闭占用 3001 端口的其他程序

