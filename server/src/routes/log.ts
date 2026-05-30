// 日志管理路由
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { success, fail, pageSuccess } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';

const router = Router();

// 获取操作日志列表
router.get(
  '/oper',
  auth,
  checkPermission('system:operlog:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        title,
        operName,
        status,
        beginTime,
        endTime,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (title) where.title = { contains: title as string };
      if (operName) where.operName = { contains: operName as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      // 时间范围查询
      if (beginTime || endTime) {
        where.operTime = {};
        if (beginTime) where.operTime.gte = new Date(beginTime as string);
        if (endTime) where.operTime.lte = new Date(endTime as string);
      }

      const [operLogs, total] = await Promise.all([
        prisma.sysOperLog.findMany({
          where,
          skip,
          take: size,
          orderBy: { operTime: 'desc' },
          include: {
            user: {
              select: {
                username: true,
                nickname: true,
              },
            },
          },
        }),
        prisma.sysOperLog.count({ where }),
      ]);

      pageSuccess(res, operLogs, total, page, size);
    } catch (error) {
      console.error('获取操作日志列表失败:', error);
      fail(res, '获取操作日志列表失败');
    }
  }
);

// 清空操作日志
router.delete(
  '/oper',
  auth,
  checkPermission('system:operlog:remove'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.sysOperLog.deleteMany({});
      success(res, null, '清空成功');
    } catch (error) {
      console.error('清空操作日志失败:', error);
      fail(res, '清空操作日志失败');
    }
  }
);

// 获取登录日志列表
router.get(
  '/login',
  auth,
  checkPermission('system:logininfor:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        username,
        ipaddr,
        status,
        beginTime,
        endTime,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (username) where.username = { contains: username as string };
      if (ipaddr) where.ip = { contains: ipaddr as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      // 时间范围查询
      if (beginTime || endTime) {
        where.loginTime = {};
        if (beginTime) where.loginTime.gte = new Date(beginTime as string);
        if (endTime) where.loginTime.lte = new Date(endTime as string);
      }

      const [loginLogs, total] = await Promise.all([
        prisma.sysLoginLog.findMany({
          where,
          skip,
          take: size,
          orderBy: { loginTime: 'desc' },
        }),
        prisma.sysLoginLog.count({ where }),
      ]);

      pageSuccess(res, loginLogs, total, page, size);
    } catch (error) {
      console.error('获取登录日志列表失败:', error);
      fail(res, '获取登录日志列表失败');
    }
  }
);

// 清空登录日志
router.delete(
  '/login',
  auth,
  checkPermission('system:logininfor:remove'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      await prisma.sysLoginLog.deleteMany({});
      success(res, null, '清空成功');
    } catch (error) {
      console.error('清空登录日志失败:', error);
      fail(res, '清空登录日志失败');
    }
  }
);

export default router;
