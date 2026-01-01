// 开场引导页
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

export default function Home({ isAuthenticated, setIsAuthenticated }: HomeProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const navigate = useNavigate();

  // 检查用户是否已登录，如果已登录则直接跳转
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    const autoRedirect = setTimeout(() => {
      // 动画结束后跳转到登录页
      navigate('/login');
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoRedirect);
    };
  }, [navigate]);

  const skipIntro = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 flex flex-col items-center justify-center p-4">
      {/* 主标题 */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-700 dark:text-blue-200 mb-8 text-center"
      >
        教材内容分析互动平台
      </motion.h1>

      {/* 动画内容区域 */}
      <motion.div 
        className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.p 
            className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            教材作为"教学载体、学习资源、师生互动桥梁"，在教育过程中发挥着不可替代的作用。
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            本平台致力于对教材知识点进行系统化分析，支持多用户协同、数据审核和在线互动，助力教育工作者提升教学质量。
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            面向师范生、一线教师、教研员和管理员，提供全方位的教材分析与教学支持服务。
          </motion.p>
        </motion.div>
      </motion.div>

      {/* 进度指示 */}
      <motion.div 
        className="w-full max-w-3xl h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2 }}
      >
        <motion.div 
          className="h-full bg-blue-600 dark:bg-blue-400"
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / 30) * 100}%` }}
          transition={{ duration: 1, repeat: 29, repeatType: "loop" }}
        />
      </motion.div>

      {/* 跳过按钮 */}
      <motion.button
        onClick={skipIntro}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        跳过 ({timeLeft}s)
      </motion.button>
    </div>
  );
}