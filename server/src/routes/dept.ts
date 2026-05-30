// 部门管理路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 构建部门树
function buildDeptTree(depts: any[], parentId: number = 0): any[] {
  const tree: any[] = [];
  depts
    .filter((dept) => dept.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .forEach((dept) => {
      const children = buildDeptTree(depts, dept.id);
      tree.push({
        ...dept,
        children: children.length > 0 ? children : undefined,
      });
    });
  return tree;
}

// 获取部门列表（树形）
router.get(
  '/list',
  auth,
  checkPermission('system:dept:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { deptName, status } = req.query;

      const where: any = {};
      if (deptName) where.name = { contains: deptName as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const depts = await prisma.sysDept.findMany({
        where,
        orderBy: { sort: 'asc' },
      });

      const tree = buildDeptTree(depts);
      success(res, tree);
    } catch (error) {
      console.error('获取部门列表失败:', error);
      fail(res, '获取部门列表失败');
    }
  }
);

// 获取部门树（用于选择父部门）
router.get('/tree', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const depts = await prisma.sysDept.findMany({
      where: { status: 0 },
      orderBy: { sort: 'asc' },
      select: {
        id: true,
        parentId: true,
        name: true,
        sort: true,
      },
    });

    const tree = buildDeptTree(depts);
    success(res, tree);
  } catch (error) {
    console.error('获取部门树失败:', error);
    fail(res, '获取部门树失败');
  }
});

// 获取部门详情
router.get(
  '/:id',
  auth,
  checkPermission('system:dept:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const dept = await prisma.sysDept.findUnique({
        where: { id },
      });

      if (!dept) {
        notFound(res, '部门不存在');
        return;
      }

      success(res, dept);
    } catch (error) {
      console.error('获取部门详情失败:', error);
      fail(res, '获取部门详情失败');
    }
  }
);

// 创建部门
router.post(
  '/',
  auth,
  checkPermission('system:dept:add'),
  operLog('部门管理-新增'),
  [
    body('name').notEmpty().withMessage('部门名称不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { parentId, name, sort, leader, phone, email, status } = req.body;

      // 检查父部门是否存在
      if (parentId && parentId !== 0) {
        const parentDept = await prisma.sysDept.findUnique({
          where: { id: parentId },
        });
        if (!parentDept) {
          badRequest(res, '父部门不存在');
          return;
        }
      }

      // 检查同级部门名称是否重复
      const existingDept = await prisma.sysDept.findFirst({
        where: {
          parentId: parentId || 0,
          name,
        },
      });

      if (existingDept) {
        badRequest(res, '同级下已存在相同名称的部门');
        return;
      }

      const dept = await prisma.sysDept.create({
        data: {
          parentId: parentId || 0,
          name,
          sort: sort || 0,
          leader,
          phone,
          email,
          status: status || 0,
        },
      });

      success(res, dept, '创建成功');
    } catch (error) {
      console.error('创建部门失败:', error);
      fail(res, '创建部门失败');
    }
  }
);

// 更新部门
router.put(
  '/:id',
  auth,
  checkPermission('system:dept:edit'),
  operLog('部门管理-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { parentId, name, sort, leader, phone, email, status } = req.body;

      const existingDept = await prisma.sysDept.findUnique({
        where: { id },
      });

      if (!existingDept) {
        notFound(res, '部门不存在');
        return;
      }

      // 不能将自己设为自己的父部门
      if (parentId === id) {
        badRequest(res, '不能将自己设为自己的父部门');
        return;
      }

      // 检查同级部门名称是否重复
      if (name) {
        const duplicateDept = await prisma.sysDept.findFirst({
          where: {
            parentId: parentId !== undefined ? parentId : existingDept.parentId,
            name,
            id: { not: id },
          },
        });

        if (duplicateDept) {
          badRequest(res, '同级下已存在相同名称的部门');
          return;
        }
      }

      await prisma.sysDept.update({
        where: { id },
        data: {
          parentId,
          name,
          sort,
          leader,
          phone,
          email,
          status,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新部门失败:', error);
      fail(res, '更新部门失败');
    }
  }
);

// 删除部门
router.delete(
  '/:id',
  auth,
  checkPermission('system:dept:remove'),
  operLog('部门管理-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const dept = await prisma.sysDept.findUnique({
        where: { id },
        include: {
          children: true,
          users: true,
        },
      });

      if (!dept) {
        notFound(res, '部门不存在');
        return;
      }

      if (dept.children.length > 0) {
        badRequest(res, '存在子部门，不允许删除');
        return;
      }

      if (dept.users.length > 0) {
        badRequest(res, '部门下存在用户，不允许删除');
        return;
      }

      await prisma.sysDept.delete({ where: { id } });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除部门失败:', error);
      fail(res, '删除部门失败');
    }
  }
);

export default router;
