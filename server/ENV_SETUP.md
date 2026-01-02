# 环境变量配置指南

## 快速设置

### 1. 创建 .env 文件

在 `server` 目录下创建 `.env` 文件：

```bash
cd server
cp .env.example .env
```

### 2. 编辑 .env 文件

使用文本编辑器打开 `.env` 文件，修改以下关键配置：

#### 数据库配置

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/textbook_analyze?schema=public"
```

**配置说明：**

- **用户名**: 您的 MySQL 用户名（通常是 `root`）
- **密码**: 您的 MySQL 密码
- **localhost**: 数据库主机地址（本地用 `localhost`，远程用 IP 地址）
- **3306**: MySQL 端口（默认 3306）
- **textbook_analyze**: 数据库名称

**常见配置示例：**

```env
# 情况1: 有密码的 root 用户
DATABASE_URL="mysql://root:mypassword@localhost:3306/textbook_analyze?schema=public"

# 情况2: 无密码的 root 用户
DATABASE_URL="mysql://root@localhost:3306/textbook_analyze?schema=public"

# 情况3: 自定义用户
DATABASE_URL="mysql://dbuser:dbpass@localhost:3306/textbook_analyze?schema=public"

# 情况4: 远程数据库
DATABASE_URL="mysql://user:pass@192.168.1.100:3306/textbook_analyze?schema=public"
```

#### JWT 密钥配置

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

**生成强密钥（推荐）：**

```bash
# 使用 openssl 生成随机密钥
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

将生成的字符串复制到 `JWT_SECRET`。

#### 其他配置

其他配置项通常使用默认值即可：

```env
PORT=3001                    # 后端服务端口
NODE_ENV=development          # 开发环境
BCRYPT_ROUNDS=10             # 密码加密轮数
FRONTEND_URL="http://localhost:3000"  # 前端地址
JWT_EXPIRES_IN="7d"          # Token 有效期 7 天
```

## 完整配置示例

### 开发环境配置

```env
# 数据库
DATABASE_URL="mysql://root:password@localhost:3306/textbook_analyze?schema=public"

# JWT
JWT_SECRET="dev-secret-key-12345678901234567890"
JWT_EXPIRES_IN="7d"

# 服务器
PORT=3001
NODE_ENV=development

# 密码加密
BCRYPT_ROUNDS=10

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 生产环境配置

```env
# 数据库（使用强密码）
DATABASE_URL="mysql://prod_user:strong_password_here@db.example.com:3306/textbook_analyze?schema=public"

# JWT（使用强随机密钥）
JWT_SECRET="生成的强随机密钥，至少32字符"
JWT_EXPIRES_IN="24h"

# 服务器
PORT=3001
NODE_ENV=production

# 密码加密（生产环境建议更高）
BCRYPT_ROUNDS=12

# CORS
FRONTEND_URL="https://yourdomain.com"
```

## 验证配置

配置完成后，可以验证配置是否正确：

```bash
# 1. 检查 .env 文件是否存在
ls -la server/.env

# 2. 测试数据库连接（需要先安装依赖）
cd server
pnpm install
pnpm db:generate
pnpm db:push
```

## 常见问题

### Q1: 数据库连接失败

**错误信息：**
```
Error: P1001: Can't reach database server
```

**解决方法：**
1. 检查 MySQL 服务是否运行：
   ```bash
   # macOS
   brew services list | grep mysql
   
   # 或启动 MySQL
   mysql.server start
   ```

2. 检查数据库是否存在：
   ```sql
   CREATE DATABASE IF NOT EXISTS textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. 检查用户名和密码是否正确

4. 检查端口是否正确（默认 3306）

### Q2: 权限错误

**错误信息：**
```
Error: Access denied for user
```

**解决方法：**
1. 检查 MySQL 用户权限
2. 确保用户有创建数据库和表的权限
3. 尝试使用 root 用户

### Q3: 特殊字符问题

如果密码包含特殊字符，需要进行 URL 编码：

```env
# 原始密码: my@pass#word
# URL 编码后: my%40pass%23word
DATABASE_URL="mysql://root:my%40pass%23word@localhost:3306/textbook_analyze?schema=public"
```

常见特殊字符编码：
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

### Q4: 找不到 .env 文件

确保 `.env` 文件在 `server` 目录下，而不是项目根目录：

```
textbook/
├── server/
│   ├── .env          ← 应该在这里
│   ├── src/
│   └── ...
└── ...
```

## 安全注意事项

⚠️ **重要安全提示：**

1. **永远不要提交 .env 文件到 Git**
   - `.env` 文件已在 `.gitignore` 中
   - 只提交 `.env.example` 作为模板

2. **生产环境使用强密钥**
   - `JWT_SECRET` 至少 32 字符
   - 使用随机生成的字符串

3. **保护数据库密码**
   - 不要在不安全的地方存储密码
   - 使用环境变量或密钥管理服务

4. **定期更换密钥**
   - 定期更换 `JWT_SECRET`
   - 更换后所有用户需要重新登录

## 下一步

配置完成后，继续：

1. 初始化数据库：`pnpm db:push`
2. 初始化种子数据：`pnpm db:seed`
3. 启动服务器：`pnpm dev`

