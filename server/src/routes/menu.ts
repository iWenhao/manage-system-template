// 菜单管理路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 构建菜单树
function buildMenuTree(menus: any[], parentId: number = 0): any[] {
  const tree: any[] = [];
  menus
    .filter((menu) => menu.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .forEach((menu) => {
      const children = buildMenuTree(menus, menu.id);
      tree.push({
        ...menu,
        children: children.length > 0 ? children : undefined,
      });
    });
  return tree;
}

// 获取菜单列表（树形）
router.get(
  '/list',
  auth,
  checkPermission('system:menu:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { menuName, status } = req.query;

      const where: any = {};
      if (menuName) where.name = { contains: menuName as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const menus = await prisma.sysMenu.findMany({
        where,
        orderBy: { sort: 'asc' },
      });

      const tree = buildMenuTree(menus);
      success(res, tree);
    } catch (error) {
      console.error('获取菜单列表失败:', error);
      fail(res, '获取菜单列表失败');
    }
  }
);

// 获取菜单树（用于选择父菜单）
router.get('/tree', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const menus = await prisma.sysMenu.findMany({
      where: { status: 0 },
      orderBy: { sort: 'asc' },
      select: {
        id: true,
        parentId: true,
        name: true,
        type: true,
        icon: true,
        sort: true,
      },
    });

    const tree = buildMenuTree(menus);
    success(res, tree);
  } catch (error) {
    console.error('获取菜单树失败:', error);
    fail(res, '获取菜单树失败');
  }
});

// 获取菜单详情
router.get(
  '/:id',
  auth,
  checkPermission('system:menu:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const menu = await prisma.sysMenu.findUnique({
        where: { id },
      });

      if (!menu) {
        notFound(res, '菜单不存在');
        return;
      }

      success(res, menu);
    } catch (error) {
      console.error('获取菜单详情失败:', error);
      fail(res, '获取菜单详情失败');
    }
  }
);

// 创建菜单
router.post(
  '/',
  auth,
  checkPermission('system:menu:add'),
  operLog('菜单管理-新增'),
  [
    body('name').notEmpty().withMessage('菜单名称不能为空'),
    body('type').notEmpty().withMessage('菜单类型不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const {
        parentId,
        name,
        path,
        component,
        icon,
        sort,
        type,
        permission,
        visible,
        status,
        isExternal,
        isCache,
        remark,
      } = req.body;

      // 检查父菜单是否存在
      if (parentId && parentId !== 0) {
        const parentMenu = await prisma.sysMenu.findUnique({
          where: { id: parentId },
        });
        if (!parentMenu) {
          badRequest(res, '父菜单不存在');
          return;
        }
      }

      const menu = await prisma.sysMenu.create({
        data: {
          parentId: parentId || 0,
          name,
          path,
          component,
          icon,
          sort: sort || 0,
          type,
          permission,
          visible: visible || 0,
          status: status || 0,
          isExternal: isExternal || false,
          isCache: isCache || false,
          remark,
        },
      });

      success(res, menu, '创建成功');
    } catch (error) {
      console.error('创建菜单失败:', error);
      fail(res, '创建菜单失败');
    }
  }
);

// 更新菜单
router.put(
  '/:id',
  auth,
  checkPermission('system:menu:edit'),
  operLog('菜单管理-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const {
        parentId,
        name,
        path,
        component,
        icon,
        sort,
        type,
        permission,
        visible,
        status,
        isExternal,
        isCache,
        remark,
      } = req.body;

      const existingMenu = await prisma.sysMenu.findUnique({
        where: { id },
      });

      if (!existingMenu) {
        notFound(res, '菜单不存在');
        return;
      }

      // 不能将自己设为自己的父菜单
      if (parentId === id) {
        badRequest(res, '不能将自己设为自己的父菜单');
        return;
      }

      await prisma.sysMenu.update({
        where: { id },
        data: {
          parentId,
          name,
          path,
          component,
          icon,
          sort,
          type,
          permission,
          visible,
          status,
          isExternal,
          isCache,
          remark,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新菜单失败:', error);
      fail(res, '更新菜单失败');
    }
  }
);

// 删除菜单
router.delete(
  '/:id',
  auth,
  checkPermission('system:menu:remove'),
  operLog('菜单管理-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const menu = await prisma.sysMenu.findUnique({
        where: { id },
        include: {
          children: true,
          roles: true,
        },
      });

      if (!menu) {
        notFound(res, '菜单不存在');
        return;
      }

      if (menu.children.length > 0) {
        badRequest(res, '存在子菜单，不允许删除');
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 删除角色菜单关联
        await tx.sysRoleMenu.deleteMany({ where: { menuId: id } });
        // 删除菜单
        await tx.sysMenu.delete({ where: { id } });
      });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除菜单失败:', error);
      fail(res, '删除菜单失败');
    }
  }
);

// 批量排序
router.put(
  '/sort',
  auth,
  checkPermission('system:menu:edit'),
  operLog('菜单管理-排序'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { sortData } = req.body;

      if (!sortData || !Array.isArray(sortData)) {
        badRequest(res, '排序数据不能为空');
        return;
      }

      await prisma.$transaction(async (tx) => {
        for (const item of sortData) {
          await tx.sysMenu.update({
            where: { id: item.id },
            data: { sort: item.sort, parentId: item.parentId },
          });
        }
      });

      success(res, null, '排序成功');
    } catch (error) {
      console.error('菜单排序失败:', error);
      fail(res, '菜单排序失败');
    }
  }
);

// 获取当前用户的菜单（用于前端路由）
router.get('/user/menus', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // 获取用户角色
    const userRoles = await prisma.sysUserRole.findMany({
      where: { userId },
      select: { roleId: true },
    });

    const roleIds = userRoles.map((ur) => ur.roleId);

    // 获取角色菜单
    const roleMenus = await prisma.sysRoleMenu.findMany({
      where: { roleId: { in: roleIds } },
      include: {
        menu: true,
      },
    });

    // 去重并过滤
    const menuMap = new Map<number, any>();
    roleMenus.forEach((rm) => {
      if (rm.menu.status === 0 && (rm.menu.type === 0 || rm.menu.type === 1)) {
        menuMap.set(rm.menu.id, rm.menu);
      }
    });

    const menus = Array.from(menuMap.values());
    const tree = buildMenuTree(menus);

    success(res, tree);
  } catch (error) {
    console.error('获取用户菜单失败:', error);
    fail(res, '获取用户菜单失败');
  }
});

export default router;
