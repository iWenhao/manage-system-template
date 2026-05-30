// 文件上传路由
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatar');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传jpg、png、gif、webp格式的图片'));
  }
};

// 配置上传
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// 上传头像
router.post(
  '/avatar',
  auth,
  operLog('用户管理-上传头像'),
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        badRequest(res, '请选择要上传的文件');
        return;
      }

      const userId = req.user!.userId;
      const filename = req.file.filename;
      const filePath = `/uploads/avatar/${filename}`;

      // 更新用户头像
      await prisma.sysUser.update({
        where: { id: userId },
        data: { avatar: filePath },
      });

      // 返回完整的URL
      const fullUrl = `${req.protocol}://${req.get('host')}${filePath}`;

      success(res, {
        fileName: filename,
        url: fullUrl,
        path: filePath,
      }, '上传成功');
    } catch (error) {
      console.error('上传头像失败:', error);
      fail(res, '上传头像失败');
    }
  }
);

// 错误处理中间件
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      fail(res, '文件大小不能超过2MB');
      return;
    }
    fail(res, error.message);
    return;
  }

  if (error) {
    fail(res, error.message);
    return;
  }

  next();
});

export default router;
