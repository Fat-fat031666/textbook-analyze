import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化数据库种子数据...');

  // 创建知识类型
  const knowledgeTypes = await Promise.all([
    prisma.knowledgeType.upsert({
      where: { name: '概念性知识' },
      update: {},
      create: { name: '概念性知识', description: '关于概念、定义、术语等的知识' },
    }),
    prisma.knowledgeType.upsert({
      where: { name: '原理规则' },
      update: {},
      create: { name: '原理规则', description: '关于原理、规则、定理等的知识' },
    }),
    prisma.knowledgeType.upsert({
      where: { name: '技能' },
      update: {},
      create: { name: '技能', description: '关于操作、方法、技巧等的知识' },
    }),
    prisma.knowledgeType.upsert({
      where: { name: '事实性知识' },
      update: {},
      create: { name: '事实性知识', description: '关于事实、数据、信息等的知识' },
    }),
  ]);

  console.log('✅ 知识类型创建完成');

  // 创建认知层级
  const cognitiveLevels = await Promise.all([
    prisma.cognitiveLevel.upsert({
      where: { name: '识记' },
      update: {},
      create: { name: '识记', description: '记忆、识别、回忆', level: 1 },
    }),
    prisma.cognitiveLevel.upsert({
      where: { name: '理解' },
      update: {},
      create: { name: '理解', description: '解释、说明、概括', level: 2 },
    }),
    prisma.cognitiveLevel.upsert({
      where: { name: '应用' },
      update: {},
      create: { name: '应用', description: '执行、实施、使用', level: 3 },
    }),
    prisma.cognitiveLevel.upsert({
      where: { name: '分析' },
      update: {},
      create: { name: '分析', description: '区分、组织、归因', level: 4 },
    }),
    prisma.cognitiveLevel.upsert({
      where: { name: '综合' },
      update: {},
      create: { name: '综合', description: '检查、判断、评论', level: 5 },
    }),
    prisma.cognitiveLevel.upsert({
      where: { name: '评价' },
      update: {},
      create: { name: '评价', description: '创造、设计、建构', level: 6 },
    }),
  ]);

  console.log('✅ 认知层级创建完成');

  // 创建学科
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: 'math' },
      update: {},
      create: { name: '数学', code: 'math' },
    }),
    prisma.subject.upsert({
      where: { code: 'chinese' },
      update: {},
      create: { name: '语文', code: 'chinese' },
    }),
    prisma.subject.upsert({
      where: { code: 'english' },
      update: {},
      create: { name: '英语', code: 'english' },
    }),
  ]);

  console.log('✅ 学科创建完成');

  // 创建主题（数学）
  const mathThemes = await Promise.all([
    prisma.mathTheme.upsert({
      where: { name: '数与代数' },
      update: {},
      create: {
        name: '数与代数',
        description: '包括数的认识、运算、代数式、方程等内容',
        subjectId: subjects[0].id,
      },
    }),
    prisma.mathTheme.upsert({
      where: { name: '空间与图形' },
      update: {},
      create: {
        name: '空间与图形',
        description: '包括图形的认识、测量、变换等内容',
        subjectId: subjects[0].id,
      },
    }),
    prisma.mathTheme.upsert({
      where: { name: '统计与概率' },
      update: {},
      create: {
        name: '统计与概率',
        description: '包括数据的收集、整理、分析和概率等内容',
        subjectId: subjects[0].id,
      },
    }),
  ]);

  console.log('✅ 主题创建完成');

  // 创建管理员用户
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      realName: '系统管理员',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 创建审核员用户
  const auditorPassword = await hashPassword('auditor123');
  const auditor = await prisma.user.upsert({
    where: { username: 'auditor' },
    update: {},
    create: {
      username: 'auditor',
      email: 'auditor@example.com',
      password: auditorPassword,
      realName: '审核员',
      role: 'AUDITOR',
      isActive: true,
    },
  });

  // 创建测试师范生用户
  const studentPassword = await hashPassword('student123');
  const student = await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      email: 'student@example.com',
      password: studentPassword,
      realName: '测试师范生',
      institution: 'XX师范大学',
      role: 'STUDENT',
      isActive: true,
    },
  });

  console.log('✅ 用户创建完成');
  console.log('📝 默认账号信息:');
  console.log('   管理员: admin / admin123');
  console.log('   审核员: auditor / auditor123');
  console.log('   师范生: student / student123');

  // 创建角色权限
  const rolePermissions = [
    { role: 'GUEST', permission: 'view_published_data' },
    { role: 'STUDENT', permission: 'create_data' },
    { role: 'STUDENT', permission: 'edit_own_data' },
    { role: 'STUDENT', permission: 'submit_for_review' },
    { role: 'RESEARCHER', permission: 'create_data' },
    { role: 'RESEARCHER', permission: 'edit_own_data' },
    { role: 'RESEARCHER', permission: 'submit_for_review' },
    { role: 'RESEARCHER', permission: 'create_theme' },
    { role: 'AUDITOR', permission: 'review_data' },
    { role: 'AUDITOR', permission: 'approve_data' },
    { role: 'AUDITOR', permission: 'reject_data' },
    { role: 'AUDITOR', permission: 'view_all_data' },
    { role: 'ADMIN', permission: 'all' },
  ];

  for (const rp of rolePermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permission: {
          role: rp.role as any,
          permission: rp.permission,
        },
      },
      update: {},
      create: {
        role: rp.role as any,
        permission: rp.permission,
        description: `${rp.role}的${rp.permission}权限`,
      },
    });
  }

  console.log('✅ 角色权限创建完成');
  console.log('🎉 数据库种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

