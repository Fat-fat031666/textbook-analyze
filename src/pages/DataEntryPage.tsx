// 数据录入页面
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { knowledgePointAPI } from '@/lib/api';

export default function DataEntryPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: '',
    textbookVersion: '',
    educationLevel: '',
    grade: '',
    book: '',
    chapter: '',
    section: '',
    content: '',
    knowledgeType: '',
    themes: [] as string[],
    teachingTip: '',
    difficulty: 1,
    cognitiveLevel: ''
  });
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // 模拟主题标签
  const availableThemes = ['代数', '几何', '统计', '概率', '函数', '数论', '微积分', '现代文阅读', '古代诗文', '写作', '听力', '口语', '阅读', '写作'];

  // 模拟认知层级
  const cognitiveLevels = ['记忆', '理解', '应用', '分析', '评价', '创造'];

  // 模拟教材版本数据
  const textbookVersions = ['人教版', '北师大版', '苏教版', '沪教版', '湘教版'];

  // 模拟年级数据
  const grades = {
    '初中': ['七年级', '八年级', '九年级'],
    '高中': ['高一年级', '高二年级', '高三年级']
  };

  // 模拟册别数据
  const books = ['上册', '下册'];

  // 模拟章节数据
  const chaptersData = {
    '七年级': {
      '上册': ['第一章 有理数', '第二章 整式的加减', '第三章 一元一次方程'],
      '下册': ['第五章 相交线与平行线', '第六章 实数', '第七章 平面直角坐标系']
    }
  };

  // 模拟节数据
  const sectionsData = {
    '第一章 有理数': ['1.1 正数和负数', '1.2 有理数', '1.3 有理数的加减法'],
    '第二章 整式的加减': ['2.1 整式', '2.2 整式的加减']
  };

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理主题标签变化
  const handleThemeChange = (theme: string) => {
    setFormData(prev => {
      if (prev.themes.includes(theme)) {
        return {
          ...prev,
          themes: prev.themes.filter(t => t !== theme)
        };
      } else {
        return {
          ...prev,
          themes: [...prev.themes, theme]
        };
      }
    });
  };

  // 处理难度等级变化
  const handleDifficultyChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      difficulty: value
    }));
  };

  // 当教材层级变化时，更新可选的下一级数据
  useEffect(() => {
    if (formData.educationLevel && formData.grade && formData.book) {
      if (chaptersData[formData.grade] && chaptersData[formData.grade][formData.book]) {
        setAvailableChapters(chaptersData[formData.grade][formData.book]);
      } else {
        setAvailableChapters([]);
      }
      setFormData(prev => ({ ...prev, chapter: '', section: '' }));
      setAvailableSections([]);
    }
  }, [formData.educationLevel, formData.grade, formData.book]);

  // 当章节变化时，更新可选的节数据
  useEffect(() => {
    if (formData.chapter) {
      if (sectionsData[formData.chapter]) {
        setAvailableSections(sectionsData[formData.chapter]);
      } else {
        setAvailableSections([]);
      }
      setFormData(prev => ({ ...prev, section: '' }));
    }
  }, [formData.chapter]);

  // 自动保存草稿
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 2 && formData.content) {
        // 这里可以实现自动保存草稿的逻辑
        toast.info('草稿已自动保存');
      }
    }, 30000); // 30秒自动保存一次

    return () => clearTimeout(timer);
  }, [formData, step]);

  // 进入下一步
  const handleNextStep = () => {
    if (step === 1) {
      // 验证第一步表单
       if (!formData.subject || !formData.textbookVersion || !formData.educationLevel || !formData.grade || !formData.book || !formData.chapter || !formData.section) {
        toast.error('请完成所有教材定位信息');
        return;
      }
    }
    setStep(step + 1);
  };

  // 返回上一步
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/dashboard');
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    // 验证必填字段
    if (!formData.content || !formData.knowledgeType) {
      toast.error('请至少填写知识点内容和类型');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // TODO: 需要实现类型ID和主题ID的映射
      // 这里需要根据实际的知识类型名称获取对应的ID
      const typeId = 1; // 临时值，需要从后端获取知识类型列表
      
      await knowledgePointAPI.create({
        content: formData.content,
        typeId: typeId,
        cognitiveLevelId: formData.cognitiveLevel ? parseInt(formData.cognitiveLevel) : null,
        sectionId: null, // TODO: 根据选择的章节获取sectionId
        themeIds: [], // TODO: 根据选择的主题获取themeIds
        versionTag: null,
      });
      
      toast.success('草稿保存成功');
    } catch (error: any) {
      console.error('保存草稿错误:', error);
      toast.error(error.message || '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 提交审核
  const handleSubmitReview = async () => {
    // 验证第二步表单
    if (!formData.content || !formData.knowledgeType || formData.themes.length === 0) {
      toast.error('请完成所有必填字段');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 先创建知识点
      const typeId = 1; // TODO: 需要从后端获取
      const result = await knowledgePointAPI.create({
        content: formData.content,
        typeId: typeId,
        cognitiveLevelId: formData.cognitiveLevel ? parseInt(formData.cognitiveLevel) : null,
        sectionId: null,
        themeIds: [],
        versionTag: null,
      });
      
      // 然后提交审核
      const kpId = result.knowledgePoint?.id || result.id;
      if (kpId) {
        await knowledgePointAPI.submitForReview(kpId);
        toast.success('已提交审核，请等待审核结果');
        navigate('/dashboard');
      } else {
        throw new Error('创建知识点失败，未返回ID');
      }
    } catch (error: any) {
      console.error('提交审核错误:', error);
      toast.error(error.message || '提交失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 渲染第一步：选择教材定位
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            科目 <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">请选择科目</option>
            <option value="math">数学</option>
            <option value="chinese">语文</option>
            <option value="english">英语</option>
            <option value="physics">物理</option>
            <option value="chemistry">化学</option>
            <option value="biology">生物</option>
            <option value="history">历史</option>
            <option value="geography">地理</option>
          </select>
        </div>

        <div>
          <label htmlFor="textbookVersion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            教材版本 <span className="text-red-500">*</span>
          </label>
          <select
            id="textbookVersion"
            name="textbookVersion"
            value={formData.textbookVersion}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">请选择教材版本</option>
            {textbookVersions.map(version => (
              <option key={version} value={version}>{version}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            学段 <span className="text-red-500">*</span>
          </label>
          <select
            id="educationLevel"
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">请选择学段</option>
            <option value="初中">初中</option>
            <option value="高中">高中</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            年级 <span className="text-red-500">*</span>
          </label>
          <select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            disabled={!formData.educationLevel}
          >
            <option value="">请选择年级</option>
            {formData.educationLevel && grades[formData.educationLevel as keyof typeof grades] && 
              grades[formData.educationLevel as keyof typeof grades].map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))
            }
          </select>
        </div>

        <div>
          <label htmlFor="book" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            册别 <span className="text-red-500">*</span>
          </label>
          <select
            id="book"
            name="book"
            value={formData.book}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">请选择册别</option>
            {books.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            章 <span className="text-red-500">*</span>
          </label>
          <select
            id="chapter"
            name="chapter"
            value={formData.chapter}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            disabled={availableChapters.length === 0}
          >
            <option value="">请选择章</option>
            {availableChapters.map(chapter => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            节 <span className="text-red-500">*</span>
          </label>
          <select
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            disabled={availableSections.length === 0}
          >
            <option value="">请选择节</option>
            {availableSections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // 渲染第二步：填写知识点信息
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          内容描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          placeholder="请详细描述知识点内容..."
        ></textarea>
        <div className="flex justify-between items-center mt-1">
          <div className="flex gap-2">
            <button type="button" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <i className="fa-solid fa-image mr-1"></i> 插入图片
            </button>
            <button type="button" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <i className="fa-solid fa-square-root-variable mr-1"></i> 插入公式
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formData.content.length}/5000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="knowledgeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            知识类型 <span className="text-red-500">*</span>
          </label>
          <select
            id="knowledgeType"
            name="knowledgeType"
            value={formData.knowledgeType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">请选择知识类型</option>
            <option value="事实性知识">事实性知识</option>
            <option value="概念性知识">概念性知识</option>
            <option value="原理规则">原理规则</option>
            <option value="技能性知识">技能性知识</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            难度等级 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => handleDifficultyChange(level)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  formData.difficulty >= level
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <i className="fa-solid fa-star"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          所属主题（可多选） <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableThemes.map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => handleThemeChange(theme)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.themes.includes(theme)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cognitiveLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            认知层级
          </label>
          <select
            id="cognitiveLevel"
            name="cognitiveLevel"
            value={formData.cognitiveLevel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">请选择认知层级</option>
            {cognitiveLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="teachingTip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          教学提示
        </label>
        <textarea
          id="teachingTip"
          name="teachingTip"
          value={formData.teachingTip}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          placeholder="请输入教学提示（选填）..."
        ></textarea>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <button 
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>返回工作台</span>
          </button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">数据录入</h1>
          
          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                1
              </div>
              <span className="text-sm">选择教材定位</span>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                2
              </div>
              <span className="text-sm">填写知识点信息</span>
            </div>
          </div>

          {/* 表单内容 */}
          {step === 1 ? renderStep1() : renderStep2()}
        </motion.div>

        {/* 操作按钮 */}
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrevStep}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {step === 1 ? '取消' : '上一步'}
          </motion.button>
          
          {step === 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNextStep}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              下一步
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isSaving ? '保存中...' : '保存草稿'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitReview}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isSaving ? '提交中...' : '提交审核'}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}