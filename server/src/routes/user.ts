// 用户管理路由
import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/password.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 获取用户列表
router.get(
  '/list',
  auth,
  checkPermission('system:user:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        username,
        nickname,
        status,
        deptId,
        phone,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      // 构建查询条件
      const where: any = {};
      if (username) where.username = { contains: username as string };
      if (nickname) where.nickname = { contains: nickname as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);
      if (deptId) where.deptId = parseInt(deptId as string);
      if (phone) where.phone = { contains: phone as string };

      const [users, total] = await Promise.all([
        prisma.sysUser.findMany({
          where,
          skip,
          take: size,
          orderBy: { id: 'asc' },
          include: {
            dept: true,
            roles: {
              include: { role: true },
            },
            posts: {
              include: { post: true },
            },
          },
        }),
        prisma.sysUser.count({ where }),
      ]);

      // 格式化数据
      const list = users.map((user) => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        sex: user.sex,
        status: user.status,
        deptId: user.deptId,
        dept: user.dept,
        roles: user.roles.map((ur) => ur.role),
        posts: user.posts.map((up) => up.post),
        remark: user.remark,
        loginIp: user.loginIp,
        loginDate: user.loginDate,
        createdAt: user.createdAt,
      }));

      pageSuccess(res, list, total, page, size);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      fail(res, '获取用户列表失败');
    }
  }
);

// 获取用户详情
router.get(
  '/:id',
  auth,
  checkPermission('system:user:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const user = await prisma.sysUser.findUnique({
        where: { id },
        include: {
          dept: true,
          roles: {
            include: { role: true },
          },
          posts: {
            include: { post: true },
          },
        },
      });

      if (!user) {
        notFound(res, '用户不存在');
        return;
      }

      success(res, {
        ...user,
        roles: user.roles.map((ur) => ur.role),
        posts: user.posts.map((up) => up.post),
        roleIds: user.roles.map((ur) => ur.roleId),
        postIds: user.posts.map((up) => up.postId),
      });
    } catch (error) {
      console.error('获取用户详情失败:', error);
      fail(res, '获取用户详情失败');
    }
  }
);

// 创建用户
router.post(
  '/',
  auth,
  checkPermission('system:user:add'),
  operLog('用户管理-新增'),
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('nickname').notEmpty().withMessage('昵称不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { username, nickname, password, email, phone, sex, deptId, roleIds, postIds, remark, status } = req.body;

      // 检查用户名是否已存在
      const existingUser = await prisma.sysUser.findUnique({
        where: { username },
      });

      if (existingUser) {
        badRequest(res, '用户名已存在');
        return;
      }

      // 加密密码
      const hashedPassword = await hashPassword(password);

      // 创建用户
      const user = await prisma.$transaction(async (tx) => {
        // 创建用户
        const newUser = await tx.sysUser.create({
          data: {
            username,
            nickname,
            password: hashedPassword,
            email,
            phone,
            sex: sex || 0,
            deptId,
            remark,
            status: status || 0,
          },
        });

        // 关联角色
        if (roleIds && roleIds.length > 0) {
          await tx.sysUserRole.createMany({
            data: roleIds.map((roleId: number) => ({
              userId: newUser.id,
              roleId,
            })),
          });
        }

        // 关联岗位
        if (postIds && postIds.length > 0) {
          await tx.sysUserPost.createMany({
            data: postIds.map((postId: number) => ({
              userId: newUser.id,
              postId,
            })),
          });
        }

        return newUser;
      });

      success(res, user, '创建成功');
    } catch (error) {
      console.error('创建用户失败:', error);
      fail(res, '创建用户失败');
    }
  }
);

// 更新用户
router.put(
  '/:id',
  auth,
  checkPermission('system:user:edit'),
  operLog('用户管理-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { nickname, email, phone, sex, deptId, roleIds, postIds, remark, status } = req.body;

      // 检查用户是否存在
      const existingUser = await prisma.sysUser.findUnique({
        where: { id },
      });

      if (!existingUser) {
        notFound(res, '用户不存在');
        return;
      }

      // 不允许修改管理员
      if (existingUser.username === 'admin') {
        badRequest(res, '不允许修改管理员用户');
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 更新用户信息
        await tx.sysUser.update({
          where: { id },
          data: {
            nickname,
            email,
            phone,
            sex,
            deptId,
            remark,
            status,
          },
        });

        // 更新角色关联
        if (roleIds !== undefined) {
          await tx.sysUserRole.deleteMany({
            where: { userId: id },
          });
          if (roleIds.length > 0) {
            await tx.sysUserRole.createMany({
              data: roleIds.map((roleId: number) => ({
                userId: id,
                roleId,
              })),
            });
          }
        }

        // 更新岗位关联
        if (postIds !== undefined) {
          await tx.sysUserPost.deleteMany({
            where: { userId: id },
          });
          if (postIds.length > 0) {
            await tx.sysUserPost.createMany({
              data: postIds.map((postId: number) => ({
                userId: id,
                postId,
              })),
            });
          }
        }
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新用户失败:', error);
      fail(res, '更新用户失败');
    }
  }
);

// 删除用户
router.delete(
  '/:id',
  auth,
  checkPermission('system:user:remove'),
  operLog('用户管理-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const user = await prisma.sysUser.findUnique({
        where: { id },
      });

      if (!user) {
        notFound(res, '用户不存在');
        return;
      }

      if (user.username === 'admin') {
        badRequest(res, '不允许删除管理员用户');
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 删除关联数据
        await tx.sysUserRole.deleteMany({ where: { userId: id } });
        await tx.sysUserPost.deleteMany({ where: { userId: id } });
        // 删除用户
        await tx.sysUser.delete({ where: { id } });
      });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除用户失败:', error);
      fail(res, '删除用户失败');
    }
  }
);

// 重置密码
router.put(
  '/:id/reset-pwd',
  auth,
  checkPermission('system:user:resetPwd'),
  operLog('用户管理-重置密码'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { password } = req.body;

      const user = await prisma.sysUser.findUnique({
        where: { id },
      });

      if (!user) {
        notFound(res, '用户不存在');
        return;
      }

      const hashedPassword = await hashPassword(password || '123456');

      await prisma.sysUser.update({
        where: { id },
        data: { password: hashedPassword },
      });

      success(res, null, '重置成功');
    } catch (error) {
      console.error('重置密码失败:', error);
      fail(res, '重置密码失败');
    }
  }
);

// 修改个人信息
router.put(
  '/profile',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { nickname, email, phone, sex } = req.body;

      await prisma.sysUser.update({
        where: { id: userId },
        data: { nickname, email, phone, sex },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('修改个人信息失败:', error);
      fail(res, '修改个人信息失败');
    }
  }
);

// 修改密码
router.put(
  '/profile/pwd',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        badRequest(res, '旧密码和新密码不能为空');
        return;
      }

      const user = await prisma.sysUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        notFound(res, '用户不存在');
        return;
      }

      const { comparePassword } = await import('../utils/password.js');
      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) {
        badRequest(res, '旧密码错误');
        return;
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.sysUser.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('修改密码失败:', error);
      fail(res, '修改密码失败');
    }
  }
);

export default router;
