import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

// 查找或创建 Section
// 根据完整的教材路径查找或创建 Section
export const findOrCreateSection = async (req: AuthRequest, res: Response) => {
  try {
    const {
      subjectCode,        // 科目代码，如 'math'
      educationLevelCode,  // 学段代码，如 'junior' 或 'senior'
      gradeCode,           // 年级代码，如 'grade7'
      bookCode,            // 册别代码，如 'volume1'
      chapterName,          // 章名称
      sectionName,          // 节名称
    } = req.body;

    if (!subjectCode || !educationLevelCode || !gradeCode || !bookCode || !chapterName || !sectionName) {
      return res.status(400).json({ error: '缺少必要的参数' });
    }

    // 1. 查找或创建 Subject
    let subject = await prisma.subject.findUnique({
      where: { code: subjectCode },
    });
    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: subjectCode === 'math' ? '数学' : subjectCode === 'chinese' ? '语文' : subjectCode === 'english' ? '英语' : subjectCode, code: subjectCode },
      });
    }

    // 2. 查找或创建 EducationLevel
    const educationLevelName = educationLevelCode === 'junior' ? '初中' : educationLevelCode === 'senior' ? '高中' : educationLevelCode;
    let educationLevel = await prisma.educationLevel.findFirst({
      where: {
        subjectId: subject.id,
        code: educationLevelCode,
      },
    });
    if (!educationLevel) {
      educationLevel = await prisma.educationLevel.create({
        data: {
          subjectId: subject.id,
          name: educationLevelName,
          code: educationLevelCode,
        },
      });
    }

    // 3. 查找或创建 Grade
    const gradeNameMap: Record<string, string> = {
      'grade7': '七年级',
      'grade8': '八年级',
      'grade9': '九年级',
      'grade10': '高一年级',
      'grade11': '高二年级',
      'grade12': '高三年级',
    };
    const gradeName = gradeNameMap[gradeCode] || gradeCode;
    let grade = await prisma.grade.findFirst({
      where: {
        educationLevelId: educationLevel.id,
        code: gradeCode,
      },
    });
    if (!grade) {
      grade = await prisma.grade.create({
        data: {
          educationLevelId: educationLevel.id,
          name: gradeName,
          code: gradeCode,
        },
      });
    }

    // 4. 查找或创建 Book
    const bookNameMap: Record<string, string> = {
      'volume1': '上册',
      'volume2': '下册',
    };
    const bookName = bookNameMap[bookCode] || bookCode;
    let book = await prisma.book.findFirst({
      where: {
        gradeId: grade.id,
        code: bookCode,
      },
    });
    if (!book) {
      book = await prisma.book.create({
        data: {
          gradeId: grade.id,
          name: bookName,
          code: bookCode,
        },
      });
    }

    // 5. 查找或创建 Chapter
    // 生成 chapter code（基于名称的简化版本）
    const chapterCode = chapterName.replace(/\s+/g, '_').substring(0, 50);
    let chapter = await prisma.chapter.findFirst({
      where: {
        bookId: book.id,
        name: chapterName,
      },
    });
    if (!chapter) {
      // 获取当前章节数量作为 order
      const chapterCount = await prisma.chapter.count({
        where: { bookId: book.id },
      });
      chapter = await prisma.chapter.create({
        data: {
          bookId: book.id,
          name: chapterName,
          code: chapterCode,
          order: chapterCount + 1,
        },
      });
    }

    // 6. 查找或创建 Section
    // 生成 section code
    const sectionCode = sectionName.replace(/\s+/g, '_').substring(0, 50);
    let section = await prisma.section.findFirst({
      where: {
        chapterId: chapter.id,
        name: sectionName,
      },
    });
    if (!section) {
      // 获取当前节数量作为 order
      const sectionCount = await prisma.section.count({
        where: { chapterId: chapter.id },
      });
      section = await prisma.section.create({
        data: {
          chapterId: chapter.id,
          name: sectionName,
          code: sectionCode,
          order: sectionCount + 1,
        },
      });
    }

    res.json({
      section: {
        id: section.id,
        name: section.name,
        code: section.code,
        chapter: {
          id: chapter.id,
          name: chapter.name,
          book: {
            id: book.id,
            name: book.name,
            grade: {
              id: grade.id,
              name: grade.name,
              educationLevel: {
                id: educationLevel.id,
                name: educationLevel.name,
                subject: {
                  id: subject.id,
                  name: subject.name,
                },
              },
            },
          },
        },
      },
    });
  } catch (error: any) {
    console.error('查找或创建 Section 失败:', error);
    res.status(500).json({ error: '查找或创建 Section 失败: ' + error.message });
  }
};

