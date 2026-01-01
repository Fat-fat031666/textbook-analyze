#!/bin/bash

# 项目预览启动脚本

echo "🚀 教材分析系统 - 预览启动脚本"
echo "================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 选择预览模式
echo "请选择预览模式:"
echo "1) 仅前端预览（使用模拟数据，无需数据库）"
echo "2) 完整预览（前端 + 后端，需要数据库）"
echo ""
read -p "请输入选项 (1 或 2): " mode

if [ "$mode" == "1" ]; then
    echo ""
    echo "📦 检查前端依赖..."
    if [ ! -d "node_modules" ]; then
        echo "安装前端依赖..."
        pnpm install
    fi
    
    echo ""
    echo "🎨 启动前端服务..."
    echo "前端将在 http://localhost:3000 启动"
    echo "按 Ctrl+C 停止服务"
    echo ""
    pnpm dev

elif [ "$mode" == "2" ]; then
    echo ""
    echo "📋 完整预览模式检查清单:"
    echo "  ✓ MySQL 数据库已安装并运行"
    echo "  ✓ 已创建数据库: textbook_analyze"
    echo "  ✓ 已配置 server/.env 文件"
    echo ""
    read -p "是否已完成以上配置? (y/n): " confirmed
    
    if [ "$confirmed" != "y" ] && [ "$confirmed" != "Y" ]; then
        echo ""
        echo "请先完成配置，然后重新运行此脚本"
        echo "详细说明请查看 PREVIEW.md"
        exit 1
    fi
    
    echo ""
    echo "📦 检查依赖..."
    
    # 检查前端依赖
    if [ ! -d "node_modules" ]; then
        echo "安装前端依赖..."
        pnpm install
    fi
    
    # 检查后端依赖
    if [ ! -d "server/node_modules" ]; then
        echo "安装后端依赖..."
        cd server
        pnpm install
        cd ..
    fi
    
    # 检查 Prisma Client
    if [ ! -d "server/node_modules/.prisma" ]; then
        echo "生成 Prisma Client..."
        cd server
        pnpm db:generate
        cd ..
    fi
    
    echo ""
    echo "🚀 启动服务..."
    echo ""
    echo "后端: http://localhost:3001"
    echo "前端: http://localhost:3000"
    echo ""
    echo "按 Ctrl+C 停止所有服务"
    echo ""
    
    # 启动后端（后台）
    cd server
    pnpm dev &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    sleep 3
    
    # 启动前端
    pnpm dev &
    FRONTEND_PID=$!
    
    # 等待用户中断
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    wait

else
    echo "❌ 无效选项"
    exit 1
fi

