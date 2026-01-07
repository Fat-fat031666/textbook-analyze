// 审核页面 - 供审核员和管理员使用
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { auditAPI, knowledgePointAPI } from '@/lib/api';
import { LearningClassificationModal } from '@/components/ClassificationFrameModal';

export default function AuditPage() {
  const [loading, setLoading] = useState(true);
  const [pendingKnowledgePoints, setPendingKnowledgePoints] = useState<any[]>([]);
  const [selectedKp, setSelectedKp] = useState<any | null>(null);
  const [approveRemark, setApproveRemark] = useState('');
  const [rejectRemark, setRejectRemark] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isClassificationFrameOpen, setIsClassificationFrameOpen] = useState(false);
  const navigate = useNavigate();

  // 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  // 检查权限
  useEffect(() => {
    if (userInfo.role !== 'AUDITOR' && userInfo.role !== 'ADMIN') {
      toast.error('您没有权限访问此页面');
      navigate('/dashboard');
    }
  }, [userInfo.role, navigate]);

  // 获取待审核列表
  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await auditAPI.getPending({ limit: 100 });
      setPendingKnowledgePoints(response.knowledgePoints || []);
    } catch (error: any) {
      console.error('获取待审核列表失败:', error);
      toast.error(error.message || '获取待审核列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo.role === 'AUDITOR' || userInfo.role === 'ADMIN') {
      fetchPendingReviews();
    }
  }, [userInfo.role]);

  // 查看知识点详情
  const handleViewDetail = async (kpId: number) => {
    try {
      const response = await knowledgePointAPI.getById(kpId);
      setSelectedKp(response.knowledgePoint);
    } catch (error: any) {
      console.error('获取知识点详情失败:', error);
      toast.error(error.message || '获取知识点详情失败');
    }
  };

  // 通过审核
  const handleApprove = async () => {
    if (!selectedKp) return;

    try {
      setProcessing(true);
      await auditAPI.approve(selectedKp.id, approveRemark || undefined);
      toast.success('审核通过');
      setShowApproveModal(false);
      setApproveRemark('');
      setSelectedKp(null);
      await fetchPendingReviews();
    } catch (error: any) {
      console.error('审核通过失败:', error);
      toast.error(error.message || '审核通过失败');
    } finally {
      setProcessing(false);
    }
  };

  // 驳回审核
  const handleReject = async () => {
    if (!selectedKp) return;

    if (!rejectRemark.trim()) {
      toast.error('请填写驳回理由');
      return;
    }

    try {
      setProcessing(true);
      await auditAPI.reject(selectedKp.id, rejectRemark);
      toast.success('已驳回');
      setShowRejectModal(false);
      setRejectRemark('');
      setSelectedKp(null);
      await fetchPendingReviews();
    } catch (error: any) {
      console.error('驳回失败:', error);
      toast.error(error.message || '驳回失败');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">审核管理</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              待审核知识点: {pendingKnowledgePoints.length} 条
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsClassificationFrameOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-info-circle"></i>
              <span>分类框架说明</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              返回工作台
            </button>
          </div>
        </header>

        {/* 待审核列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：待审核列表 */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold mb-4">待审核列表</h2>
              
              {pendingKnowledgePoints.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <i className="fa-solid fa-check-circle text-4xl mb-4 text-gray-300"></i>
                  <p>暂无待审核的知识点</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingKnowledgePoints.map((kp: any) => (
                    <motion.div
                      key={kp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedKp?.id === kp.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleViewDetail(kp.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {kp.content?.substring(0, 100) || '无内容'}...
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                              {kp.type?.name || '未知类型'}
                            </span>
                            {kp.cognitiveLevel && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                {kp.cognitiveLevel.name}
                              </span>
                            )}
                            {kp.creator && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                创建者: {kp.creator.realName || kp.creator.username}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            提交时间: {new Date(kp.updatedAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
                          待审核
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* 右侧：知识点详情和操作 */}
          <div className="lg:col-span-1">
            {selectedKp ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-4"
              >
                <h2 className="text-xl font-bold mb-4">知识点详情</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">内容</label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                      {selectedKp.content || '无内容'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">知识类型</label>
                      <div className="mt-1 text-sm">{selectedKp.type?.name || '未知'}</div>
                    </div>
                    {selectedKp.cognitiveLevel && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">认知层级</label>
                        <div className="mt-1 text-sm">{selectedKp.cognitiveLevel.name}</div>
                      </div>
                    )}
                  </div>

                  {selectedKp.themes && selectedKp.themes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">主题</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedKp.themes.map((t: any) => (
                          <span
                            key={t.theme.id}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm"
                          >
                            {t.theme.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedKp.creator && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">创建者</label>
                      <div className="mt-1 text-sm">
                        {selectedKp.creator.realName || selectedKp.creator.username}
                        {selectedKp.creator.institution && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            ({selectedKp.creator.institution})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowApproveModal(true);
                          setApproveRemark('');
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <i className="fa-solid fa-check mr-2"></i>
                        通过
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectModal(true);
                          setRejectRemark('');
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <i className="fa-solid fa-times mr-2"></i>
                        驳回
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
                <i className="fa-solid fa-info-circle text-4xl mb-4 text-gray-300"></i>
                <p>请从左侧选择要审核的知识点</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 通过审核模态框 */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">通过审核</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                审核备注（可选）
              </label>
              <textarea
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="请输入审核备注..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveRemark('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={processing}
              >
                取消
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? '处理中...' : '确认通过'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 驳回审核模态框 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">驳回审核</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                驳回理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
                placeholder="请详细说明驳回原因..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectRemark('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={processing}
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectRemark.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? '处理中...' : '确认驳回'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* 分类框架说明弹窗 */}
      <LearningClassificationModal
        isOpen={isClassificationFrameOpen}
        onClose={() => setIsClassificationFrameOpen(false)}
      />
    </div>
  );
}

