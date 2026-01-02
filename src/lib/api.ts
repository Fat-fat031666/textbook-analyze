// API 配置和工具函数

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 获取认证 token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置认证 token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 清除认证 token
export const clearToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 通用 API 请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

// 认证相关 API
export const authAPI = {
  // 登录
  login: async (email: string, password: string) => {
    const data = await apiRequest<{
      message: string;
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // 保存 token 和用户信息
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // 注册
  register: async (userData: {
    username: string;
    email?: string;
    phone?: string;
    password: string;
    realName: string;
    institution?: string;
    role?: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // 登出
  logout: () => {
    clearToken();
  },
};

// 知识点相关 API
export const knowledgePointAPI = {
  // 获取知识点列表
  getList: async (params?: {
    status?: string;
    typeId?: number;
    cognitiveLevelId?: number;
    page?: number;
    limit?: number;
  }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return apiRequest(`/knowledge-points${queryString}`);
  },

  // 获取知识点详情
  getById: async (id: number) => {
    return apiRequest(`/knowledge-points/${id}`);
  },

  // 创建知识点
  create: async (data: any) => {
    return apiRequest('/knowledge-points', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新知识点
  update: async (id: number, data: any) => {
    return apiRequest(`/knowledge-points/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 删除知识点
  delete: async (id: number) => {
    return apiRequest(`/knowledge-points/${id}`, {
      method: 'DELETE',
    });
  },

  // 提交审核
  submitForReview: async (id: number, remark?: string) => {
    return apiRequest(`/knowledge-points/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ remark }),
    });
  },
};

// 审核相关 API
export const auditAPI = {
  // 获取待审核列表
  getPending: async (params?: { page?: number; limit?: number }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return apiRequest(`/audit/pending${queryString}`);
  },

  // 通过审核
  approve: async (kpId: number, remark?: string) => {
    return apiRequest(`/audit/${kpId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remark }),
    });
  },

  // 驳回审核
  reject: async (kpId: number, remark: string) => {
    return apiRequest(`/audit/${kpId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remark }),
    });
  },
};

// 主题相关 API
export const themeAPI = {
  // 获取主题列表
  getList: async (params?: { subjectId?: number; page?: number; limit?: number }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return apiRequest(`/themes${queryString}`);
  },

  // 获取主题详情
  getById: async (id: number) => {
    return apiRequest(`/themes/${id}`);
  },

  // 获取主题下的知识点
  getKnowledgePoints: async (id: number, params?: { page?: number; limit?: number }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return apiRequest(`/themes/${id}/knowledge-points${queryString}`);
  },
};

// 评论相关 API
export const interactionAPI = {
  // 获取评论列表
  getList: async (params: {
    targetType: 'KNOWLEDGE_POINT' | 'LESSON' | 'CHAPTER' | 'SECTION';
    targetId: string;
    parentId?: number;
    page?: number;
    limit?: number;
  }) => {
    const queryString = '?' + new URLSearchParams(params as any).toString();
    return apiRequest(`/interactions${queryString}`);
  },

  // 创建评论
  create: async (data: {
    targetType: 'KNOWLEDGE_POINT' | 'LESSON' | 'CHAPTER' | 'SECTION';
    targetId: string;
    content: string;
    parentId?: number;
    knowledgePointId?: number;
  }) => {
    return apiRequest('/interactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新评论
  update: async (id: number, content: string) => {
    return apiRequest(`/interactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  },

  // 删除评论
  delete: async (id: number) => {
    return apiRequest(`/interactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// 用户相关 API
export const userAPI = {
  // 获取用户信息
  getById: async (id: number) => {
    return apiRequest(`/users/${id}`);
  },

  // 更新用户信息
  update: async (id: number, data: any) => {
    return apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

