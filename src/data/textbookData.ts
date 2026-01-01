// 示例数据 - 教材知识点
import { TextbookData } from '@/pages/MainPage';

export const textbookData: TextbookData = {
  subjects: [
    {
      id: 'math',
      name: '数学',
      educationLevels: [
        {
          id: 'junior',
          name: '初中',
          grades: [
            {
              id: 'grade7',
              name: '七年级',
              books: [
                {
                  id: 'book7_1',
                  name: '上册',
                  chapters: [
                    {
                      id: 'chapter1',
                      name: '第一章 《有理数》',
                      sections: [
                        {
                          id: 'section1_1',
                          name: '1.1 正数和负数',
                          knowledgePoints: [
                            {
                              id: 'kp1',
                              description: '正数的定义和表示方法',
                              type: '概念性知识',
                              theme: '有理数的基本概念'
                            },
                            {
                              id: 'kp2',
                              description: '负数的定义和表示方法',
                              type: '概念性知识',
                              theme: '有理数的基本概念'
                            },
                            {
                              id: 'kp3',
                              description: '正数和负数在实际生活中的应用',
                              type: '事实性知识',
                              theme: '有理数的实际应用'
                            },
                            {
                              id: 'kp4',
                              description: '0的特殊意义',
                              type: '事实性知识',
                              theme: '有理数的基本概念'
                            },
                            {
                              id: 'kp5',
                              description: '用正负数表示相反意义的量',
                              type: '技能',
                              theme: '有理数的实际应用'
                            }
                          ]
                        },
                        {
                          id: 'section1_2',
                          name: '1.2 有理数',
                          knowledgePoints: [
                            {
                              id: 'kp6',
                              description: '有理数的定义',
                              type: '概念性知识',
                              theme: '有理数的分类'
                            },
                            {
                              id: 'kp7',
                              description: '有理数的分类方法',
                              type: '原理规则',
                              theme: '有理数的分类'
                            },
                            {
                              id: 'kp8',
                              description: '整数、分数与有理数的关系',
                              type: '原理规则',
                              theme: '有理数的分类'
                            },
                            {
                              id: 'kp9',
                              description: '数轴的定义和三要素',
                              type: '概念性知识',
                              theme: '数轴与有理数'
                            },
                            {
                              id: 'kp10',
                              description: '用数轴上的点表示有理数',
                              type: '技能',
                              theme: '数轴与有理数'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'senior',
          name: '高中',
          grades: [
            {
              id: 'grade10',
              name: '高一年级',
              books: [
                {
                  id: 'book10_1',
                  name: '上册',
                  chapters: [
                    {
                      id: 'chapter2',
                      name: '第一章 《集合与函数概念》',
                      sections: [
                        {
                          id: 'section2_1',
                          name: '1.1 集合的含义与表示',
                          knowledgePoints: [
                            {
                              id: 'kp11',
                              description: '集合的含义',
                              type: '概念性知识',
                              theme: '集合的基本概念'
                            },
                            {
                              id: 'kp12',
                              description: '集合中元素的特性',
                              type: '原理规则',
                              theme: '集合的基本概念'
                            },
                            {
                              id: 'kp13',
                              description: '集合的表示方法',
                              type: '技能',
                              theme: '集合的表示'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'chinese',
      name: '语文',
      educationLevels: [
        {
          id: 'junior',
          name: '初中',
          grades: [
            {
              id: 'grade7',
              name: '七年级',
              books: [
                {
                  id: 'book7_1',
                  name: '上册',
                  chapters: [
                    {
                      id: 'chapter1',
                      name: '第一单元 成长的故事',
                      sections: [
                        {
                          id: 'section1_1',
                          name: '1. 从百草园到三味书屋',
                          knowledgePoints: [
                            {
                              id: 'kp21',
                              description: '鲁迅的文学风格',
                              type: '概念性知识',
                              theme: '现代文学'
                            },
                            {
                              id: 'kp22',
                              description: '百草园与三味书屋的对比手法',
                              type: '原理规则',
                              theme: '写作技巧'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'english',
      name: '英语',
      educationLevels: [
        {
          id: 'junior',
          name: '初中',
          grades: [
            {
              id: 'grade7',
              name: '七年级',
              books: [
                {
                  id: 'book7_1',
                  name: '上册',
                  chapters: [
                    {
                      id: 'chapter1',
                      name: 'Unit 1 My name is Gina',
                      sections: [
                        {
                          id: 'section1_1',
                          name: 'Section A',
                          knowledgePoints: [
                            {
                              id: 'kp31',
                              description: '英语自我介绍的基本用语',
                              type: '事实性知识',
                              theme: '日常交际'
                            },
                            {
                              id: 'kp32',
                              description: 'be动词的一般现在时用法',
                              type: '原理规则',
                              theme: '语法'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};