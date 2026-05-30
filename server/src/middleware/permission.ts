// 权限校验中间件
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.js';
import { forbidden } from '../utils/response.js';

// 检查用户是否拥有指定权限
export function checkPermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      forbidden(res, '未登录');
      return;
    }

    try {
      // 超级管理员拥有所有权限
      const userWithRoles = await prisma.sysUser.findUnique({
        where: { id: req.user.userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!userWithRoles) {
        forbidden(res, '用户不存在');
        return;
      }

      // 检查是否是超级管理员
      const isAdmin = userWithRoles.roles.some((ur) => ur.role.code === 'admin');
      if (isAdmin) {
        next();
        return;
      }

      // 检查权限
      const hasPermission = await prisma.sysRoleMenu.findFirst({
        where: {
          role: {
            users: {
              some: {
                userId: req.user.userId,
              },
            },
          },
          menu: {
            permission,
            status: 0,
          },
        },
      });

      if (!hasPermission) {
        forbidden(res, '权限不足');
        return;
      }

      next();
    } catch (error) {
      console.error('权限检查失败:', error);
      forbidden(res, '权限检查失败');
    }
  };
}

// 检查用户是否拥有任意一个权限
export function checkAnyPermission(...permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      forbidden(res, '未登录');
      return;
    }

    try {
      const userWithRoles = await prisma.sysUser.findUnique({
        where: { id: req.user.userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!userWithRoles) {
        forbidden(res, '用户不存在');
        return;
      }

      const isAdmin = userWithRoles.roles.some((ur) => ur.role.code === 'admin');
      if (isAdmin) {
        next();
        return;
      }

      const hasPermission = await prisma.sysRoleMenu.findFirst({
        where: {
          role: {
            users: {
              some: {
                userId: req.user.userId,
              },
            },
          },
          menu: {
            permission: { in: permissions },
            status: 0,
          },
        },
      });

      if (!hasPermission) {
        forbidden(res, '权限不足');
        return;
      }

      next();
    } catch (error) {
      console.error('权限检查失败:', error);
      forbidden(res, '权限检查失败');
    }
  };
}
