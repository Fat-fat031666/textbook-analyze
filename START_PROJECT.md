# 项目启动完整指南

## 🚀 快速启动（推荐）

### 方式一：使用启动脚本

```bash
# 给脚本添加执行权限
chmod +x start-preview.sh

# 运行脚本
./start-preview.sh
```

### 方式二：手动启动

按照以下步骤依次执行。

## 📋 启动前检查清单

### ✅ 1. 环境要求

- [ ] Node.js 已安装（推荐 v18+）
- [ ] pnpm 已安装（或使用 npm/yarn）
- [ ] MySQL 已安装并运行
- [ ] 端口 3000 和 3001 未被占用

### ✅ 2. 数据库准备

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出
exit;
```

### ✅ 3. 后端配置

```bash
# 进入后端目录
cd server

# 安装依赖
pnpm install
# 或
npm install

# 创建 .env 文件
cat > .env << 'EOF'
DATABASE_URL="mysql://root:your_password@localhost:3306/textbook_analyze?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
BCRYPT_ROUNDS=10
FRONTEND_URL="http://localhost:3000"
EOF

# ⚠️ 重要：修改 .env 中的数据库密码
# 编辑 .env 文件，将 your_password 替换为您的 MySQL 密码
```

### ✅ 4. 初始化数据库

```bash
# 在 server 目录下

# 生成 Prisma Client
pnpm db:generate
# 或
npm run db:generate

# 推送数据库结构
pnpm db:push
# 或
npm run db:push

# 初始化种子数据（创建测试账号）
pnpm db:seed
# 或
npm run db:seed
```

### ✅ 5. 启动后端服务

```bash
# 在 server 目录下
pnpm dev
# 或
npm run dev
```

**验证后端启动成功：**
- 看到 "🚀 服务器运行在 http://localhost:3001"
- 访问 http://localhost:3001/health 应该返回 `{"status":"ok",...}`

### ✅ 6. 启动前端服务

**打开新的终端窗口：**

```bash
# 在项目根目录
cd /Users/type/Desktop/textbook_analyze/textbook

# 安装依赖（如果还没安装）
pnpm install
# 或
npm install

# 启动开发服务器
pnpm dev
# 或
npm run dev
```

**验证前端启动成功：**
- 看到 "Local: http://localhost:3000"
- 浏览器访问 http://localhost:3000 可以看到页面

## 🧪 测试项目

### 1. 测试后端 API

```bash
# 健康检查
curl http://localhost:3001/health

# 测试登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 2. 测试前端登录

1. 访问 http://localhost:3000
2. 点击"登录"
3. 使用测试账号：
   - 邮箱: `admin@example.com`
   - 密码: `admin123`

## 🔧 常见问题解决

### 问题 1: pnpm 未找到

**解决方法：**
```bash
# 安装 pnpm
npm install -g pnpm

# 或使用 npm 替代
npm install
npm run dev
```

### 问题 2: 数据库连接失败

**检查：**
1. MySQL 服务是否运行
   ```bash
   # macOS
   brew services list | grep mysql
   mysql.server start
   ```

2. `.env` 中的 `DATABASE_URL` 是否正确
3. 数据库是否已创建

### 问题 3: Prisma 错误

**解决方法：**
```bash
cd server
rm -rf node_modules/.prisma
pnpm db:generate
```

### 问题 4: 端口被占用

**解决方法：**
- 修改 `server/.env` 中的 `PORT=3001` 为其他端口
- 修改前端 `vite.config.ts` 中的端口配置

### 问题 5: CORS 错误

**检查：**
- `server/.env` 中的 `FRONTEND_URL` 是否正确
- 确保后端服务正在运行

### 问题 6: 前端无法连接后端

**检查：**
1. 后端是否在运行（访问 http://localhost:3001/health）
2. 浏览器控制台是否有错误
3. Network 标签中请求是否发送成功

## 📝 测试账号

初始化种子数据后会创建以下账号：

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin@example.com | admin123 | 拥有所有权限 |
| 审核员 | auditor@example.com | auditor123 | 可以审核知识点 |
| 师范生 | student@example.com | student123 | 可以创建和提交知识点 |

## 🎯 功能测试清单

- [ ] 用户注册
- [ ] 用户登录
- [ ] 创建知识点（需要登录）
- [ ] 提交审核（需要登录）
- [ ] 查看知识点列表（访客可查看已发布的）
- [ ] 审核知识点（需要审核员权限）

## 📚 相关文档

- `PREVIEW.md` - 预览指南
- `TROUBLESHOOTING.md` - 问题排查
- `FRONTEND_BACKEND_INTEGRATION.md` - 前后端集成说明
- `server/README.md` - 后端文档
- `server/QUICKSTART.md` - 后端快速开始

## ⚠️ 重要提示

1. **生产环境**：请修改所有默认密码和密钥
2. **数据库备份**：定期备份数据库
3. **环境变量**：不要将 `.env` 文件提交到 Git
4. **安全**：生产环境使用强密码和 HTTPS

## 🆘 获取帮助

如果遇到问题：
1. 查看 `TROUBLESHOOTING.md`
2. 检查浏览器控制台错误
3. 检查后端终端日志
4. 确认所有依赖已安装
5. 确认数据库已正确配置

