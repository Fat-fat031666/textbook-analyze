// 主界面 - 知识点浏览
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
// import { cn } from '@/lib/utils'; // 暂时未使用
import { knowledgePointAPI } from '@/lib/api';

interface MainPageProps {
  openClassificationFrame: () => void;
}

export default function MainPage({ openClassificationFrame }: MainPageProps) {
  const [knowledgePoints, setKnowledgePoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const [activeTab, setActiveTab] = useState<'list' | 'type'>('list'); // 暂时未使用
  const [selectedKnowledgeType, setSelectedKnowledgeType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('PUBLISHED');
  const navigate = useNavigate();

  // 从后端获取知识点列表
  useEffect(() => {
    const fetchKnowledgePoints = async () => {
      try {
        setLoading(true);
        const result = await knowledgePointAPI.getList({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          limit: 200,
        });
        setKnowledgePoints(result.knowledgePoints || []);
      } catch (error: any) {
        console.error('获取知识点列表失败:', error);
        toast.error('加载知识点失败');
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgePoints();
  }, [selectedStatus]);

  // 获取所有知识类型
  const allTypes = Array.from(new Set(
    knowledgePoints.map((kp: any) => kp.type?.name).filter(Boolean)
  ));

  // 过滤知识点
  const filteredPoints = knowledgePoints.filter((kp: any) => {
    if (selectedKnowledgeType === 'all') return true;
    return kp.type?.name === selectedKnowledgeType;
  });

  // 按学科分组
  const groupedBySubject = filteredPoints.reduce((acc: any, kp: any) => {
    const subjectName = kp.section?.chapter?.book?.grade?.educationLevel?.subject?.name || '未分类';
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(kp);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">教材内容分析</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">浏览和管理教材知识点</p>
            </div>
            <button
              onClick={openClassificationFrame}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              分类框架说明
            </button>
          </div>

          {/* 筛选控制 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">状态:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 border rounded dark:bg-gray-700"
              >
                <option value="all">全部</option>
                <option value="PUBLISHED">已发布</option>
                <option value="PENDING">待审核</option>
                <option value="DRAFT">草稿</option>
                <option value="REJECTED">已驳回</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">类型:</label>
              <select
                value={selectedKnowledgeType}
                onChange={(e) => setSelectedKnowledgeType(e.target.value)}
                className="px-3 py-1 border rounded dark:bg-gray-700"
              >
                <option value="all">全部类型</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              共 {filteredPoints.length} 个知识点
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">暂无知识点数据</div>
            <button
              onClick={() => navigate('/data-entry')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建知识点
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 按学科分组显示 */}
            {Object.entries(groupedBySubject).map(([subjectName, points]: [string, any]) => (
              <motion.div
                key={subjectName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4">
                  {subjectName} ({points.length})
                </h2>
                
                <div className="space-y-3">
                  {points.map((point: any) => {
                    const section = point.section;
                    const location = section
                      ? `${section.chapter?.book?.grade?.educationLevel?.name || ''} > ${section.chapter?.book?.grade?.name || ''} > ${section.chapter?.book?.name || ''} > ${section.chapter?.name || ''} > ${section.name || ''}`
                      : '未分类';

                    return (
                      <motion.div
                        key={point.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          if (section?.id) {
                            navigate(`/content/${section.id}`);
                          } else {
                            // 如果没有section，直接显示知识点详情
                            navigate(`/content/${point.id}`);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg flex-1">{point.content}</h3>
                          <span className={`px-2 py-1 rounded text-xs ml-2 ${
                            point.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            point.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            point.status === 'DRAFT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {point.status === 'PUBLISHED' ? '已发布' :
                             point.status === 'PENDING' ? '待审核' :
                             point.status === 'DRAFT' ? '草稿' : '已驳回'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>类型: {point.type?.name || '未知'}</span>
                          {point.cognitiveLevel && (
                            <span>认知层级: {point.cognitiveLevel.name}</span>
                          )}
                          {point.themes && point.themes.length > 0 && (
                            <span>主题: {point.themes.map((t: any) => t.theme.name).join(', ')}</span>
                          )}
                          <span>创建者: {point.creator?.realName || point.creator?.username || '未知'}</span>
                        </div>
                        
                        {location && location !== '未分类' && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            位置: {location}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
