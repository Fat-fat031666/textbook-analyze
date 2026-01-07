// 数据录入页面
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { knowledgePointAPI, optionAPI, themeAPI, sectionAPI } from '@/lib/api';
import { LearningClassificationModal } from '@/components/ClassificationFrameModal';

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
  const [isSaving, setIsSaving] = useState(false);
  const [customThemeInput, setCustomThemeInput] = useState('');
  const [showCustomThemeInput, setShowCustomThemeInput] = useState(false);
  const [isClassificationFrameOpen, setIsClassificationFrameOpen] = useState(false);
  const navigate = useNavigate();

  // 从后端获取选项数据
  const [availableThemes, setAvailableThemes] = useState<any[]>([]);
  const [cognitiveLevels, setCognitiveLevels] = useState<any[]>([]);
  const [knowledgeTypes, setKnowledgeTypes] = useState<any[]>([]);
  const [themeMap, setThemeMap] = useState<Map<string, number>>(new Map()); // 主题名称到ID的映射

  // 预设主题列表（可以从后端获取）
  const presetThemes = [
    '代数', '几何', '统计', '概率', '函数', '数论', '微积分',
    '现代文阅读', '古代诗文', '写作', '听力', '口语', '阅读'
  ];

  // 获取选项数据
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 获取知识类型列表
        const typesRes = await optionAPI.getKnowledgeTypes();
        setKnowledgeTypes(typesRes.knowledgeTypes || []);

        // 获取认知层级列表
        const levelsRes = await optionAPI.getCognitiveLevels();
        setCognitiveLevels(levelsRes.cognitiveLevels || []);

        // 获取主题列表
        const themesRes = await themeAPI.getList() as { themes?: Array<{ id: number; name: string }> };
        const themes = themesRes.themes || [];
        setAvailableThemes(themes.map((t: { id: number; name: string }) => t.name));
        
        // 创建主题名称到ID的映射
        const map = new Map<string, number>();
        themes.forEach((t: { id: number; name: string }) => {
          map.set(t.name, t.id);
        });
        setThemeMap(map);
      } catch (error) {
        console.error('获取选项数据失败:', error);
        // 如果API失败，使用预设主题
        setAvailableThemes(presetThemes);
      }
    };
    fetchOptions();
  }, []);

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理主题标签变化
  const handleThemeChange = (theme: string) => {
    setFormData((prev: typeof formData) => {
      if (prev.themes.includes(theme)) {
        return {
          ...prev,
          themes: prev.themes.filter((t: string) => t !== theme)
        };
      } else {
        return {
          ...prev,
          themes: [...prev.themes, theme]
        };
      }
    });
  };

  // 添加自定义主题
  const handleAddCustomTheme = async () => {
    if (!customThemeInput.trim()) {
      toast.error('请输入主题名称');
      return;
    }

    const themeName = customThemeInput.trim();
    
    if (formData.themes.includes(themeName)) {
      toast.error('该主题已存在');
      return;
    }

    // 检查主题是否已在预设列表中
    if (availableThemes.includes(themeName)) {
      // 如果已在预设列表中，直接添加
      setFormData((prev: typeof formData) => ({
        ...prev,
        themes: [...prev.themes, themeName]
      }));
      setCustomThemeInput('');
      setShowCustomThemeInput(false);
      toast.success('主题已添加');
      return;
    }

    // 如果是新主题，尝试查找或创建
    try {
      const themesRes = await themeAPI.getList() as { themes?: Array<{ id: number; name: string }> };
      const existingTheme = themesRes.themes?.find((t: { id: number; name: string }) => t.name === themeName);
      
      if (existingTheme) {
        // 主题已存在，添加到列表和映射
        setAvailableThemes((prev: string[]) => [...prev, themeName]);
        const newMap = new Map(themeMap);
        newMap.set(themeName, existingTheme.id);
        setThemeMap(newMap);
        setFormData((prev: typeof formData) => ({
          ...prev,
          themes: [...prev.themes, themeName]
        }));
        setCustomThemeInput('');
        setShowCustomThemeInput(false);
        toast.success('主题已添加');
      } else {
        // 主题不存在，添加到表单（创建时会在后端处理）
        setFormData((prev: typeof formData) => ({
          ...prev,
          themes: [...prev.themes, themeName]
        }));
        setAvailableThemes((prev: string[]) => [...prev, themeName]);
        setCustomThemeInput('');
        setShowCustomThemeInput(false);
        toast.success('自定义主题已添加（提交时将尝试创建）');
      }
    } catch (error) {
      // API调用失败，仍然允许添加（提交时处理）
      setFormData((prev: typeof formData) => ({
        ...prev,
        themes: [...prev.themes, themeName]
      }));
      setAvailableThemes((prev: string[]) => [...prev, themeName]);
      setCustomThemeInput('');
      setShowCustomThemeInput(false);
      toast.success('自定义主题已添加');
    }
  };

  // 处理难度等级变化
  const handleDifficultyChange = (value: number) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      difficulty: value
    }));
  };

  // 章和节已改为文本输入，不再需要动态更新选项

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

  // 辅助函数：将前端表单数据转换为后端需要的代码格式
  const getSectionCodes = () => {
    // 科目代码映射
    const subjectCodeMap: Record<string, string> = {
      'math': 'math',
      'chinese': 'chinese',
      'english': 'english',
      'physics': 'physics',
      'chemistry': 'chemistry',
      'biology': 'biology',
      'history': 'history',
      'geography': 'geography',
    };
    const subjectCode = subjectCodeMap[formData.subject] || formData.subject;

    // 学段代码映射
    const educationLevelCode = formData.educationLevel === '初中' ? 'junior' : formData.educationLevel === '高中' ? 'senior' : formData.educationLevel.toLowerCase();

    // 年级代码映射
    const gradeCodeMap: Record<string, string> = {
      '七年级': 'grade7',
      '八年级': 'grade8',
      '九年级': 'grade9',
      '高一年级': 'grade10',
      '高二年级': 'grade11',
      '高三年级': 'grade12',
    };
    const gradeCode = gradeCodeMap[formData.grade] || formData.grade.toLowerCase().replace(/\s+/g, '');

    // 册别代码映射
    const bookCode = formData.book === '上册' ? 'volume1' : formData.book === '下册' ? 'volume2' : formData.book.toLowerCase();

    return { subjectCode, educationLevelCode, gradeCode, bookCode };
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
      // 根据知识类型名称查找ID
      const knowledgeType = knowledgeTypes.find((kt: { id: number; name: string }) => kt.name === formData.knowledgeType);
      if (!knowledgeType) {
        toast.error('请选择有效的知识类型');
        setIsSaving(false);
        return;
      }

      // 将主题名称映射为ID（草稿可以不关联主题）
      const themeIds: number[] = [];
      const newThemeMap = new Map(themeMap);
      for (const themeName of formData.themes) {
        let themeId: number | undefined = newThemeMap.get(themeName) as number | undefined;
        if (themeId !== undefined) {
          themeIds.push(themeId);
        } else {
          // 尝试查找现有主题
          try {
            const themesRes = await themeAPI.getList() as { themes?: Array<{ id: number; name: string }> };
            const existingTheme = themesRes.themes?.find((t: { id: number; name: string }) => t.name === themeName);
            if (existingTheme) {
              themeIds.push(existingTheme.id);
              newThemeMap.set(themeName, existingTheme.id);
            }
          } catch (error) {
            console.error(`处理主题"${themeName}"失败:`, error);
          }
        }
      }
      setThemeMap(newThemeMap);

      // 查找或创建 Section（草稿可以不关联section，但如果提供了就保存）
      let sectionId: number | null = null;
      if (formData.chapter && formData.section) {
        try {
          const codes = getSectionCodes();
          const sectionRes = await sectionAPI.findOrCreate({
            subjectCode: codes.subjectCode,
            educationLevelCode: codes.educationLevelCode,
            gradeCode: codes.gradeCode,
            bookCode: codes.bookCode,
            chapterName: formData.chapter,
            sectionName: formData.section,
          });
          sectionId = sectionRes.section.id;
        } catch (error: any) {
          console.error('查找或创建 Section 失败:', error);
          toast.warning('章和节信息保存失败，但知识点已保存为草稿');
        }
      }
      
      // 确保 cognitiveLevelId 是有效的整数或 null
      let cognitiveLevelIdValue: number | null = null;
      if (formData.cognitiveLevel && formData.cognitiveLevel.trim() !== '') {
        const parsed = parseInt(formData.cognitiveLevel);
        if (!isNaN(parsed)) {
          cognitiveLevelIdValue = parsed;
        }
      }
      
      const createData: any = {
        content: formData.content.trim(),
        typeId: knowledgeType.id,
      };
      
      // 只添加非 null 的可选字段
      if (cognitiveLevelIdValue !== null) {
        createData.cognitiveLevelId = cognitiveLevelIdValue;
      }
      if (sectionId !== null) {
        createData.sectionId = sectionId;
      }
      if (themeIds.length > 0) {
        createData.themeIds = themeIds;
      }
      
      await knowledgePointAPI.create(createData);
      
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
      // 根据知识类型名称查找ID
      const knowledgeType = knowledgeTypes.find((kt: { id: number; name: string }) => kt.name === formData.knowledgeType);
      if (!knowledgeType) {
        toast.error('请选择有效的知识类型');
        setIsSaving(false);
        return;
      }

      // 将主题名称映射为ID
      const themeIds: number[] = [];
      const newThemeMap = new Map(themeMap);
      
      // 如果themeMap为空，重新加载主题数据
      if (newThemeMap.size === 0) {
        try {
          const themesRes = await themeAPI.getList() as { themes?: Array<{ id: number; name: string }> };
          const themes = themesRes.themes || [];
          themes.forEach((t: { id: number; name: string }) => {
            newThemeMap.set(t.name, t.id);
          });
          setThemeMap(newThemeMap);
        } catch (error) {
          console.error('重新加载主题数据失败:', error);
        }
      }
      
      for (const themeName of formData.themes) {
        let themeId: number | undefined = newThemeMap.get(themeName) as number | undefined;
        if (themeId !== undefined) {
          themeIds.push(themeId);
        } else {
          // 如果是自定义主题，尝试查找或创建
          try {
            const themesRes = await themeAPI.getList() as { themes?: Array<{ id: number; name: string }> };
            const existingTheme = themesRes.themes?.find((t: { id: number; name: string }) => t.name === themeName);
            if (existingTheme) {
              themeIds.push(existingTheme.id);
              newThemeMap.set(themeName, existingTheme.id);
            } else {
              console.warn(`主题"${themeName}"不存在于数据库中`);
              toast.warning(`主题"${themeName}"不存在，将跳过该主题`);
            }
          } catch (error) {
            console.error(`处理主题"${themeName}"失败:`, error);
            toast.warning(`查找主题"${themeName}"失败，将跳过该主题`);
          }
        }
      }
      setThemeMap(newThemeMap);

      if (themeIds.length === 0) {
        toast.error('请至少选择一个有效的主题。如果主题列表为空，请刷新页面重新加载数据。');
        setIsSaving(false);
        return;
      }
      
      console.log('主题映射结果:', {
        选择的主题: formData.themes,
        映射的ID: themeIds,
        主题映射表: Array.from(newThemeMap.entries())
      });

      // 查找或创建 Section
      let sectionId: number | null = null;
      if (formData.chapter && formData.section) {
        try {
          const codes = getSectionCodes();
          const sectionRes = await sectionAPI.findOrCreate({
            subjectCode: codes.subjectCode,
            educationLevelCode: codes.educationLevelCode,
            gradeCode: codes.gradeCode,
            bookCode: codes.bookCode,
            chapterName: formData.chapter,
            sectionName: formData.section,
          });
          sectionId = sectionRes.section.id;
        } catch (error: any) {
          console.error('查找或创建 Section 失败:', error);
          toast.error('章和节信息保存失败: ' + (error.message || '未知错误'));
          setIsSaving(false);
          return;
        }
      }
      
      // 先创建知识点
      // 确保 cognitiveLevelId 是有效的整数
      let cognitiveLevelIdValue: number | undefined = undefined;
      if (formData.cognitiveLevel && formData.cognitiveLevel.trim() !== '') {
        const parsed = parseInt(formData.cognitiveLevel, 10);
        if (!isNaN(parsed) && parsed > 0) {
          cognitiveLevelIdValue = parsed;
        }
      }
      
      const createData: any = {
        content: formData.content.trim(),
        typeId: knowledgeType.id,
      };
      
      // 只添加有值的可选字段（不发送 null 或 undefined）
      if (cognitiveLevelIdValue !== undefined) {
        createData.cognitiveLevelId = cognitiveLevelIdValue;
      }
      if (sectionId !== null && sectionId !== undefined) {
        createData.sectionId = sectionId;
      }
      if (themeIds.length > 0) {
        createData.themeIds = themeIds;
      }
      
      // 调试信息：显示所有字段的值
      console.log('表单数据检查:', {
        '认知层级原始值': formData.cognitiveLevel,
        '认知层级解析后': cognitiveLevelIdValue,
        'sectionId': sectionId,
        'themeIds': themeIds,
        'themeIds长度': themeIds.length,
        '所有表单字段': formData
      });
      console.log('最终发送的数据:', JSON.stringify(createData, null, 2));
      
      const result = await knowledgePointAPI.create(createData);
      
      // 然后提交审核
      const resultData = result as { knowledgePoint?: { id: number }; id?: number };
      const kpId = resultData.knowledgePoint?.id || resultData.id;
      if (kpId) {
        await knowledgePointAPI.submitForReview(kpId);
        toast.success('已提交审核，请等待审核结果');
        navigate('/dashboard');
      } else {
        throw new Error('创建知识点失败，未返回ID');
      }
    } catch (error: any) {
      console.error('提交审核错误:', error);
      // 显示更详细的错误信息
      if (error.message) {
        toast.error(error.message);
      } else if (error.details && Array.isArray(error.details)) {
        const errorMessages = error.details.map((d: any) => d.msg || d.message).join(', ');
        toast.error(`验证失败: ${errorMessages}`);
      } else if (error.error) {
        toast.error(error.error);
      } else {
        toast.error('提交失败，请重试');
      }
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
            <option value="人教版">人教版</option>
            <option value="北师大版">北师大版</option>
            <option value="苏教版">苏教版</option>
            <option value="沪教版">沪教版</option>
            <option value="湘教版">湘教版</option>
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
            {formData.educationLevel === '初中' && (
              <>
                <option value="七年级">七年级</option>
                <option value="八年级">八年级</option>
                <option value="九年级">九年级</option>
              </>
            )}
            {formData.educationLevel === '高中' && (
              <>
                <option value="高一年级">高一年级</option>
                <option value="高二年级">高二年级</option>
                <option value="高三年级">高三年级</option>
              </>
            )}
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
            <option value="上册">上册</option>
            <option value="下册">下册</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            章 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="chapter"
            name="chapter"
            value={formData.chapter}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            placeholder="请输入章名称，如：第一章 有理数"
          />
        </div>

        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            节 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            placeholder="请输入节名称，如：1.1 正数和负数"
          />
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
            {knowledgeTypes.length > 0 ? (
              knowledgeTypes.map((type: { id: number; name: string }) => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))
            ) : (
              <>
                <option value="事实性知识">事实性知识</option>
                <option value="概念性知识">概念性知识</option>
                <option value="原理规则">原理规则</option>
                <option value="技能">技能</option>
              </>
            )}
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
        <div className="space-y-3">
          {/* 预设主题 */}
          <div className="flex flex-wrap gap-2">
            {availableThemes.length > 0 ? (
              availableThemes.map((themeName: string) => (
                <button
                  key={themeName}
                  type="button"
                  onClick={() => handleThemeChange(themeName)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.themes.includes(themeName)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {themeName}
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500">主题数据加载中...</div>
            )}
          </div>

          {/* 自定义主题输入 */}
          {showCustomThemeInput ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={customThemeInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomThemeInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTheme();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="输入自定义主题名称"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomTheme}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                添加
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomThemeInput(false);
                  setCustomThemeInput('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomThemeInput(true)}
              className="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors text-sm"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              添加自定义主题
            </button>
          )}

          {/* 已选主题显示 */}
          {formData.themes.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">已选主题：</div>
              <div className="flex flex-wrap gap-2">
                {formData.themes.map((theme: string) => (
                  <span
                    key={theme}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                  >
                    {theme}
                    <button
                      type="button"
                      onClick={() => handleThemeChange(theme)}
                      className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <i className="fa-solid fa-times text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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
            {cognitiveLevels.length > 0 ? (
              cognitiveLevels.map((level: { id: number; name: string; level: number }) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))
            ) : (
              <>
                <option value="">认知层级数据加载中...</option>
                <option value="1">识记</option>
                <option value="2">理解</option>
                <option value="3">应用</option>
                <option value="4">分析</option>
                <option value="5">综合</option>
                <option value="6">评价</option>
              </>
            )}
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
          <button
            onClick={() => setIsClassificationFrameOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-info-circle"></i>
            <span>分类框架说明</span>
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
      
      {/* 分类框架说明弹窗 */}
      <LearningClassificationModal
        isOpen={isClassificationFrameOpen}
        onClose={() => setIsClassificationFrameOpen(false)}
      />
    </div>
  );
}