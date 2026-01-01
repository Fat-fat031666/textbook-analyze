// 个人工作台页面
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 模拟任务数据
const taskData = [
  { id: 1, textbook: '人教版', chapters: '七年级上册第1-2章', deadline: '2024-01-30', status: '进行中' },
  { id: 2, textbook: '北师大版', chapters: '八年级下册第3章', deadline: '2024-02-15', status: '待开始' },
  { id: 3, textbook: '苏教版', chapters: '九年级上册第5-6章', deadline: '2024-01-20', status: '已完成' },
];

// 模拟数据统计
const dataStats = [
  { name: '草稿', value: 8, color: '#60a5fa' },
  { name: '待审核', value: 5, color: '#fbbf24' },
  { name: '已发布', value: 12, color: '#34d399' },
  { name: '已驳回', value: 2, color: '#f87171' },
];

// 模拟评论动态
const commentActivity = [
  { id: 1, content: '您对"正数和负数"的分析很有见地！', user: '李老师', time: '10分钟前', unread: true },
  { id: 2, content: '有理数分类部分需要补充一些实例', user: '王教研员', time: '2小时前', unread: false },
];

// 模拟系统通知
const notifications = [
  { id: 1, title: '数据审核通过', content: '您提交的"正数的定义"已审核通过', time: '今天 09:30', type: 'success', unread: true },
  { id: 2, title: '新任务分配', content: '您有新的教材录入任务，请及时查看', time: '昨天 14:20', type: 'task', unread: true },
  { id: 3, title: '系统公告', content: '平台将于本周日进行升级维护', time: '2024-01-10', type: 'announcement', unread: false },
  { id: 4, title: '评论回复', content: '李老师回复了您的评论', time: '2024-01-08', type: 'comment', unread: false },
  { id: 5, title: '数据驳回', content: '您提交的"负数的应用"需要修改', time: '2024-01-05', type: 'error', unread: false },
];

export default function DashboardPage() {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // 获取未读通知数量
  const unreadCount = notifications.filter(n => n.unread).length;

  // 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

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
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1 rounded-full ${
                          notification.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          notification.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          notification.type === 'task' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          <i className={`fa-solid ${
                            notification.type === 'success' ? 'fa-check' :
                            notification.type === 'error' ? 'fa-times' :
                            notification.type === 'task' ? 'fa-tasks' :
                            'fa-bullhorn'
                          }`}></i>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-medium text-sm ${notification.unread ? 'font-bold' : ''}`}>{notification.title}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
              {taskData.map(task => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.01 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  onClick={() => navigate('/main')}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{task.textbook} - {task.chapters}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-calendar-alt"></i>
                          <span>截止日期：{task.deadline}</span>
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === '进行中' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      task.status === '待开始' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </motion.div>
              ))}
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
              {commentActivity.map(activity => (
                <div
                  key={activity.id}
                  className={`p-3 border-l-4 ${activity.unread ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'} rounded`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{activity.content}</p>
                    {activity.unread && (
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">来自 {activity.user}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                </div>
              ))}
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { day: '周一', count: 2 },
                    { day: '周二', count: 1 },
                    { day: '周三', count: 3 },
                    { day: '周四', count: 0 },
                    { day: '周五', count: 2 },
                    { day: '周六', count: 1 },
                    { day: '周日', count: 4 },
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}