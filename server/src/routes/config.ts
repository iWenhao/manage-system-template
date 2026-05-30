// 参数管理路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 获取参数列表
router.get(
  '/list',
  auth,
  checkPermission('system:config:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        configName,
        configKey,
        type,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (configName) where.name = { contains: configName as string };
      if (configKey) where.key = { contains: configKey as string };
      if (type) where.type = type as string;

      const [configs, total] = await Promise.all([
        prisma.sysConfig.findMany({
          where,
          skip,
          take: size,
          orderBy: { id: 'asc' },
        }),
        prisma.sysConfig.count({ where }),
      ]);

      pageSuccess(res, configs, total, page, size);
    } catch (error) {
      console.error('获取参数列表失败:', error);
      fail(res, '获取参数列表失败');
    }
  }
);

// 根据key获取参数
router.get(
  '/key/:key',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const key = req.params.key;
      const config = await prisma.sysConfig.findUnique({
        where: { key },
      });

      if (!config) {
        notFound(res, '参数不存在');
        return;
      }

      success(res, config);
    } catch (error) {
      console.error('获取参数失败:', error);
      fail(res, '获取参数失败');
    }
  }
);

// 创建参数
router.post(
  '/',
  auth,
  checkPermission('system:config:add'),
  operLog('参数管理-新增'),
  [
    body('name').notEmpty().withMessage('参数名称不能为空'),
    body('key').notEmpty().withMessage('参数键名不能为空'),
    body('value').notEmpty().withMessage('参数键值不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { name, key, value, type, remark } = req.body;

      // 检查参数键名是否已存在
      const existingConfig = await prisma.sysConfig.findUnique({
        where: { key },
      });

      if (existingConfig) {
        badRequest(res, '参数键名已存在');
        return;
      }

      const config = await prisma.sysConfig.create({
        data: {
          name,
          key,
          value,
          type,
          remark,
        },
      });

      success(res, config, '创建成功');
    } catch (error) {
      console.error('创建参数失败:', error);
      fail(res, '创建参数失败');
    }
  }
);

// 更新参数
router.put(
  '/:id',
  auth,
  checkPermission('system:config:edit'),
  operLog('参数管理-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { name, key, value, type, remark } = req.body;

      const existingConfig = await prisma.sysConfig.findUnique({
        where: { id },
      });

      if (!existingConfig) {
        notFound(res, '参数不存在');
        return;
      }

      // 检查参数键名是否已存在
      if (key && key !== existingConfig.key) {
        const duplicateConfig = await prisma.sysConfig.findUnique({
          where: { key },
        });

        if (duplicateConfig) {
          badRequest(res, '参数键名已存在');
          return;
        }
      }

      await prisma.sysConfig.update({
        where: { id },
        data: {
          name,
          key,
          value,
          type,
          remark,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新参数失败:', error);
      fail(res, '更新参数失败');
    }
  }
);

// 删除参数
router.delete(
  '/:id',
  auth,
  checkPermission('system:config:remove'),
  operLog('参数管理-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const config = await prisma.sysConfig.findUnique({
        where: { id },
      });

      if (!config) {
        notFound(res, '参数不存在');
        return;
      }

      await prisma.sysConfig.delete({ where: { id } });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除参数失败:', error);
      fail(res, '删除参数失败');
    }
  }
);

export default router;
