// 通知公告路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 获取公告列表
router.get(
  '/list',
  auth,
  checkPermission('system:notice:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        title,
        type,
        status,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (title) where.title = { contains: title as string };
      if (type !== undefined && type !== '') where.type = parseInt(type as string);
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [notices, total] = await Promise.all([
        prisma.sysNotice.findMany({
          where,
          skip,
          take: size,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.sysNotice.count({ where }),
      ]);

      pageSuccess(res, notices, total, page, size);
    } catch (error) {
      console.error('获取公告列表失败:', error);
      fail(res, '获取公告列表失败');
    }
  }
);

// 获取公告详情
router.get(
  '/:id',
  auth,
  checkPermission('system:notice:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const notice = await prisma.sysNotice.findUnique({
        where: { id },
      });

      if (!notice) {
        notFound(res, '公告不存在');
        return;
      }

      success(res, notice);
    } catch (error) {
      console.error('获取公告详情失败:', error);
      fail(res, '获取公告详情失败');
    }
  }
);

// 创建公告
router.post(
  '/',
  auth,
  checkPermission('system:notice:add'),
  operLog('通知公告-新增'),
  [
    body('title').notEmpty().withMessage('公告标题不能为空'),
    body('type').notEmpty().withMessage('公告类型不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { title, type, content, status } = req.body;

      const notice = await prisma.sysNotice.create({
        data: {
          title,
          type,
          content,
          status: status || 0,
        },
      });

      success(res, notice, '创建成功');
    } catch (error) {
      console.error('创建公告失败:', error);
      fail(res, '创建公告失败');
    }
  }
);

// 更新公告
router.put(
  '/:id',
  auth,
  checkPermission('system:notice:edit'),
  operLog('通知公告-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { title, type, content, status } = req.body;

      const existingNotice = await prisma.sysNotice.findUnique({
        where: { id },
      });

      if (!existingNotice) {
        notFound(res, '公告不存在');
        return;
      }

      await prisma.sysNotice.update({
        where: { id },
        data: {
          title,
          type,
          content,
          status,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新公告失败:', error);
      fail(res, '更新公告失败');
    }
  }
);

// 删除公告
router.delete(
  '/:id',
  auth,
  checkPermission('system:notice:remove'),
  operLog('通知公告-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const notice = await prisma.sysNotice.findUnique({
        where: { id },
      });

      if (!notice) {
        notFound(res, '公告不存在');
        return;
      }

      await prisma.sysNotice.delete({ where: { id } });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除公告失败:', error);
      fail(res, '删除公告失败');
    }
  }
);

export default router;
