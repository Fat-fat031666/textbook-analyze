import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Activity, Info, X } from 'lucide-react';

interface LearningClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LearningClassificationModal({ isOpen, onClose }: LearningClassificationModalProps) {
  if (!isOpen) return null;

  // 学习分类框架的结构（对应你提供的表格）
  const learningDomains = [
    {
      domain: "认知领域",
      icon: <Brain size={24} />,
      color: "bg-blue-500",
      items: [
        {
          title: "知识（陈述性知识）",
          children: ["事实与词汇", "概念", "原理、规则"]
        },
        {
          title: "智慧技能（包含程序性知识）",
          desc: "应用知识处理和解决问题的能力，根据程序化程度分为两类",
          children: [
            "技能（以运用已学规则为主）",
            "问题解决与创造性（生成新规则，产生新知识）"
          ]
        },
        {
          title: "认知策略（包含元认知知识）",
          children: []
        }
      ]
    },
    {
      domain: "情感领域",
      icon: <Heart size={24} />,
      color: "bg-pink-500",
      items: [
        {
          title: "",
          children: ["自我认识与社会性", "态度与品德", "行为习惯"]
        }
      ]
    },
    {
      domain: "动作领域",
      icon: <Activity size={24} />,
      color: "bg-orange-500",
      items: [
        {
          title: "",
          children: ["动作技能"]
        }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部区域 */}
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">学习目标分类框架</h3>
                <p className="text-sm text-slate-500">包含认知、情感、动作三大领域的分类体系</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>

            {/* 内容区域（分三大领域展示） */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {learningDomains.map((domain, domainIdx) => (
                <div key={domainIdx} className="mb-6">
                  {/* 领域标题栏 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded ${domain.color} text-white`}>
                      {domain.icon}
                    </div>
                    <h4 className="font-bold text-lg">{domain.domain}</h4>
                  </div>

                  {/* 领域下的子分类 */}
                  <div className="pl-2 space-y-3">
                    {domain.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg p-3">
                        {/* 子分类标题（如“知识”“智慧技能”） */}
                        {item.title && (
                          <h5 className="font-semibold mb-2">{item.title}</h5>
                        )}
                        {/* 子分类描述 */}
                        {item.desc && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{item.desc}</p>
                        )}
                        {/* 子分类的具体项（如“事实与词汇”） */}
                        <div className="flex flex-wrap gap-2">
                          {item.children.map((child, childIdx) => (
                            <span 
                              key={childIdx} 
                              className="px-2 py-1 bg-white dark:bg-gray-600 rounded-full text-sm border border-slate-200 dark:border-gray-500"
                            >
                              {child}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* 使用小贴士 */}
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-600" />
                  <h4 className="font-bold text-blue-600">设计小贴士</h4>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  教学设计时可从这三大领域全面设定目标：比如“掌握数学公式”（认知-知识）、“养成严谨的计算习惯”（情感-行为习惯）、“熟练使用绘图工具”（动作-动作技能）。
                </p>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="p-4 border-t dark:border-gray-700 flex justify-end">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                了解完毕
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 导出别名以保持向后兼容
export const ClassificationFrameModal = LearningClassificationModal;