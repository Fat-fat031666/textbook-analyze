// 内容分析详情页
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KnowledgePoint, Section, TextbookData } from './MainPage';

interface ContentDetailPageProps {
  textbookData: TextbookData;
  openClassificationFrame: () => void;
}

export default function ContentDetailPage({ textbookData, openClassificationFrame }: ContentDetailPageProps) {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [section, setSection] = useState<Section | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'type' | 'theme'>('id');
  const [sortedPoints, setSortedPoints] = useState<KnowledgePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [selectedCommentPoint, setSelectedCommentPoint] = useState('');
  const [sortCommentsBy, setSortCommentsBy] = useState<'latest' | 'hottest'>('latest');
  const navigate = useNavigate();

  // 定义评论类型
  interface Comment {
    id: string;
    content: string;
    author: string;
    authorRole: string;
    authorAvatar: string;
    date: string;
    likes: number;
    replies: Reply[];
    knowledgePointId?: string;
    knowledgePointName?: string;
    isLiked?: boolean;
  }

  interface Reply {
    id: string;
    content: string;
    author: string;
    authorRole: string;
    date: string;
    likes: number;
    isLiked?: boolean;
  }

  // 查找指定章节
  useEffect(() => {
    if (!sectionId) return;

    let foundSection: Section | null = null;
    
    textbookData.educationLevels.forEach(level => {
      level.grades.forEach(grade => {
        grade.books.forEach(book => {
          book.chapters.forEach(chapter => {
            chapter.sections.forEach(s => {
              if (s.id === sectionId) {
                // 为知识点添加模拟数据
                s.knowledgePoints = s.knowledgePoints.map(point => ({
                  ...point,
                  submitter: ['张老师', '李老师', '王老师'][Math.floor(Math.random() * 3)],
                  status: ['已发布', '待审核', '已发布', '已发布'][Math.floor(Math.random() * 4)]
                }));
                foundSection = s;
              }
            });
          });
        });
      });
    });

    setSection(foundSection);
  }, [sectionId, textbookData]);

  // 筛选和排序知识点
  useEffect(() => {
    if (!section) return;

    let filtered = [...section.knowledgePoints];
    
    // 按知识类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(point => point.type === filterType);
    }
    
    // 按审核状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(point => point.status === filterStatus);
    }
    
    // 排序
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'id') {
        return a.id.localeCompare(b.id);
      } else if (sortBy === 'type') {
        return a.type.localeCompare(b.type);
      } else {
        return a.theme.localeCompare(b.theme);
      }
    });
    
    setSortedPoints(sorted);
  }, [section, filterType, filterStatus, sortBy]);

  // 初始化评论数据
  useEffect(() => {
    if (section) {
      const mockComments: Comment[] = [
        {
          id: '1',
          content: '这一节的概念性知识点讲解很清晰，有助于学生建立基础认知。特别是正数和负数的对比讲解，建议增加更多生活中的实例帮助学生理解。',
          author: '张老师',
          authorRole: '一线教师',
          authorAvatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=teacher%20avatar%20male&sign=3511fc344dfd373fab848342d8ab656d',
          date: '2024-01-15 09:30',
          likes: 8,
          replies: [
            {
              id: '1-1',
              content: '同意您的观点，生活实例确实能帮助学生更好地理解抽象概念。',
              author: '李教研员',
              authorRole: '教研员',
              date: '2024-01-15 10:15',
              likes: 3
            }
          ]
        },
        {
          id: '2',
          content: '有理数的分类部分可以再细化一些，将整数、分数、正有理数、负有理数等关系用图表展示会更直观。',
          author: '王教授',
          authorRole: '教研员',
          authorAvatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=professor%20avatar%20male&sign=81b9225413da35f31873938518b1454b',
          date: '2024-01-14 14:20',
          likes: 12,
          replies: [],
          knowledgePointId: section.knowledgePoints[0]?.id,
          knowledgePointName: section.knowledgePoints[0]?.description
        },
        {
          id: '3',
          content: '数轴的三要素讲解很到位，但建议增加如何利用数轴比较有理数大小的内容。',
          author: '刘老师',
          authorRole: '一线教师',
          authorAvatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=teacher%20avatar%20female&sign=7ce2dc7b76661cc1347db5fdddd190fd',
          date: '2024-01-13 16:45',
          likes: 5,
          replies: []
        }
      ];
      setComments(mockComments);
    }
  }, [section]);

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">章节不存在</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => navigate('/main')}
          >
            返回主页面
          </button>
        </div>
      </div>
    );
  }

  // 获取章节所属的位置信息
  const getSectionLocation = () => {
    let location = '';
    let fullLocation = '';
    let version = '人教版'; // 模拟教材版本
    
    textbookData.educationLevels.forEach(level => {
      level.grades.forEach(grade => {
        grade.books.forEach(book => {
          book.chapters.forEach(chapter => {
            chapter.sections.forEach(s => {
              if (s.id === sectionId) {
                location = `${level.name} ${grade.name} ${book.name} ${chapter.name}`;
                fullLocation = `${version} ${level.name} ${grade.name} ${book.name} ${chapter.name} ${section.name}`;
              }
            });
          });
        });
      });
    });
    
    return { location, fullLocation };
  };

  // 获取面包屑导航路径
  const getBreadcrumbs = () => {
    const { fullLocation } = getSectionLocation();
    const parts = fullLocation.split(' ');
    const crumbs = [];
    
    crumbs.push({ name: '首页', path: '/dashboard' });
    
    if (parts.length >= 1) crumbs.push({ name: parts[0], path: '' });
    if (parts.length >= 2) crumbs.push({ name: parts[1], path: '' });
    if (parts.length >= 3) crumbs.push({ name: parts[2], path: '' });
    if (parts.length >= 4) crumbs.push({ name: parts[3], path: '' });
    if (parts.length >= 5) crumbs.push({ name: parts[4], path: '' });
    if (parts.length >= 6) crumbs.push({ name: parts[5], path: '', isActive: true });
    
    return crumbs;
  };

  // 处理点赞
  const handleLikeComment = (commentId: string) => {
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          };
        }
        return comment;
      })
    );
  };

  // 处理回复点赞
  const handleLikeReply = (commentId: string, replyId: string) => {
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked
                };
              }
              return reply;
            })
          };
        }
        return comment;
      })
    );
  };

  // 提交评论
  const handleSubmitComment = () => {
    if (!commentInput.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content: commentInput,
      author: '当前用户',
      authorRole: '一线教师',
      authorAvatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=user%20avatar&sign=f1f81b57b203e2aa336aa3ec3f6e3f7f',
      date: new Date().toLocaleString(),
      likes: 0,
      replies: []
    };
    
    // 如果选择了知识点，则关联知识点
    if (selectedCommentPoint) {
      const point = section.knowledgePoints.find(p => p.id === selectedCommentPoint);
      if (point) {
        newComment.knowledgePointId = point.id;
        newComment.knowledgePointName = point.description;
      }
    }
    
    setComments(prevComments => [newComment, ...prevComments]);
    setCommentInput('');
    setSelectedCommentPoint('');
  };

  // 排序评论
  const sortedComments = [...comments].sort((a, b) => {
    if (sortCommentsBy === 'latest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      // 按热度排序（点赞数+回复数）
      const aHeat = a.likes + a.replies.length;
      const bHeat = b.likes + b.replies.length;
      return bHeat - aHeat;
    }
  });

  // 导出数据
  const handleExport = () => {
    // 模拟导出功能
    alert('数据导出成功！');
  };

  const { location } = getSectionLocation();
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* 面包屑导航 */}
      <div className="mb-6 text-sm">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
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
            </React.Fragment>
          ))}
        </div>
      </div>

      <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">{section.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{location}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={openClassificationFrame}
          >
            <i className="fa-solid fa-info-circle"></i>
            <span>分类框架说明</span>
          </button>
          
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            onClick={handleExport}
          >
            <i className="fa-solid fa-download"></i>
            <span>导出数据</span>
          </button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {/* 章节信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                知识点总数: {section.knowledgePoints.length}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
                已发布: {section.knowledgePoints.filter(p => p.status === '已发布').length}
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm">
                待审核: {section.knowledgePoints.filter(p => p.status === '待审核').length}
              </span>
            </div>
            
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1">
              <span>查看版本历史</span>
              <i className="fa-solid fa-history"></i>
            </button>
          </div>
        </div>

        {/* 筛选和排序控制 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">知识类型:</label>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterType === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilterType('all')}
              >
                全部
              </button>
              
              {/* 动态生成知识类型筛选按钮 */}
              {[...new Set(section.knowledgePoints.map(p => p.type))].map(type => (
                <button
                  key={type}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filterType === type 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">审核状态:</label>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                全部
              </button>
              
              {/* 动态生成审核状态筛选按钮 */}
              {[...new Set(section.knowledgePoints.map(p => p.status))].map(status => (
                <button
                  key={status}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filterStatus === status 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400">排序方式:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'id' | 'type' | 'theme')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="id">按序号</option>
              <option value="type">按知识类型</option>
              <option value="theme">按主题</option>
            </select>
          </div>
        </div>

        {/* 知识点表格 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 overflow-x-auto mb-6">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">序号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">内容描述</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">知识类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">所属主题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">提交人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">审核状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedPoints.length > 0 ? (
                sortedPoints.map((point, index) => (
                  <React.Fragment key={point.id}>
                    <tr 
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                      onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{point.description}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          point.type === '概念性知识' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : point.type === '事实性知识'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : point.type === '原理规则'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {point.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{point.theme}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{point.submitter}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          point.status === '已发布' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {point.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCommentPoint(point.id);
                          }}>
                          <i className="fa-solid fa-comment"></i>
                        </button>
                      </td>
                    </tr>
                    
                    {/* 展开行 */}
                    {selectedPoint === point.id && (
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
                        <td colSpan={7} className="p-4">
                          <div className="space-y-3">
                            <p className="text-sm"><strong>详细内容：</strong> {point.description}</p>
                            <p className="text-sm"><strong>知识类型：</strong> {point.type}</p>
                            <p className="text-sm"><strong>所属主题：</strong> {point.theme}</p>
                            <p className="text-sm"><strong>提交人：</strong> {point.submitter}</p>
                            <p className="text-sm"><strong>状态：</strong> {point.status}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    暂无符合条件的知识点
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 互动评论区 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">互动评论</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">排序方式:</label>
              <select
                value={sortCommentsBy}
                onChange={(e) => setSortCommentsBy(e.target.value as 'latest' | 'hottest')}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
              >
                <option value="latest">最新</option>
                <option value="hottest">最热</option>
              </select>
            </div>
          </div>

          {/* 评论输入框 */}
          <div className="mb-6">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <img 
                  src="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=user%20avatar&sign=f1f81b57b203e2aa336aa3ec3f6e3f7f" 
                  alt="用户头像" 
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  {section.knowledgePoints.length > 0 && (
                    <div className="mb-2">
                      <select
                        value={selectedCommentPoint}
                        onChange={(e) => setSelectedCommentPoint(e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm w-full"
                      >
                        <option value="">评论整节内容</option>
                        {section.knowledgePoints.map(point => (
                          <option key={point.id} value={point.id}>{point.description}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    rows={3}
                    placeholder="写下您的评论或建议..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  ></textarea>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <button type="button" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <i className="fa-solid fa-image mr-1"></i> 插入图片
                      </button>
                      <button type="button" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <i className="fa-solid fa-link mr-1"></i> 插入链接
                      </button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitComment}
                      disabled={!commentInput.trim()}
                      className={`px-4 py-1 rounded text-sm transition-colors ${
                        commentInput.trim() 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      发布评论
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 评论列表 */}
          <div className="space-y-6">
            {sortedComments.length > 0 ? (
              sortedComments.map(comment => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <img 
                      src={comment.authorAvatar} 
                      alt={comment.author} 
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium">{comment.author}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded text-xs">
                          {comment.authorRole}
                        </span>
                        {comment.knowledgePointName && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                            关于: {comment.knowledgePointName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{comment.content}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{comment.date}</span>
                        <button 
                          className="flex items-center gap-1 hover:text-red-500"
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <i className={`fa-solid ${comment.isLiked ? 'fa-heart text-red-500' : 'fa-heart'}`}></i>
                          <span>{comment.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500">
                          <i className="fa-solid fa-reply"></i>
                          <span>{comment.replies.length}</span>
                        </button>
                      </div>

                      {/* 回复列表 */}
                      {comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="flex gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <i className="fa-solid fa-user text-xs text-gray-500 dark:text-gray-400"></i>
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-medium">{reply.author}</span>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded text-xs">
                                    {reply.authorRole}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{reply.content}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{reply.date}</span>
                                  <button 
                                    className="flex items-center gap-1 hover:text-red-500"
                                    onClick={() => handleLikeReply(comment.id, reply.id)}
                                  >
                                    <i className={`fa-solid ${reply.isLiked ? 'fa-heart text-red-500' : 'fa-heart'}`}></i>
                                    <span>{reply.likes}</span>
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-blue-500">
                                    <i className="fa-solid fa-reply"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                暂无评论，快来发表第一条评论吧！
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}