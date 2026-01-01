# 项目预览指南

## 快速预览（仅前端）

如果您想快速预览前端界面，可以只启动前端服务（使用模拟数据）：

### 1. 安装前端依赖

```bash
pnpm install
```

### 2. 启动前端服务

```bash
pnpm dev
```

访问 http://localhost:3000 即可预览前端界面。

**注意**：此时前端使用的是本地模拟数据，不会连接后端API。

---

## 完整预览（前端 + 后端）

要预览完整功能，需要同时启动前端和后端服务：

### 前置要求

1. **MySQL 数据库已安装并运行**
2. **已创建数据库**

```sql
CREATE DATABASE textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 步骤 1: 配置后端

1. 进入后端目录：

```bash
cd server
```

2. 安装后端依赖：

```bash
pnpm install
```

3. 创建 `.env` 文件：

```bash
# 复制并编辑环境变量
cat > .env << 'EOF'
DATABASE_URL="mysql://root:your_password@localhost:3306/textbook_analyze?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
BCRYPT_ROUNDS=10
FRONTEND_URL="http://localhost:3000"
EOF
```

**重要**：请将 `your_password` 替换为您的 MySQL 密码。

4. 初始化数据库：

```bash
# 生成 Prisma Client
pnpm db:generate

# 推送数据库结构
pnpm db:push

# 初始化种子数据（创建测试账号）
pnpm db:seed
```

### 步骤 2: 启动后端服务

```bash
# 在 server 目录下
pnpm dev
```

后端将在 http://localhost:3001 启动。

### 步骤 3: 启动前端服务

打开新的终端窗口：

```bash
# 在项目根目录
cd /Users/type/Desktop/textbook_analyze/textbook
pnpm install  # 如果还没安装
pnpm dev
```

前端将在 http://localhost:3000 启动。

### 步骤 4: 访问应用

1. 打开浏览器访问 http://localhost:3000
2. 使用测试账号登录：
   - **管理员**: `admin@example.com` / `admin123`
   - **审核员**: `auditor@example.com` / `auditor123`
   - **师范生**: `student@example.com` / `student123`

---

## 项目功能预览

### 1. 用户认证
- 注册新用户（需要管理员激活）
- 登录系统
- 访客模式浏览

### 2. 知识点管理
- 创建知识点（草稿状态）
- 编辑知识点
- 提交审核
- 查看知识点详情

### 3. 审核工作流
- 审核员查看待审核列表
- 审核通过/驳回
- 查看审核历史

### 4. 知识关联
- 创建知识点之间的关联
- 查看知识图谱

### 5. 主题体系
- 浏览主题
- 按主题筛选知识点

### 6. 评论系统
- 发表评论
- 回复评论

---

## 常见问题

### Q: 数据库连接失败？

**A**: 检查以下几点：
1. MySQL 服务是否运行：`mysql.server start` (macOS)
2. `.env` 中的 `DATABASE_URL` 是否正确
3. 数据库用户是否有权限

### Q: 端口被占用？

**A**: 
- 后端默认端口：3001，可在 `.env` 中修改 `PORT`
- 前端默认端口：3000，可在 `vite.config.ts` 中修改

### Q: Prisma 错误？

**A**: 
```bash
# 重新生成 Prisma Client
cd server
pnpm db:generate
```

### Q: 前端无法连接后端？

**A**: 
1. 确保后端服务正在运行（http://localhost:3001）
2. 检查后端 CORS 配置
3. 检查前端 API 配置

---

## API 测试

后端启动后，可以测试健康检查：

```bash
curl http://localhost:3001/health
```

应该返回：
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## 项目结构预览

```
textbook/
├── src/                    # 前端源代码
│   ├── pages/             # 页面组件
│   ├── components/        # 通用组件
│   └── ...
├── server/                 # 后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── routes/        # 路由
│   │   └── ...
│   └── prisma/            # 数据库模型
└── ...
```

---

## 下一步

预览完成后，您可以：
1. 修改前端代码，连接真实的后端 API
2. 添加更多功能
3. 自定义样式和布局
4. 部署到生产环境

