#!/bin/bash

# 项目检查脚本
# 检查项目是否可以正常运行

echo "🔍 项目检查工具"
echo "================"
echo ""

ERRORS=0
WARNINGS=0

# 检查 Node.js
echo "1. 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js: $NODE_VERSION"
else
    echo "   ❌ Node.js 未安装"
    ERRORS=$((ERRORS + 1))
fi

# 检查包管理器
echo ""
echo "2. 检查包管理器..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "   ✅ pnpm: $PNPM_VERSION"
    PACKAGE_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm: $NPM_VERSION"
    PACKAGE_MANAGER="npm"
    WARNINGS=$((WARNINGS + 1))
    echo "   ⚠️  建议安装 pnpm: npm install -g pnpm"
else
    echo "   ❌ 未找到包管理器（npm 或 pnpm）"
    ERRORS=$((ERRORS + 1))
fi

# 检查 MySQL
echo ""
echo "3. 检查 MySQL..."
if command -v mysql &> /dev/null; then
    echo "   ✅ MySQL 已安装"
    if mysql.server status &> /dev/null || pgrep -x mysqld &> /dev/null; then
        echo "   ✅ MySQL 服务正在运行"
    else
        echo "   ⚠️  MySQL 服务未运行（可能需要启动）"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ⚠️  MySQL 未安装或不在 PATH 中"
    WARNINGS=$((WARNINGS + 1))
fi

# 检查前端依赖
echo ""
echo "4. 检查前端依赖..."
if [ -d "node_modules" ]; then
    echo "   ✅ 前端依赖已安装"
else
    echo "   ⚠️  前端依赖未安装"
    echo "      运行: $PACKAGE_MANAGER install"
    WARNINGS=$((WARNINGS + 1))
fi

# 检查后端依赖
echo ""
echo "5. 检查后端依赖..."
if [ -d "server/node_modules" ]; then
    echo "   ✅ 后端依赖已安装"
else
    echo "   ⚠️  后端依赖未安装"
    echo "      运行: cd server && $PACKAGE_MANAGER install"
    WARNINGS=$((WARNINGS + 1))
fi

# 检查 Prisma Client
echo ""
echo "6. 检查 Prisma Client..."
if [ -d "server/node_modules/.prisma" ]; then
    echo "   ✅ Prisma Client 已生成"
else
    echo "   ⚠️  Prisma Client 未生成"
    echo "      运行: cd server && $PACKAGE_MANAGER db:generate"
    WARNINGS=$((WARNINGS + 1))
fi

# 检查环境变量
echo ""
echo "7. 检查环境变量..."
if [ -f "server/.env" ]; then
    echo "   ✅ 后端 .env 文件存在"
    
    # 检查关键配置
    if grep -q "DATABASE_URL=" server/.env; then
        DB_URL=$(grep "DATABASE_URL=" server/.env | cut -d'=' -f2- | tr -d '"')
        if [[ "$DB_URL" == *"your_password"* ]] || [[ "$DB_URL" == *"password"* ]]; then
            echo "   ⚠️  数据库密码可能未配置（包含默认值）"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "   ⚠️  DATABASE_URL 未配置"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "JWT_SECRET=" server/.env; then
        JWT_SECRET=$(grep "JWT_SECRET=" server/.env | cut -d'=' -f2- | tr -d '"')
        if [[ "$JWT_SECRET" == *"change-this"* ]] || [[ "$JWT_SECRET" == *"dev-secret"* ]]; then
            echo "   ⚠️  JWT_SECRET 使用默认值（生产环境请修改）"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo "   ❌ 后端 .env 文件不存在"
    echo "      运行: cd server && cp .env.example .env"
    ERRORS=$((ERRORS + 1))
fi

# 检查端口占用
echo ""
echo "8. 检查端口占用..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  端口 3001 已被占用（后端端口）"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ 端口 3001 可用"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  端口 3000 已被占用（前端端口）"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ 端口 3000 可用"
fi

# 检查关键文件
echo ""
echo "9. 检查关键文件..."
FILES=(
    "src/lib/api.ts"
    "src/pages/LoginPage.tsx"
    "src/pages/RegisterPage.tsx"
    "server/src/index.ts"
    "server/prisma/schema.prisma"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file 不存在"
        ERRORS=$((ERRORS + 1))
    fi
done

# 总结
echo ""
echo "================"
echo "检查完成"
echo "================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ 所有检查通过！项目可以正常运行。"
    echo ""
    echo "下一步："
    echo "  1. 启动后端: cd server && $PACKAGE_MANAGER dev"
    echo "  2. 启动前端: $PACKAGE_MANAGER dev"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  有 $WARNINGS 个警告，但可以尝试运行"
    echo ""
    echo "建议先解决警告，然后："
    echo "  1. 启动后端: cd server && $PACKAGE_MANAGER dev"
    echo "  2. 启动前端: $PACKAGE_MANAGER dev"
    exit 0
else
    echo "❌ 发现 $ERRORS 个错误和 $WARNINGS 个警告"
    echo ""
    echo "请先解决错误，然后重新运行此脚本"
    exit 1
fi

