// 定时任务路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 获取任务列表
router.get(
  '/list',
  auth,
  checkPermission('job:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        jobName,
        jobGroup,
        status,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (jobName) where.name = { contains: jobName as string };
      if (jobGroup) where.jobGroup = jobGroup as string;
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [jobs, total] = await Promise.all([
        prisma.sysJob.findMany({
          where,
          skip,
          take: size,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.sysJob.count({ where }),
      ]);

      pageSuccess(res, jobs, total, page, size);
    } catch (error) {
      console.error('获取任务列表失败:', error);
      fail(res, '获取任务列表失败');
    }
  }
);

// 获取任务详情
router.get(
  '/:id',
  auth,
  checkPermission('job:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const job = await prisma.sysJob.findUnique({
        where: { id },
      });

      if (!job) {
        notFound(res, '任务不存在');
        return;
      }

      success(res, job);
    } catch (error) {
      console.error('获取任务详情失败:', error);
      fail(res, '获取任务详情失败');
    }
  }
);

// 创建任务
router.post(
  '/',
  auth,
  checkPermission('job:add'),
  operLog('定时任务-新增'),
  [
    body('name').notEmpty().withMessage('任务名称不能为空'),
    body('invokeTarget').notEmpty().withMessage('调用目标不能为空'),
    body('cronExpression').notEmpty().withMessage('Cron表达式不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const {
        name,
        jobGroup,
        invokeTarget,
        cronExpression,
        misfirePolicy,
        concurrent,
        status,
        remark,
      } = req.body;

      const job = await prisma.sysJob.create({
        data: {
          name,
          jobGroup: jobGroup || 'DEFAULT',
          invokeTarget,
          cronExpression,
          misfirePolicy: misfirePolicy || 1,
          concurrent: concurrent || 1,
          status: status || 0,
          remark,
        },
      });

      success(res, job, '创建成功');
    } catch (error) {
      console.error('创建任务失败:', error);
      fail(res, '创建任务失败');
    }
  }
);

// 更新任务
router.put(
  '/:id',
  auth,
  checkPermission('job:edit'),
  operLog('定时任务-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const {
        name,
        jobGroup,
        invokeTarget,
        cronExpression,
        misfirePolicy,
        concurrent,
        status,
        remark,
      } = req.body;

      const existingJob = await prisma.sysJob.findUnique({
        where: { id },
      });

      if (!existingJob) {
        notFound(res, '任务不存在');
        return;
      }

      await prisma.sysJob.update({
        where: { id },
        data: {
          name,
          jobGroup,
          invokeTarget,
          cronExpression,
          misfirePolicy,
          concurrent,
          status,
          remark,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新任务失败:', error);
      fail(res, '更新任务失败');
    }
  }
);

// 删除任务
router.delete(
  '/:id',
  auth,
  checkPermission('job:remove'),
  operLog('定时任务-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const job = await prisma.sysJob.findUnique({
        where: { id },
        include: {
          logs: true,
        },
      });

      if (!job) {
        notFound(res, '任务不存在');
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 删除任务日志
        await tx.sysJobLog.deleteMany({ where: { jobId: id } });
        // 删除任务
        await tx.sysJob.delete({ where: { id } });
      });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除任务失败:', error);
      fail(res, '删除任务失败');
    }
  }
);

// 暂停任务
router.put(
  '/:id/pause',
  auth,
  checkPermission('job:edit'),
  operLog('定时任务-暂停'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const job = await prisma.sysJob.findUnique({
        where: { id },
      });

      if (!job) {
        notFound(res, '任务不存在');
        return;
      }

      await prisma.sysJob.update({
        where: { id },
        data: { status: 1 },
      });

      // 记录日志
      await prisma.sysJobLog.create({
        data: {
          jobId: id,
          jobName: job.name,
          invokeTarget: job.invokeTarget,
          jobMessage: '暂停任务',
          status: 0,
        },
      });

      success(res, null, '暂停成功');
    } catch (error) {
      console.error('暂停任务失败:', error);
      fail(res, '暂停任务失败');
    }
  }
);

// 恢复任务
router.put(
  '/:id/resume',
  auth,
  checkPermission('job:edit'),
  operLog('定时任务-恢复'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const job = await prisma.sysJob.findUnique({
        where: { id },
      });

      if (!job) {
        notFound(res, '任务不存在');
        return;
      }

      await prisma.sysJob.update({
        where: { id },
        data: { status: 0 },
      });

      // 记录日志
      await prisma.sysJobLog.create({
        data: {
          jobId: id,
          jobName: job.name,
          invokeTarget: job.invokeTarget,
          jobMessage: '恢复任务',
          status: 0,
        },
      });

      success(res, null, '恢复成功');
    } catch (error) {
      console.error('恢复任务失败:', error);
      fail(res, '恢复任务失败');
    }
  }
);

// 立即执行
router.post(
  '/:id/run',
  auth,
  checkPermission('job:edit'),
  operLog('定时任务-执行'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const job = await prisma.sysJob.findUnique({
        where: { id },
      });

      if (!job) {
        notFound(res, '任务不存在');
        return;
      }

      // 记录执行日志
      await prisma.sysJobLog.create({
        data: {
          jobId: id,
          jobName: job.name,
          invokeTarget: job.invokeTarget,
          jobMessage: '执行任务',
          status: 0,
          startTime: new Date(),
          stopTime: new Date(),
        },
      });

      success(res, null, '执行成功');
    } catch (error) {
      console.error('执行任务失败:', error);
      fail(res, '执行任务失败');
    }
  }
);

// 获取任务日志列表
router.get(
  '/log',
  auth,
  checkPermission('job:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        jobId,
        jobName,
        status,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (jobId) where.jobId = parseInt(jobId as string);
      if (jobName) where.jobName = { contains: jobName as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [logs, total] = await Promise.all([
        prisma.sysJobLog.findMany({
          where,
          skip,
          take: size,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.sysJobLog.count({ where }),
      ]);

      pageSuccess(res, logs, total, page, size);
    } catch (error) {
      console.error('获取任务日志列表失败:', error);
      fail(res, '获取任务日志列表失败');
    }
  }
);

export default router;
