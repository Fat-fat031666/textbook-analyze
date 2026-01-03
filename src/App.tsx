import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MainPage from "@/pages/MainPage";
import ContentDetailPage from "@/pages/ContentDetailPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import DataEntryPage from "@/pages/DataEntryPage";
import AuditPage from "@/pages/AuditPage";
import { ClassificationFrameModal } from "@/components/ClassificationFrameModal";
import { useState, useEffect } from "react";

// 不再使用本地示例数据，改为从后端API获取

export default function App() {
  const [isClassificationFrameOpen, setIsClassificationFrameOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查用户登录状态
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        // 如果有用户信息和token，认为已登录
        setIsAuthenticated(!!userData.id || !!userData.isAuthenticated);
      } catch (e) {
        // 解析失败，清除无效数据
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const openClassificationFrame = () => {
    setIsClassificationFrameOpen(true);
  };

  const closeClassificationFrame = () => {
    setIsClassificationFrameOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 全局分类框架说明按钮 */}
      <button
        onClick={openClassificationFrame}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition duration-300 z-50"
        aria-label="打开分类框架说明"
      >
        <i className="fa-solid fa-info-circle text-xl"></i>
      </button>

      <Routes>
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <LoginPage />} />
        <Route path="/data-entry" element={isAuthenticated ? <DataEntryPage /> : <LoginPage />} />
        <Route path="/audit" element={isAuthenticated ? <AuditPage /> : <LoginPage />} />
        <Route 
          path="/main" 
          element={
            <MainPage 
              openClassificationFrame={openClassificationFrame}
            />
          } 
        />
        <Route 
          path="/content/:sectionId" 
          element={
            <ContentDetailPage 
              openClassificationFrame={openClassificationFrame}
            />
          } 
        />
      </Routes>

      {/* 分类框架说明弹窗 */}
      <ClassificationFrameModal
        isOpen={isClassificationFrameOpen}
        onClose={closeClassificationFrame}
      />
    </div>
  );
}
