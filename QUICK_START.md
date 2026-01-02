# 🚀 快速启动指南

## 一键检查项目状态

```bash
./check-project.sh
```

这个脚本会检查所有必要的配置和依赖。

## 快速启动步骤

### 1️⃣ 检查环境

```bash
# 运行检查脚本
./check-project.sh
```

### 2️⃣ 配置后端

```bash
cd server

# 创建 .env 文件（如果不存在）
if [ ! -f .env ]; then
  cat > .env << 'EOF'
DATABASE_URL="mysql://root:your_password@localhost:3306/textbook_analyze?schema=public"
JWT_SECRET="dev-secret-key-$(date +%s)"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
BCRYPT_ROUNDS=10
FRONTEND_URL="http://localhost:3000"
EOF
  echo "⚠️  请编辑 .env 文件，修改数据库密码"
fi
```

### 3️⃣ 初始化数据库

```bash
# 在 server 目录下
pnpm install          # 或 npm install
pnpm db:generate      # 生成 Prisma Client
pnpm db:push          # 推送数据库结构
pnpm db:seed          # 初始化测试数据
```

### 4️⃣ 启动服务

**终端 1 - 后端：**
```bash
cd server
pnpm dev
```

**终端 2 - 前端：**
```bash
# 在项目根目录
pnpm install  # 如果还没安装
pnpm dev
```

### 5️⃣ 访问应用

- 前端: http://localhost:3000
- 后端: http://localhost:3001
- 健康检查: http://localhost:3001/health

### 6️⃣ 测试登录

使用测试账号：
- 邮箱: `admin@example.com`
- 密码: `admin123`

## ⚡ 最快启动方式

如果您已经配置过环境：

```bash
# 终端 1
cd server && pnpm dev

# 终端 2
pnpm dev
```

## 🔧 常见问题

### 数据库连接失败？

1. 检查 MySQL 是否运行：`mysql.server start`
2. 检查 `.env` 中的密码是否正确
3. 确认数据库已创建：`CREATE DATABASE textbook_analyze;`

### 端口被占用？

修改 `server/.env` 中的 `PORT` 或关闭占用端口的程序。

### pnpm 未找到？

```bash
npm install -g pnpm
# 或使用 npm 替代
```

## 📚 详细文档

- `START_PROJECT.md` - 完整启动指南
- `TROUBLESHOOTING.md` - 问题排查
- `server/README.md` - 后端文档

