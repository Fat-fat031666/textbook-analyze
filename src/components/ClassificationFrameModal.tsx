// 分类框架说明弹窗
import { motion, AnimatePresence } from 'framer-motion';

interface ClassificationFrameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClassificationFrameModal({ isOpen, onClose }: ClassificationFrameModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">知识分类框架说明</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="关闭"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                知识分类体系是认知领域的重要框架，有助于教育工作者更好地理解和组织教学内容。以下是知识分类体系的核心层次：
              </p>
            </div>

            {/* 思维导图样式的分类展示 */}
            <div className="flex flex-col items-center mb-8">
              {/* 中心节点 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md mb-10 text-center max-w-xs"
              >
                <h3 className="font-bold text-lg">认知领域知识体系</h3>
              </motion.div>

              {/* 连接线 */}
              <div className="h-10 w-1 bg-blue-300 dark:bg-blue-700 mb-10"></div>

              {/* 第一层节点 - 横向排列 */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-12 mb-12">
                {[
                  { title: "事实性知识", color: "bg-green-500", description: "关于具体事物和现象的基本事实" },
                  { title: "概念性知识", color: "bg-blue-500", description: "关于分类和类别的知识" },
                  { title: "原理规则", color: "bg-purple-500", description: "关于事物之间关系的知识" },
                  { title: "技能", color: "bg-orange-500", description: "应用知识解决问题的能力" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`${item.color} text-white rounded-lg shadow-md p-4 max-w-[200px] text-center`}
                  >
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-sm opacity-90">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 详细说明 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">1. 事实性知识</h3>
                <p className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-green-400 dark:border-green-600">
                  事实性知识是关于具体事物和现象的基本事实，是学生构建更复杂知识体系的基础。例如：数学中的定义、物理中的常数、历史事件的时间等。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">2. 概念性知识</h3>
                <p className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-blue-400 dark:border-blue-600">
                  概念性知识是关于分类和类别的知识，帮助学生理解事物的本质特征和相互关系。例如：数学中的数集概念、生物学中的分类系统等。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">3. 原理规则</h3>
                <p className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-purple-400 dark:border-purple-600">
                  原理规则是关于事物之间关系的知识，描述了事物如何运作或为什么会发生。例如：数学中的运算定律、物理中的牛顿定律、化学中的反应方程式等。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">4. 技能</h3>
                <p className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-orange-400 dark:border-orange-600">
                  技能是应用知识解决问题的能力，是将理论转化为实践的关键。例如：数学中的解题技巧、语言中的写作能力、实验操作技能等。
                </p>
              </div>
            </div>

            {/* 应用价值 */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">教育应用价值</h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>帮助教师明确教学目标和重点</li>
                <li>指导教学设计和教学策略选择</li>
                <li>促进学生知识结构的系统化和整合</li>
                <li>为教学评价提供科学依据</li>
                <li>优化学习路径，提高学习效率</li>
              </ul>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              关闭
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}