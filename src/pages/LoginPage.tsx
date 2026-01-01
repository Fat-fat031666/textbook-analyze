// 用户登录页面
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('请填写完整的登录信息');
      return;
    }
    
    setIsLoading(true);
    
    // 模拟登录请求
    setTimeout(() => {
      setIsLoading(false);
      
      // 模拟成功登录
      if (email === 'demo@example.com' && password === 'password') {
        // 存储用户信息到localStorage
        localStorage.setItem('user', JSON.stringify({
          id: 'user001',
          name: '张老师',
          email,
          role: '一线教师',
          institution: 'XX中学',
          isAuthenticated: true
        }));
        
        toast.success('登录成功，欢迎回来！');
        navigate('/dashboard');
      } else {
        toast.error('邮箱或密码错误，请重试');
      }
    }, 1500);
  };

  const handleGuestLogin = () => {
    navigate('/main');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">教材内容分析平台</h1>
            <p className="text-gray-600 dark:text-gray-400">请登录您的账号</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                邮箱/手机号
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="请输入邮箱或手机号"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="请输入密码"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  记住我
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => toast.info('重置密码功能即将上线')}
              >
                忘记密码?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <i className="fa fa-spinner fa-spin mr-2"></i>
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </motion.button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              还没有账号? <button type="button" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" onClick={() => navigate('/register')}>立即注册</button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  或
                </span>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGuestLogin}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                访客模式
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}