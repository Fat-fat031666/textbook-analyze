#!/bin/bash

# .env 文件设置脚本

echo "🔧 环境变量配置助手"
echo "===================="
echo ""

# 检查是否已存在 .env 文件
if [ -f ".env" ]; then
    echo "⚠️  检测到已存在 .env 文件"
    read -p "是否要覆盖现有配置? (y/n): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "已取消操作"
        exit 0
    fi
fi

echo ""
echo "请按提示输入配置信息（直接回车使用默认值）"
echo ""

# 数据库配置
echo "📊 数据库配置"
echo "------------"
read -p "MySQL 用户名 [root]: " db_user
db_user=${db_user:-root}

read -p "MySQL 密码: " db_pass
if [ -z "$db_pass" ]; then
    db_url="mysql://${db_user}@localhost:3306/textbook_analyze?schema=public"
else
    # URL 编码特殊字符（简单处理）
    db_pass_encoded=$(echo "$db_pass" | sed 's/@/%40/g; s/#/%23/g; s/\$/%24/g; s/&/%26/g')
    db_url="mysql://${db_user}:${db_pass_encoded}@localhost:3306/textbook_analyze?schema=public"
fi

read -p "数据库主机 [localhost]: " db_host
db_host=${db_host:-localhost}

read -p "数据库端口 [3306]: " db_port
db_port=${db_port:-3306}

# 重新构建 URL（如果需要）
if [ -z "$db_pass" ]; then
    db_url="mysql://${db_user}@${db_host}:${db_port}/textbook_analyze?schema=public"
else
    db_url="mysql://${db_user}:${db_pass_encoded}@${db_host}:${db_port}/textbook_analyze?schema=public"
fi

# JWT 配置
echo ""
echo "🔐 JWT 配置"
echo "------------"
read -p "JWT 密钥 (留空将自动生成): " jwt_secret
if [ -z "$jwt_secret" ]; then
    # 尝试生成随机密钥
    if command -v openssl &> /dev/null; then
        jwt_secret=$(openssl rand -base64 32 | tr -d '\n')
        echo "✅ 已自动生成 JWT 密钥"
    else
        jwt_secret="dev-secret-key-$(date +%s | sha256sum | head -c 32)"
        echo "✅ 已生成简单密钥（建议生产环境使用更强密钥）"
    fi
fi

read -p "Token 有效期 [7d]: " jwt_expires
jwt_expires=${jwt_expires:-7d}

# 服务器配置
echo ""
echo "🖥️  服务器配置"
echo "------------"
read -p "服务器端口 [3001]: " port
port=${port:-3001}

read -p "运行环境 [development]: " node_env
node_env=${node_env:-development}

read -p "前端地址 [http://localhost:3000]: " frontend_url
frontend_url=${frontend_url:-http://localhost:3000}

# 密码加密配置
read -p "密码加密轮数 [10]: " bcrypt_rounds
bcrypt_rounds=${bcrypt_rounds:-10}

# 生成 .env 文件
echo ""
echo "📝 正在生成 .env 文件..."

cat > .env << EOF
# ============================================
# 教材分析系统 - 环境变量配置
# 生成时间: $(date)
# ============================================

# 数据库配置
DATABASE_URL="${db_url}"

# JWT 认证配置
JWT_SECRET="${jwt_secret}"
JWT_EXPIRES_IN="${jwt_expires}"

# 服务器配置
PORT=${port}
NODE_ENV=${node_env}

# 密码加密配置
BCRYPT_ROUNDS=${bcrypt_rounds}

# CORS 跨域配置
FRONTEND_URL="${frontend_url}"
EOF

echo "✅ .env 文件已创建！"
echo ""
echo "📋 配置摘要:"
echo "  数据库: ${db_user}@${db_host}:${db_port}/textbook_analyze"
echo "  服务器端口: ${port}"
echo "  运行环境: ${node_env}"
echo ""
echo "⚠️  请确保:"
echo "  1. MySQL 服务已启动"
echo "  2. 数据库 'textbook_analyze' 已创建"
echo "  3. 数据库用户有相应权限"
echo ""
echo "下一步:"
echo "  pnpm db:generate  # 生成 Prisma Client"
echo "  pnpm db:push      # 推送数据库结构"
echo "  pnpm db:seed      # 初始化种子数据（可选）"
echo "  pnpm dev          # 启动开发服务器"

