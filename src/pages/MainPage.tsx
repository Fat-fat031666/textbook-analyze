// 主界面 - 知识点浏览
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
// import { cn } from '@/lib/utils'; // 暂时未使用
import { knowledgePointAPI, textbookAPI } from '@/lib/api';
import { LearningClassificationModal } from '@/components/ClassificationFrameModal';

export default function MainPage() {
  const [knowledgePoints, setKnowledgePoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tree' | 'type'>('tree'); // 目录树导航 或 类型检索导航
  const [selectedKnowledgeType, setSelectedKnowledgeType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('PUBLISHED');
  const [isClassificationFrameOpen, setIsClassificationFrameOpen] = useState(false);
  
  // 目录树相关状态
  const [textbookStructure, setTextbookStructure] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [structureLoading, setStructureLoading] = useState(true);
  
  const navigate = useNavigate();

  // 从后端获取教材结构
  useEffect(() => {
    const fetchTextbookStructure = async () => {
      try {
        setStructureLoading(true);
        const result = await textbookAPI.getStructure(selectedSubjectId || undefined) as { subjects: any[] };
        setTextbookStructure(result.subjects || []);
        
        // 默认展开第一个科目
        if (result.subjects && result.subjects.length > 0 && !selectedSubjectId) {
          const firstSubject = result.subjects[0];
          setSelectedSubjectId(firstSubject.id);
          
          // 默认展开第一个学段的完整路径
          const expandedSet = new Set<string>();
          if (firstSubject.educationLevels && firstSubject.educationLevels.length > 0) {
            const firstLevel = firstSubject.educationLevels[0];
            expandedSet.add(`level-${firstLevel.id}`);
            
            if (firstLevel.grades && firstLevel.grades.length > 0) {
              const firstGrade = firstLevel.grades[0];
              expandedSet.add(`grade-${firstGrade.id}`);
              
              if (firstGrade.books && firstGrade.books.length > 0) {
                const firstBook = firstGrade.books[0];
                expandedSet.add(`book-${firstBook.id}`);
                
                if (firstBook.chapters && firstBook.chapters.length > 0) {
                  const firstChapter = firstBook.chapters[0];
                  expandedSet.add(`chapter-${firstChapter.id}`);
                }
              }
            }
          }
          setExpandedNodes(expandedSet);
        } else if (selectedSubjectId) {
          // 如果已选择科目，保持当前展开状态或展开第一个学段
          const selectedSubject = result.subjects?.find((s: any) => s.id === selectedSubjectId);
          if (selectedSubject && expandedNodes.size === 0) {
            const expandedSet = new Set<string>();
            if (selectedSubject.educationLevels && selectedSubject.educationLevels.length > 0) {
              const firstLevel = selectedSubject.educationLevels[0];
              expandedSet.add(`level-${firstLevel.id}`);
              
              if (firstLevel.grades && firstLevel.grades.length > 0) {
                const firstGrade = firstLevel.grades[0];
                expandedSet.add(`grade-${firstGrade.id}`);
                
                if (firstGrade.books && firstGrade.books.length > 0) {
                  const firstBook = firstGrade.books[0];
                  expandedSet.add(`book-${firstBook.id}`);
                  
                  if (firstBook.chapters && firstBook.chapters.length > 0) {
                    const firstChapter = firstBook.chapters[0];
                    expandedSet.add(`chapter-${firstChapter.id}`);
                  }
                }
              }
            }
            setExpandedNodes(expandedSet);
          }
        }
      } catch (error: any) {
        console.error('获取教材结构失败:', error);
        toast.error('加载教材结构失败');
      } finally {
        setStructureLoading(false);
      }
    };

    if (activeTab === 'tree') {
      fetchTextbookStructure();
    }
  }, [activeTab, selectedSubjectId]);

  // 从后端获取知识点列表（用于类型检索导航）
  useEffect(() => {
    if (activeTab === 'type') {
      const fetchKnowledgePoints = async () => {
        try {
          setLoading(true);
          const result = await knowledgePointAPI.getList({
            status: selectedStatus === 'all' ? undefined : selectedStatus,
            limit: 100, // 后端限制最大100
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
    }
  }, [selectedStatus, activeTab]);

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

  // 切换节点展开/折叠
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // 渲染目录树节点
  const renderTree = () => {
    if (structureLoading) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500">加载教材结构...</div>
        </div>
      );
    }

    const selectedSubject = textbookStructure.find((s: any) => s.id === selectedSubjectId);
    if (!selectedSubject) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500">请选择科目</div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {selectedSubject.educationLevels?.map((level: any) => {
          const levelKey = `level-${level.id}`;
          const isLevelExpanded = expandedNodes.has(levelKey);
          
          return (
            <div key={level.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {/* 学段 */}
              <div
                className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                onClick={() => toggleNode(levelKey)}
              >
                <i className={`fa-solid fa-chevron-${isLevelExpanded ? 'up' : 'down'} text-xs text-gray-400`}></i>
                <span className="font-medium">{level.name}</span>
              </div>

              {isLevelExpanded && level.grades?.map((grade: any) => {
                const gradeKey = `grade-${grade.id}`;
                const isGradeExpanded = expandedNodes.has(gradeKey);
                
                return (
                  <div key={grade.id} className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    {/* 年级 */}
                    <div
                      className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      onClick={() => toggleNode(gradeKey)}
                    >
                      <i className={`fa-solid fa-chevron-${isGradeExpanded ? 'up' : 'down'} text-xs text-gray-400`}></i>
                      <span className="font-medium">{grade.name}</span>
                    </div>

                    {isGradeExpanded && grade.books?.map((book: any) => {
                      const bookKey = `book-${book.id}`;
                      const isBookExpanded = expandedNodes.has(bookKey);
                      
                      return (
                        <div key={book.id} className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                          {/* 册别 */}
                          <div
                            className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                            onClick={() => toggleNode(bookKey)}
                          >
                            <i className={`fa-solid fa-chevron-${isBookExpanded ? 'up' : 'down'} text-xs text-gray-400`}></i>
                            <span className="font-medium">{book.name}</span>
                          </div>

                          {isBookExpanded && book.chapters?.map((chapter: any) => {
                            const chapterKey = `chapter-${chapter.id}`;
                            const isChapterExpanded = expandedNodes.has(chapterKey);
                            
                            return (
                              <div key={chapter.id} className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                {/* 章节 */}
                                <div
                                  className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                                  onClick={() => toggleNode(chapterKey)}
                                >
                                  <i className={`fa-solid fa-chevron-${isChapterExpanded ? 'up' : 'down'} text-xs text-gray-400`}></i>
                                  <span className="font-medium">{chapter.name}</span>
                                </div>

                                {isChapterExpanded && chapter.sections?.map((section: any) => (
                                  <div
                                    key={section.id}
                                    className="ml-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center justify-between group"
                                    onClick={() => navigate(`/content/${section.id}`)}
                                  >
                                    <span className="text-gray-700 dark:text-gray-300">{section.name}</span>
                                    <i className="fa-solid fa-chevron-right text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

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
              onClick={() => setIsClassificationFrameOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              分类框架说明
            </button>
          </div>

          {/* 导航标签页 */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tree'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              目录树导航
            </button>
            <button
              onClick={() => setActiveTab('type')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'type'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              类型检索导航
            </button>
          </div>

          {/* 目录树导航的科目选择 */}
          {activeTab === 'tree' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">选择科目</div>
              <div className="flex gap-3">
                {textbookStructure.map((subject: any) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      // 重置展开状态，默认展开第一个学段
                      const expandedSet = new Set<string>();
                      if (subject.educationLevels && subject.educationLevels.length > 0) {
                        const firstLevel = subject.educationLevels[0];
                        expandedSet.add(`level-${firstLevel.id}`);
                        
                        if (firstLevel.grades && firstLevel.grades.length > 0) {
                          const firstGrade = firstLevel.grades[0];
                          expandedSet.add(`grade-${firstGrade.id}`);
                          
                          if (firstGrade.books && firstGrade.books.length > 0) {
                            const firstBook = firstGrade.books[0];
                            expandedSet.add(`book-${firstBook.id}`);
                            
                            if (firstBook.chapters && firstBook.chapters.length > 0) {
                              const firstChapter = firstBook.chapters[0];
                              expandedSet.add(`chapter-${firstChapter.id}`);
                            }
                          }
                        }
                      }
                      setExpandedNodes(expandedSet);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedSubjectId === subject.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 类型检索导航的筛选控制 */}
          {activeTab === 'type' && (
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
          )}
        </header>

        {/* 内容区域 */}
        {activeTab === 'tree' ? (
          /* 目录树导航 */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {renderTree()}
          </div>
        ) : (
          /* 类型检索导航 */
          loading ? (
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
          )
        )}
      </div>
      
      {/* 分类框架说明弹窗 */}
      <LearningClassificationModal
        isOpen={isClassificationFrameOpen}
        onClose={() => setIsClassificationFrameOpen(false)}
      />
    </div>
  );
}
