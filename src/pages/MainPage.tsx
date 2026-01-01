// 主界面 - 双导航模式
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// 定义数据类型
export type KnowledgeType = '概念性知识' | '事实性知识' | '原理规则' | '技能' | '技能性知识';

export interface KnowledgePoint {
  id: string;
  description: string;
  type: KnowledgeType;
  theme: string;
  submitter?: string;
  status?: string;
}

export interface Section {
  id: string;
  name: string;
  knowledgePoints: KnowledgePoint[];
}

export interface Chapter {
  id: string;
  name: string;
  sections: Section[];
}

export interface Book {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Grade {
  id: string;
  name: string;
  books: Book[];
}

export interface EducationLevel {
  id: string;
  name: string;
  grades: Grade[];
}

export interface Subject {
  id: string;
  name: string;
  educationLevels: EducationLevel[];
}

export interface TextbookData {
  subjects: Subject[];
}

interface MainPageProps {
  textbookData: TextbookData;
  openClassificationFrame: () => void;
}

export default function MainPage({ textbookData, openClassificationFrame }: MainPageProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'type'>('directory');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedBook, setSelectedGradeBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedKnowledgeType, setSelectedKnowledgeType] = useState<KnowledgeType | 'all'>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // 当选择科目时，重置其他选择
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedEducationLevel(null);
    setSelectedGrade(null);
    setSelectedGradeBook(null);
    setSelectedChapter(null);
  };
  
  const navigate = useNavigate();

  // 切换展开/折叠状态
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 处理章节选择
  const handleSectionSelect = (sectionId: string) => {
    navigate(`/content/${sectionId}`);
  };

  // 过滤知识点类型
  const getFilteredKnowledgePoints = () => {
    const allPoints: {point: KnowledgePoint, location: string, subject: string}[] = [];
    
    textbookData.subjects.forEach(subject => {
      // 如果选择了特定科目，则只处理该科目
      if (selectedSubject && subject.id !== selectedSubject) {
        return;
      }
      
      subject.educationLevels.forEach(level => {
        level.grades.forEach(grade => {
          grade.books.forEach(book => {
            book.chapters.forEach(chapter => {
              chapter.sections.forEach(section => {
                section.knowledgePoints.forEach(point => {
                  allPoints.push({
                    point,
                    location: `${level.name} ${grade.name} ${book.name} ${chapter.name} ${section.name}`,
                    subject: subject.name
                  });
                });
              });
            });
          });
        });
      });
    });
    
    if (selectedKnowledgeType === 'all') {
      return allPoints;
    }
    
    return allPoints.filter(item => item.point.type === selectedKnowledgeType);
  };

  // 渲染目录树
  const renderDirectoryTree = () => {
    return (
      <div className="space-y-4">
        {/* 科目选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择科目</label>
          <div className="flex flex-wrap gap-2">
            {textbookData.subjects.map(subject => (
              <button
                key={subject.id}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedSubject === subject.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleSubjectChange(subject.id)}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* 目录树内容 */}
        {selectedSubject ? (
          <div className="space-y-4">
            {textbookData.subjects.find(s => s.id === selectedSubject)?.educationLevels.map(level => (
              <div key={level.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                  onClick={() => toggleExpand(`level-${level.id}`)}
                >
                  <span className="font-medium">{level.name}</span>
                  <i className={`fa-solid fa-chevron-down transition-transform ${expandedItems[`level-${level.id}`] ? 'rotate-180' : ''}`}></i>
                </button>
                
                {expandedItems[`level-${level.id}`] && (
                  <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-800 ml-4">
                    {level.grades.map(grade => (
                      <div key={grade.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-2">
                        <button
                          className="w-full px-4 py-2 flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                          onClick={() => toggleExpand(`grade-${grade.id}`)}
                        >
                          <span>{grade.name}</span>
                          <i className={`fa-solid fa-chevron-down transition-transform ${expandedItems[`grade-${grade.id}`] ? 'rotate-180' : ''}`}></i>
                        </button>
                        
                        {expandedItems[`grade-${grade.id}`] && (
                          <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-4">
                            {grade.books.map(book => (
                              <div key={book.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-2">
                                <button
                                  className="w-full px-4 py-2 flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                  onClick={() => toggleExpand(`book-${book.id}`)}
                                >
                                  <span>{book.name}</span>
                                  <i className={`fa-solid fa-chevron-down transition-transform ${expandedItems[`book-${book.id}`] ? 'rotate-180' : ''}`}></i>
                                </button>
                                
                                {expandedItems[`book-${book.id}`] && (
                                  <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-4">
                                    {book.chapters.map(chapter => (
                                      <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-2">
                                        <button
                                          className="w-full px-4 py-2 flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                          onClick={() => toggleExpand(`chapter-${chapter.id}`)}
                                        >
                                          <span>{chapter.name}</span>
                                          <i className={`fa-solid fa-chevron-down transition-transform ${expandedItems[`chapter-${chapter.id}`] ? 'rotate-180' : ''}`}></i>
                                        </button>
                                        
                                        {expandedItems[`chapter-${chapter.id}`] && (
                                          <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-4">
                                            {chapter.sections.map(section => (
                                              <button
                                                key={section.id}
                                                className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-lg mt-1 flex justify-between items-center"
                                                onClick={() => handleSectionSelect(section.id)}
                                              >
                                                <span>{section.name}</span>
                                                <i className="fa-solid fa-arrow-right text-blue-500"></i>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            请先选择一个科目
          </div>
        )}
      </div>
    );
  };

  // 渲染类型检索
  const renderTypeSearch = () => {
    const knowledgeTypes: KnowledgeType[] = ['概念性知识', '事实性知识', '原理规则', '技能'];
    const filteredPoints = getFilteredKnowledgePoints();

    return (
      <div className="space-y-4">
        {/* 科目选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择科目</label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedSubject === null 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleSubjectChange('')}
            >
              全部科目
            </button>
            
            {textbookData.subjects.map(subject => (
              <button
                key={subject.id}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedSubject === subject.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleSubjectChange(subject.id)}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {/* 知识类型选择 */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedKnowledgeType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedKnowledgeType('all')}
          >
            全部类型
          </button>
          
          {knowledgeTypes.map(type => (
            <button
              key={type}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedKnowledgeType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setSelectedKnowledgeType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 知识点列表 */}
        <div className="space-y-3">
          {filteredPoints.length > 0 ? (
            filteredPoints.map(({ point, location, subject }) => (
              <motion.div
                key={point.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  // 查找包含该知识点的章节
                  let targetSectionId = '';
                  textbookData.subjects.forEach(subj => {
                    subj.educationLevels.forEach(level => {
                      level.grades.forEach(grade => {
                        grade.books.forEach(book => {
                          book.chapters.forEach(chapter => {
                            chapter.sections.forEach(section => {
                              if (section.knowledgePoints.some(p => p.id === point.id)) {
                                targetSectionId = section.id;
                              }
                            });
                          });
                        });
                      });
                    });
                  });
                  
                  if (targetSectionId) {
                    navigate(`/content/${targetSectionId}`);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{point.description}</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs">
                    {subject}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>类型：{point.type}</span>
                  <span>{location}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              暂无符合条件的知识点
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">教材内容分析系统</h1>
        <p className="text-gray-600 dark:text-gray-400">系统化分析教材结构，优化教学设计</p>
      </header>

      {/* 导航模式切换 */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'directory' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          onClick={() => setActiveTab('directory')}
        >
          目录树导航
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'type' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          onClick={() => setActiveTab('type')}
        >
          类型检索导航
        </button>
      </div>

      {/* 主内容区域 */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-6xl mx-auto"
      >
        {activeTab === 'directory' ? renderDirectoryTree() : renderTypeSearch()}
      </motion.div>
    </div>
  );
}