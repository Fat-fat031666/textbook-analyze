# 登录问题排查指南

## 问题：测试账号登录失败，显示密码错误

### 可能的原因和解决方法

#### 1. 前端未连接后端 API

**症状**：前端仍在使用模拟数据，没有调用真实的后端API

**解决方法**：
- ✅ 已修复：已更新 `src/pages/LoginPage.tsx` 和创建 `src/lib/api.ts`
- 确保后端服务正在运行（`http://localhost:3001`）
- 检查浏览器控制台是否有网络错误

#### 2. 数据库种子数据未初始化

**症状**：测试账号不存在于数据库中

**解决方法**：
```bash
cd server
pnpm db:seed
```

这会创建以下测试账号：
- `admin@example.com` / `admin123`
- `auditor@example.com` / `auditor123`
- `student@example.com` / `student123`

#### 3. 后端服务未启动

**症状**：前端无法连接到后端API

**解决方法**：
```bash
cd server
pnpm dev
```

确保后端在 `http://localhost:3001` 运行。

#### 4. CORS 跨域问题

**症状**：浏览器控制台显示 CORS 错误

**解决方法**：
- 检查 `server/.env` 中的 `FRONTEND_URL` 配置
- 确保值为 `http://localhost:3000`

#### 5. 数据库连接问题

**症状**：后端启动失败或数据库错误

**解决方法**：
1. 检查 MySQL 服务是否运行
2. 检查 `.env` 中的 `DATABASE_URL` 配置
3. 确保数据库 `textbook_analyze` 已创建

#### 6. 账号未激活

**症状**：登录时提示"账号未激活"

**解决方法**：
- 种子数据中的测试账号默认已激活
- 如果是新注册的账号，需要管理员激活

## 完整检查清单

### 步骤 1: 检查后端服务

```bash
# 检查后端是否运行
curl http://localhost:3001/health

# 应该返回: {"status":"ok","timestamp":"..."}
```

### 步骤 2: 检查数据库

```bash
cd server

# 检查数据库连接
pnpm db:push

# 检查是否有测试账号
# 可以使用 Prisma Studio 查看
pnpm db:studio
```

### 步骤 3: 测试 API 登录

```bash
# 使用 curl 测试登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 应该返回包含 token 的 JSON
```

### 步骤 4: 检查前端配置

1. 打开浏览器开发者工具（F12）
2. 查看 Network 标签
3. 尝试登录，查看是否有请求发送到 `http://localhost:3001/api/auth/login`
4. 查看请求和响应的详细信息

### 步骤 5: 重新初始化（如果以上都不行）

```bash
cd server

# 1. 删除数据库（谨慎操作！）
# mysql -u root -p
# DROP DATABASE textbook_analyze;
# CREATE DATABASE textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. 重新初始化
pnpm db:push
pnpm db:seed

# 3. 重启后端
pnpm dev
```

## 常见错误信息

### "邮箱/手机号或密码错误"
- 检查邮箱和密码是否正确
- 检查账号是否存在于数据库
- 检查密码是否正确加密

### "账号未激活，请联系管理员"
- 使用种子数据创建的账号默认已激活
- 如果是新注册的账号，需要管理员在后台激活

### "网络错误" 或 "Failed to fetch"
- 检查后端服务是否运行
- 检查 `API_BASE_URL` 配置
- 检查防火墙设置

### CORS 错误
- 检查 `server/.env` 中的 `FRONTEND_URL`
- 确保后端允许来自前端的请求

## 调试技巧

### 1. 查看后端日志

后端启动后，所有请求和错误都会在终端显示。

### 2. 使用 Prisma Studio 查看数据库

```bash
cd server
pnpm db:studio
```

这会打开一个网页界面，可以查看和编辑数据库中的数据。

### 3. 检查 localStorage

在浏览器控制台运行：
```javascript
// 查看存储的 token
localStorage.getItem('token')

// 查看存储的用户信息
localStorage.getItem('user')
```

### 4. 测试 API 端点

使用 Postman 或 curl 直接测试后端 API，确认后端功能正常。

## 联系支持

如果以上方法都无法解决问题，请提供：
1. 后端日志输出
2. 浏览器控制台错误信息
3. Network 标签中的请求详情
4. 数据库状态（是否已初始化）

