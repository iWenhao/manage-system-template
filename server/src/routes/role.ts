// 角色管理路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 获取角色列表
router.get(
  '/list',
  auth,
  checkPermission('system:role:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageNum = '1', pageSize = '10', roleName, status, roleKey } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (roleName) where.name = { contains: roleName as string };
      if (roleKey) where.code = { contains: roleKey as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [roles, total] = await Promise.all([
        prisma.sysRole.findMany({
          where,
          skip,
          take: size,
          orderBy: { sort: 'asc' },
        }),
        prisma.sysRole.count({ where }),
      ]);

      pageSuccess(res, roles, total, page, size);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      fail(res, '获取角色列表失败');
    }
  }
);

// 获取所有角色（用于下拉选择）
router.get('/all', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.sysRole.findMany({
      where: { status: 0 },
      orderBy: { sort: 'asc' },
    });
    success(res, roles);
  } catch (error) {
    console.error('获取角色列表失败:', error);
    fail(res, '获取角色列表失败');
  }
});

// 获取角色详情
router.get(
  '/:id',
  auth,
  checkPermission('system:role:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const role = await prisma.sysRole.findUnique({
        where: { id },
        include: {
          menus: true,
        },
      });

      if (!role) {
        notFound(res, '角色不存在');
        return;
      }

      success(res, {
        ...role,
        menuIds: role.menus.map((rm) => rm.menuId),
      });
    } catch (error) {
      console.error('获取角色详情失败:', error);
      fail(res, '获取角色详情失败');
    }
  }
);

// 创建角色
router.post(
  '/',
  auth,
  checkPermission('system:role:add'),
  operLog('角色管理-新增'),
  [
    body('name').notEmpty().withMessage('角色名称不能为空'),
    body('code').notEmpty().withMessage('角色编码不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { name, code, sort, status, dataScope, remark, menuIds } = req.body;

      // 检查编码是否已存在
      const existingRole = await prisma.sysRole.findUnique({
        where: { code },
      });

      if (existingRole) {
        badRequest(res, '角色编码已存在');
        return;
      }

      const role = await prisma.$transaction(async (tx) => {
        const newRole = await tx.sysRole.create({
          data: {
            name,
            code,
            sort: sort || 0,
            status: status || 0,
            dataScope: dataScope || 1,
            remark,
          },
        });

        // 关联菜单
        if (menuIds && menuIds.length > 0) {
          await tx.sysRoleMenu.createMany({
            data: menuIds.map((menuId: number) => ({
              roleId: newRole.id,
              menuId,
            })),
          });
        }

        return newRole;
      });

      success(res, role, '创建成功');
    } catch (error) {
      console.error('创建角色失败:', error);
      fail(res, '创建角色失败');
    }
  }
);

// 更新角色
router.put(
  '/:id',
  auth,
  checkPermission('system:role:edit'),
  operLog('角色管理-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { name, code, sort, status, dataScope, remark, menuIds } = req.body;

      const existingRole = await prisma.sysRole.findUnique({
        where: { id },
      });

      if (!existingRole) {
        notFound(res, '角色不存在');
        return;
      }

      if (existingRole.code === 'admin') {
        badRequest(res, '不允许修改管理员角色');
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.sysRole.update({
          where: { id },
          data: {
            name,
            code,
            sort,
            status,
            dataScope,
            remark,
          },
        });

        // 更新菜单关联
        if (menuIds !== undefined) {
          await tx.sysRoleMenu.deleteMany({ where: { roleId: id } });
          if (menuIds.length > 0) {
            await tx.sysRoleMenu.createMany({
              data: menuIds.map((menuId: number) => ({
                roleId: id,
                menuId,
              })),
            });
          }
        }
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新角色失败:', error);
      fail(res, '更新角色失败');
    }
  }
);

// 删除角色
router.delete(
  '/:id',
  auth,
  checkPermission('system:role:remove'),
  operLog('角色管理-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const role = await prisma.sysRole.findUnique({
        where: { id },
        include: {
          users: true,
        },
      });

      if (!role) {
        notFound(res, '角色不存在');
        return;
      }

      if (role.code === 'admin') {
        badRequest(res, '不允许删除管理员角色');
        return;
      }

      if (role.users.length > 0) {
        badRequest(res, '该角色下存在用户，不允许删除');
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.sysRoleMenu.deleteMany({ where: { roleId: id } });
        await tx.sysRole.delete({ where: { id } });
      });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除角色失败:', error);
      fail(res, '删除角色失败');
    }
  }
);

export default router;
