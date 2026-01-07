// 内容分析详情页
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { knowledgePointAPI, interactionAPI } from '@/lib/api';
import { LearningClassificationModal } from '@/components/ClassificationFrameModal';

export default function ContentDetailPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [knowledgePoints, setKnowledgePoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'type' | 'theme'>('id');
  const [sortedPoints, setSortedPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [selectedCommentPoint, setSelectedCommentPoint] = useState<number | null>(null);
  const [sortCommentsBy, setSortCommentsBy] = useState<'latest' | 'hottest'>('latest');
  const [isClassificationFrameOpen, setIsClassificationFrameOpen] = useState(false);
  const navigate = useNavigate();

  // 从后端获取知识点
  useEffect(() => {
    const fetchKnowledgePoints = async () => {
      if (!sectionId) return;

      try {
        setLoading(true);
        // 如果sectionId是数字，说明是section的ID
        const sectionIdNum = parseInt(sectionId);
        if (!isNaN(sectionIdNum)) {
          const result = await knowledgePointAPI.getList({
            sectionId: sectionIdNum,
            status: 'PUBLISHED', // 只显示已发布的
            limit: 100,
          });
          setKnowledgePoints(result.knowledgePoints || []);
        } else {
          // 如果不是数字，获取所有已发布的知识点
          const result = await knowledgePointAPI.getList({
            status: 'PUBLISHED',
            limit: 100,
          });
          setKnowledgePoints(result.knowledgePoints || []);
        }
      } catch (error: any) {
        console.error('获取知识点失败:', error);
        toast.error('加载知识点失败');
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgePoints();
  }, [sectionId]);

  // 筛选和排序知识点
  useEffect(() => {
    if (loading || knowledgePoints.length === 0) {
      setSortedPoints([]);
      return;
    }

    let filtered = [...knowledgePoints];
    
    // 按知识类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter((point: any) => point.type?.name === filterType);
    }
    
    // 按审核状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter((point: any) => point.status === filterStatus);
    }
    
    // 排序
    const sorted = [...filtered].sort((a: any, b: any) => {
      if (sortBy === 'id') {
        return a.id - b.id;
      } else if (sortBy === 'type') {
        return (a.type?.name || '').localeCompare(b.type?.name || '');
      } else {
        return (a.themes?.[0]?.theme?.name || '').localeCompare(b.themes?.[0]?.theme?.name || '');
      }
    });
    
    setSortedPoints(sorted);
  }, [knowledgePoints, filterType, filterStatus, sortBy, loading]);

  // 从后端获取评论数据
  useEffect(() => {
    const fetchComments = async () => {
      if (!sectionId) return;

      try {
        // 获取该section下的所有评论
        const result = await interactionAPI.getList({
          targetType: 'SECTION',
          targetId: sectionId,
          limit: 50,
        });
        setComments(result.interactions || []);
      } catch (error: any) {
        console.error('获取评论失败:', error);
        // 评论获取失败不影响页面显示
      }
    };

    fetchComments();
  }, [sectionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">加载中...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (knowledgePoints.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">暂无知识点数据</h2>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/main')}
            >
              返回主页面
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 获取位置信息（从第一个知识点中获取）
  const getLocationInfo = () => {
    if (sortedPoints.length === 0) return { location: '', fullLocation: '' };
    const firstPoint = sortedPoints[0];
    const section = firstPoint.section;
    if (!section) return { location: '', fullLocation: '知识点详情' };
    
    const chapter = section.chapter;
    const book = chapter?.book;
    const grade = book?.grade;
    const educationLevel = grade?.educationLevel;
    const subject = educationLevel?.subject;
    
    const location = `${subject?.name || ''} > ${educationLevel?.name || ''} > ${grade?.name || ''} > ${book?.name || ''} > ${chapter?.name || ''}`;
    const fullLocation = `${location} > ${section.name}`;
    
    return { location, fullLocation };
  };

  const { fullLocation } = getLocationInfo();

  // 获取面包屑导航路径
  const getBreadcrumbs = () => {
    const parts = fullLocation.split(' > ').filter(p => p);
    const crumbs = [{ name: '首页', path: '/dashboard' }];
    
    parts.forEach((part, index) => {
      crumbs.push({ 
        name: part, 
        path: index === parts.length - 1 ? '' : '',
        isActive: index === parts.length - 1
      });
    });
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // 排序评论
  const sortedComments = [...comments].sort((a: any, b: any) => {
    if (sortCommentsBy === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // 按热度排序（回复数）
      const aHeat = (a.replies?.length || 0);
      const bHeat = (b.replies?.length || 0);
      return bHeat - aHeat;
    }
  });

  // 处理发表评论
  const handleSubmitComment = async () => {
    if (!commentInput.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      await interactionAPI.create({
        targetType: 'SECTION',
        targetId: sectionId || '',
        content: commentInput,
        knowledgePointId: selectedCommentPoint || undefined,
      });
      
      toast.success('评论发表成功');
      setCommentInput('');
      setSelectedCommentPoint(null);
      
      // 重新获取评论
      const result = await interactionAPI.getList({
        targetType: 'SECTION',
        targetId: sectionId || '',
        limit: 50,
      });
      setComments(result.interactions || []);
    } catch (error: any) {
      console.error('发表评论失败:', error);
      toast.error(error.message || '发表评论失败');
    }
  };

  // 处理导出
  const handleExport = () => {
    toast.info('导出功能开发中');
  };

  // 获取统计信息
  const stats = {
    total: sortedPoints.length,
    published: sortedPoints.filter((p: any) => p.status === 'PUBLISHED').length,
    pending: sortedPoints.filter((p: any) => p.status === 'PENDING').length,
  };

  // 获取所有类型
  const allTypes = Array.from(new Set(sortedPoints.map((p: any) => p.type?.name).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* 面包屑导航 */}
      <div className="mb-6 text-sm">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              <a 
                href={crumb.path} 
                className={`${crumb.isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={(e) => {
                  if (!crumb.path) e.preventDefault();
                }}
              >
                {crumb.name}
              </a>
              {index < breadcrumbs.length - 1 && (
                <i className="fa-solid fa-chevron-right mx-2 text-xs"></i>
              )}
            </span>
          ))}
        </div>
      </div>

      <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
            {sortedPoints[0]?.section?.name || '知识点详情'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{fullLocation || '知识点列表'}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsClassificationFrameOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-info-circle"></i>
            <span>分类框架说明</span>
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/main')}
          >
            返回
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            onClick={handleExport}
          >
            导出
          </button>
        </div>
      </header>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">知识点总数</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">已发布</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">待审核</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
        </div>
      </div>

      {/* 筛选和排序 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">类型:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border rounded dark:bg-gray-700"
            >
              <option value="all">全部</option>
              {allTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">状态:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
            <label className="text-sm font-medium">排序:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded dark:bg-gray-700"
            >
              <option value="id">ID</option>
              <option value="type">类型</option>
              <option value="theme">主题</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：知识点列表 */}
        <div className="lg:col-span-2 space-y-4">
          {sortedPoints.length > 0 ? (
            sortedPoints.map((point: any) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 ${
                  selectedPoint === point.id ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                } cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setSelectedPoint(point.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{point.content}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
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
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">暂无知识点</div>
          )}
        </div>

        {/* 右侧：评论区域 */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">评论 ({comments.length})</h3>
            
            <div className="mb-4">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="发表评论..."
                className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                rows={3}
              />
              <button
                onClick={handleSubmitComment}
                className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                发表评论
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                className={`flex-1 px-3 py-1 rounded text-sm ${
                  sortCommentsBy === 'latest' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                onClick={() => setSortCommentsBy('latest')}
              >
                最新
              </button>
              <button
                className={`flex-1 px-3 py-1 rounded text-sm ${
                  sortCommentsBy === 'hottest' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                onClick={() => setSortCommentsBy('hottest')}
              >
                最热
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedComments.length > 0 ? (
                sortedComments.map((comment: any) => (
                  <div key={comment.id} className="border-b pb-3">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                        {(comment.user?.realName || comment.user?.username || 'U').charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {comment.user?.realName || comment.user?.username || '未知用户'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{comment.content}</p>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className="text-sm border-l-2 pl-2">
                            <div className="font-medium text-xs">
                              {reply.user?.realName || reply.user?.username || '未知用户'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </div>
                            <p className="mt-1">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">暂无评论</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 分类框架说明弹窗 */}
      <LearningClassificationModal
        isOpen={isClassificationFrameOpen}
        onClose={() => setIsClassificationFrameOpen(false)}
      />
    </div>
  );
}
