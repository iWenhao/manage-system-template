// 字典管理路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// ==================== 字典类型管理 ====================

// 获取字典类型列表
router.get(
  '/type/list',
  auth,
  checkPermission('system:dict:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        dictName,
        status,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (dictName) where.name = { contains: dictName as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [dictTypes, total] = await Promise.all([
        prisma.sysDictType.findMany({
          where,
          skip,
          take: size,
          orderBy: { id: 'asc' },
        }),
        prisma.sysDictType.count({ where }),
      ]);

      pageSuccess(res, dictTypes, total, page, size);
    } catch (error) {
      console.error('获取字典类型列表失败:', error);
      fail(res, '获取字典类型列表失败');
    }
  }
);

// 创建字典类型
router.post(
  '/type',
  auth,
  checkPermission('system:dict:add'),
  operLog('字典类型-新增'),
  [
    body('name').notEmpty().withMessage('字典类型名称不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { name, status, remark } = req.body;

      // 检查字典类型名称是否已存在
      const existingDictType = await prisma.sysDictType.findFirst({
        where: { name },
      });

      if (existingDictType) {
        badRequest(res, '字典类型名称已存在');
        return;
      }

      const dictType = await prisma.sysDictType.create({
        data: {
          name,
          status: status || 0,
          remark,
        },
      });

      success(res, dictType, '创建成功');
    } catch (error) {
      console.error('创建字典类型失败:', error);
      fail(res, '创建字典类型失败');
    }
  }
);

// 更新字典类型
router.put(
  '/type/:id',
  auth,
  checkPermission('system:dict:edit'),
  operLog('字典类型-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { name, status, remark } = req.body;

      const existingDictType = await prisma.sysDictType.findUnique({
        where: { id },
      });

      if (!existingDictType) {
        notFound(res, '字典类型不存在');
        return;
      }

      // 检查字典类型名称是否已存在
      if (name && name !== existingDictType.name) {
        const duplicateDictType = await prisma.sysDictType.findFirst({
          where: { name },
        });

        if (duplicateDictType) {
          badRequest(res, '字典类型名称已存在');
          return;
        }
      }

      await prisma.sysDictType.update({
        where: { id },
        data: {
          name,
          status,
          remark,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新字典类型失败:', error);
      fail(res, '更新字典类型失败');
    }
  }
);

// 删除字典类型
router.delete(
  '/type/:id',
  auth,
  checkPermission('system:dict:remove'),
  operLog('字典类型-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const dictType = await prisma.sysDictType.findUnique({
        where: { id },
        include: {
          data: true,
        },
      });

      if (!dictType) {
        notFound(res, '字典类型不存在');
        return;
      }

      if (dictType.data.length > 0) {
        badRequest(res, '字典类型下存在字典数据，不允许删除');
        return;
      }

      await prisma.sysDictType.delete({ where: { id } });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除字典类型失败:', error);
      fail(res, '删除字典类型失败');
    }
  }
);

// ==================== 字典数据管理 ====================

// 获取字典数据列表
router.get(
  '/data/list',
  auth,
  checkPermission('system:dict:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        dictTypeId,
        label,
        status,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (dictTypeId) where.dictTypeId = parseInt(dictTypeId as string);
      if (label) where.label = { contains: label as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [dictData, total] = await Promise.all([
        prisma.sysDictData.findMany({
          where,
          skip,
          take: size,
          orderBy: { sort: 'asc' },
          include: {
            dictType: true,
          },
        }),
        prisma.sysDictData.count({ where }),
      ]);

      pageSuccess(res, dictData, total, page, size);
    } catch (error) {
      console.error('获取字典数据列表失败:', error);
      fail(res, '获取字典数据列表失败');
    }
  }
);

// 创建字典数据
router.post(
  '/data',
  auth,
  checkPermission('system:dict:add'),
  operLog('字典数据-新增'),
  [
    body('dictTypeId').notEmpty().withMessage('字典类型ID不能为空'),
    body('label').notEmpty().withMessage('字典标签不能为空'),
    body('value').notEmpty().withMessage('字典键值不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { dictTypeId, label, value, sort, status, remark } = req.body;

      // 检查字典类型是否存在
      const dictType = await prisma.sysDictType.findUnique({
        where: { id: dictTypeId },
      });

      if (!dictType) {
        badRequest(res, '字典类型不存在');
        return;
      }

      // 检查字典数据是否已存在
      const existingDictData = await prisma.sysDictData.findFirst({
        where: {
          dictTypeId,
          value,
        },
      });

      if (existingDictData) {
        badRequest(res, '同类型下字典键值已存在');
        return;
      }

      const dictData = await prisma.sysDictData.create({
        data: {
          dictTypeId,
          label,
          value,
          sort: sort || 0,
          status: status || 0,
          remark,
        },
      });

      success(res, dictData, '创建成功');
    } catch (error) {
      console.error('创建字典数据失败:', error);
      fail(res, '创建字典数据失败');
    }
  }
);

// 更新字典数据
router.put(
  '/data/:id',
  auth,
  checkPermission('system:dict:edit'),
  operLog('字典数据-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { dictTypeId, label, value, sort, status, remark } = req.body;

      const existingDictData = await prisma.sysDictData.findUnique({
        where: { id },
      });

      if (!existingDictData) {
        notFound(res, '字典数据不存在');
        return;
      }

      // 检查字典类型是否存在
      if (dictTypeId) {
        const dictType = await prisma.sysDictType.findUnique({
          where: { id: dictTypeId },
        });

        if (!dictType) {
          badRequest(res, '字典类型不存在');
          return;
        }
      }

      // 检查字典数据是否已存在
      if (value) {
        const duplicateDictData = await prisma.sysDictData.findFirst({
          where: {
            dictTypeId: dictTypeId || existingDictData.dictTypeId,
            value,
            id: { not: id },
          },
        });

        if (duplicateDictData) {
          badRequest(res, '同类型下字典键值已存在');
          return;
        }
      }

      await prisma.sysDictData.update({
        where: { id },
        data: {
          dictTypeId,
          label,
          value,
          sort,
          status,
          remark,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新字典数据失败:', error);
      fail(res, '更新字典数据失败');
    }
  }
);

// 删除字典数据
router.delete(
  '/data/:id',
  auth,
  checkPermission('system:dict:remove'),
  operLog('字典数据-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const dictData = await prisma.sysDictData.findUnique({
        where: { id },
      });

      if (!dictData) {
        notFound(res, '字典数据不存在');
        return;
      }

      await prisma.sysDictData.delete({ where: { id } });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除字典数据失败:', error);
      fail(res, '删除字典数据失败');
    }
  }
);

export default router;
