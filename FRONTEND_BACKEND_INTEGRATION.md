# 前端后端集成状态

## ✅ 已完成的集成

### 1. LoginPage (登录页面)
- ✅ 已连接到后端 `/api/auth/login`
- ✅ 使用真实 API 进行认证
- ✅ 保存 token 和用户信息

### 2. RegisterPage (注册页面)
- ✅ 已连接到后端 `/api/auth/register`
- ✅ 使用真实 API 进行注册
- ✅ 角色映射正确

## 🔄 需要更新的页面

### 3. DashboardPage (仪表盘页面)
**当前状态**: 使用模拟数据
**需要更新**:
- 获取用户的知识点统计数据（按状态分组）
- 获取待审核列表（如果是审核员）
- 获取评论动态
- 获取系统通知

**API 端点**:
- `GET /api/knowledge-points?creatorId={userId}&status={status}` - 获取用户的知识点
- `GET /api/audit/pending` - 获取待审核列表（审核员）
- `GET /api/interactions` - 获取评论

### 4. DataEntryPage (数据录入页面)
**当前状态**: 使用模拟数据保存
**需要更新**:
- 创建知识点时调用 `POST /api/knowledge-points`
- 保存草稿时调用 `PATCH /api/knowledge-points/{id}`
- 提交审核时调用 `POST /api/knowledge-points/{id}/submit`
- 需要获取知识类型、认知层级等选项数据

**API 端点**:
- `POST /api/knowledge-points` - 创建知识点
- `PATCH /api/knowledge-points/{id}` - 更新知识点
- `POST /api/knowledge-points/{id}/submit` - 提交审核

### 5. MainPage (主页面)
**当前状态**: 使用本地 `textbookData.ts` 数据
**需要更新**:
- 从后端获取知识点列表
- 支持按类型、状态筛选
- 支持分页加载

**API 端点**:
- `GET /api/knowledge-points` - 获取知识点列表（支持筛选和分页）

### 6. ContentDetailPage (内容详情页面)
**当前状态**: 使用模拟数据
**需要更新**:
- 获取知识点详情 `GET /api/knowledge-points/{id}`
- 获取评论列表 `GET /api/interactions?targetType=KNOWLEDGE_POINT&targetId={id}`
- 创建评论 `POST /api/interactions`
- 更新/删除评论

**API 端点**:
- `GET /api/knowledge-points/{id}` - 获取知识点详情
- `GET /api/interactions` - 获取评论列表
- `POST /api/interactions` - 创建评论
- `PATCH /api/interactions/{id}` - 更新评论
- `DELETE /api/interactions/{id}` - 删除评论

## 📋 API 工具已准备

所有需要的 API 方法已在 `src/lib/api.ts` 中定义：

- `authAPI` - 认证相关
- `knowledgePointAPI` - 知识点相关
- `auditAPI` - 审核相关
- `interactionAPI` - 评论相关
- `themeAPI` - 主题相关
- `userAPI` - 用户相关

## 🔧 更新步骤

### 更新 DashboardPage

1. 导入 API:
```typescript
import { knowledgePointAPI, auditAPI, interactionAPI } from '@/lib/api';
```

2. 获取用户信息:
```typescript
const user = JSON.parse(localStorage.getItem('user') || '{}');
```

3. 获取统计数据:
```typescript
useEffect(() => {
  const fetchStats = async () => {
    if (user.id) {
      const [draft, pending, published, rejected] = await Promise.all([
        knowledgePointAPI.getList({ creatorId: user.id, status: 'DRAFT' }),
        knowledgePointAPI.getList({ creatorId: user.id, status: 'PENDING' }),
        knowledgePointAPI.getList({ creatorId: user.id, status: 'PUBLISHED' }),
        knowledgePointAPI.getList({ creatorId: user.id, status: 'REJECTED' }),
      ]);
      // 更新状态
    }
  };
  fetchStats();
}, [user.id]);
```

### 更新 DataEntryPage

1. 导入 API:
```typescript
import { knowledgePointAPI } from '@/lib/api';
```

2. 创建知识点:
```typescript
const handleSaveDraft = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const result = await knowledgePointAPI.create({
      content: formData.content,
      typeId: getTypeId(formData.knowledgeType),
      cognitiveLevelId: getCognitiveLevelId(formData.cognitiveLevel),
      sectionId: getSectionId(formData.section),
      themeIds: getThemeIds(formData.themes),
    });
    toast.success('草稿保存成功');
  } catch (error) {
    toast.error('保存失败');
  }
};
```

### 更新 MainPage

1. 从后端获取数据:
```typescript
import { knowledgePointAPI } from '@/lib/api';

useEffect(() => {
  const fetchKnowledgePoints = async () => {
    const result = await knowledgePointAPI.getList({
      status: 'PUBLISHED', // 访客只能看已发布的
      page: 1,
      limit: 100,
    });
    // 处理数据并更新状态
  };
  fetchKnowledgePoints();
}, []);
```

### 更新 ContentDetailPage

1. 获取知识点详情和评论:
```typescript
import { knowledgePointAPI, interactionAPI } from '@/lib/api';

useEffect(() => {
  const fetchData = async () => {
    const [kpDetail, comments] = await Promise.all([
      knowledgePointAPI.getById(kpId),
      interactionAPI.getList({
        targetType: 'KNOWLEDGE_POINT',
        targetId: kpId.toString(),
      }),
    ]);
    // 更新状态
  };
  fetchData();
}, [kpId]);
```

## ⚠️ 注意事项

1. **认证**: 所有需要认证的 API 调用会自动添加 token（通过 `apiRequest` 函数）

2. **错误处理**: 使用 try-catch 捕获错误，并使用 toast 显示错误信息

3. **加载状态**: 在 API 调用期间显示加载状态

4. **数据格式**: 后端返回的数据格式可能与前端期望的不同，需要适配

5. **分页**: 对于列表数据，实现分页加载

6. **缓存**: 考虑使用 React Query 或 SWR 进行数据缓存和自动刷新

## 🚀 快速更新检查清单

- [ ] DashboardPage - 获取统计数据
- [ ] DashboardPage - 获取待审核列表（审核员）
- [ ] DataEntryPage - 创建知识点
- [ ] DataEntryPage - 获取选项数据（类型、层级等）
- [ ] MainPage - 从后端获取知识点列表
- [ ] ContentDetailPage - 获取知识点详情
- [ ] ContentDetailPage - 获取和创建评论
- [ ] 所有页面 - 错误处理和加载状态

