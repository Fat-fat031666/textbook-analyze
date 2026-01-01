-- 教材分析系统数据库初始化脚本
-- 创建数据库（如果不存在）

CREATE DATABASE IF NOT EXISTS textbook_analyze CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE textbook_analyze;

-- 注意：表结构将通过 Prisma 自动创建
-- 此脚本仅用于创建数据库

-- 如果需要手动创建数据库，请运行：
-- 1. pnpm db:generate  (生成 Prisma Client)
-- 2. pnpm db:push      (推送数据库结构)
-- 3. pnpm db:seed      (初始化种子数据)

