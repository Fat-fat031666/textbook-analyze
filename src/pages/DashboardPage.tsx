// 个人工作台页面
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { knowledgePointAPI, auditAPI, interactionAPI } from '@/lib/api';

export default function DashboardPage() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataStats, setDataStats] = useState([
    { name: '草稿', value: 0, color: '#60a5fa' },
    { name: '待审核', value: 0, color: '#fbbf24' },
    { name: '已发布', value: 0, color: '#34d399' },
    { name: '已驳回', value: 0, color: '#f87171' },
  ]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [recentInteractions, setRecentInteractions] = useState<any[]>([]);
  const navigate = useNavigate();

  // 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  // 从后端获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 获取用户的知识点统计数据
        const [draftRes, pendingRes, publishedRes, rejectedRes] = await Promise.all([
          knowledgePointAPI.getList({ creatorId: userInfo.id, status: 'DRAFT', limit: 1 }),
          knowledgePointAPI.getList({ creatorId: userInfo.id, status: 'PENDING', limit: 1 }),
          knowledgePointAPI.getList({ creatorId: userInfo.id, status: 'PUBLISHED', limit: 1 }),
          knowledgePointAPI.getList({ creatorId: userInfo.id, status: 'REJECTED', limit: 1 }),
        ]);

        setDataStats([
          { name: '草稿', value: draftRes.pagination?.total || 0, color: '#60a5fa' },
          { name: '待审核', value: pendingRes.pagination?.total || 0, color: '#fbbf24' },
          { name: '已发布', value: publishedRes.pagination?.total || 0, color: '#34d399' },
          { name: '已驳回', value: rejectedRes.pagination?.total || 0, color: '#f87171' },
        ]);

        // 如果是审核员或管理员，获取待审核列表
        if (userInfo.role === 'AUDITOR' || userInfo.role === 'ADMIN') {
          try {
            const pendingData = await auditAPI.getPending({ limit: 5 });
            setPendingReviews(pendingData.knowledgePoints || []);
          } catch (error) {
            // 权限不足时忽略
          }
        }

        // 获取最近的评论（简化版，实际应该获取与用户相关的评论）
        // 这里暂时留空，因为需要更复杂的查询逻辑

      } catch (error: any) {
        console.error('获取数据失败:', error);
        toast.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo.id, userInfo.role]);

  // 获取未读通知数量（暂时基于待审核数量）
  const unreadCount = pendingReviews.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      {/* 顶部导航 */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">个人工作台</h1>
          <p className="text-gray-600 dark:text-gray-400">欢迎回来，{userInfo.name || '老师'}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 通知图标 */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fa-solid fa-bell text-gray-600 dark:text-gray-300"></i>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* 通知下拉菜单 */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium">通知中心</h3>
                  <button className="text-sm text-blue-600 dark:text-blue-400">查看全部</button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {pendingReviews.length > 0 ? (
                    pendingReviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors bg-blue-50 dark:bg-blue-900/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <i className="fa-solid fa-clock"></i>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm font-bold">待审核知识点</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {review.content?.substring(0, 50) || '知识点'}...
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              创建者: {review.creator?.realName || review.creator?.username || '未知'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">暂无通知</div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* 用户头像 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {userInfo.name ? userInfo.name.charAt(0) : '张'}
            </div>
            <span className="hidden md:inline text-sm">{userInfo.name || '张老师'}</span>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧栏 - 我的任务 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 我的任务面板 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">我的任务</h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <span>查看全部</span>
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : pendingReviews.length > 0 ? (
                pendingReviews.map((review: any) => (
                  <motion.div
                    key={review.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/content/${review.sectionId || review.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium line-clamp-2">{review.content?.substring(0, 50) || '知识点')}...</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>创建者: {review.creator?.realName || review.creator?.username || '未知'}</span>
                          <span>类型: {review.type?.name || '未知'}</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        待审核
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {userInfo.role === 'AUDITOR' || userInfo.role === 'ADMIN' 
                    ? '暂无待审核内容' 
                    : '暂无任务'}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* 快捷操作区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">快捷操作</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                onClick={() => navigate('/data-entry')}
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white mb-2">
                  <i className="fa-solid fa-plus text-xl"></i>
                </div>
                <span className="text-sm font-medium">新建数据录入</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={() => navigate('/main')}
              >
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white mb-2">
                  <i className="fa-solid fa-book-open text-xl"></i>
                </div>
                <span className="text-sm font-medium">浏览教材内容</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white mb-2">
                  <i className="fa-solid fa-star text-xl"></i>
                </div>
                <span className="text-sm font-medium">我的收藏</span>
              </motion.button>
            </div>
          </motion.div>
          
          {/* 我的评论动态 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">评论动态</h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <span>管理评论</span>
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500 text-sm">加载中...</div>
              ) : recentInteractions.length > 0 ? (
                recentInteractions.map((interaction: any) => (
                  <div
                    key={interaction.id}
                    className="p-3 border-l-4 border-gray-200 dark:border-gray-700 rounded"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{interaction.content}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        来自 {interaction.user?.realName || interaction.user?.username || '未知'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(interaction.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">暂无评论动态</div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* 右侧栏 - 数据统计 */}
        <div className="space-y-6">
          {/* 我的数据统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">数据统计</h2>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dataStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {dataStats.map((stat) => (
                <div
                  key={stat.name}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg"
                >
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stat.color }}></div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</span>
                  </div>
                  <span className="font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* 提交趋势 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">近7天提交趋势</h2>
            
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">加载中...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: '周一', count: 0 },
                      { day: '周二', count: 0 },
                      { day: '周三', count: 0 },
                      { day: '周四', count: 0 },
                      { day: '周五', count: 0 },
                      { day: '周六', count: 0 },
                      { day: '周日', count: 0 },
                    ]}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}