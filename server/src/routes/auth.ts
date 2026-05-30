// 认证路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { success, fail, badRequest, unauthorized } from '../utils/response.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// 登录
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    const { username, password } = req.body;

    try {
      // 查找用户
      const user = await prisma.sysUser.findUnique({
        where: { username },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          dept: true,
        },
      });

      if (!user) {
        // 记录登录日志
        await prisma.sysLoginLog.create({
          data: {
            username,
            ip: req.ip || '',
            status: 1,
            msg: '用户不存在',
          },
        });
        unauthorized(res, '用户名或密码错误');
        return;
      }

      // 检查用户状态
      if (user.status !== 0) {
        await prisma.sysLoginLog.create({
          data: {
            username,
            ip: req.ip || '',
            status: 1,
            msg: '用户已停用',
          },
        });
        unauthorized(res, '用户已停用');
        return;
      }

      // 验证密码
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        await prisma.sysLoginLog.create({
          data: {
            username,
            ip: req.ip || '',
            status: 1,
            msg: '密码错误',
          },
        });
        unauthorized(res, '用户名或密码错误');
        return;
      }

      // 生成 Token
      const payload = { userId: user.id, username: user.username };
      const accessToken = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // 更新登录信息
      await prisma.sysUser.update({
        where: { id: user.id },
        data: {
          loginIp: req.ip || '',
          loginDate: new Date(),
        },
      });

      // 记录登录日志
      await prisma.sysLoginLog.create({
        data: {
          username,
          ip: req.ip || '',
          status: 0,
          msg: '登录成功',
        },
      });

      // 返回用户信息
      const roles = user.roles.map((ur) => ur.role.code);
      const permissions = await getUserPermissions(user.id);

      success(res, {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          sex: user.sex,
          dept: user.dept,
          roles,
          permissions,
        },
      });
    } catch (error) {
      console.error('登录失败:', error);
      fail(res, '登录失败');
    }
  }
);

// 刷新 Token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    badRequest(res, '刷新令牌不能为空');
    return;
  }

  try {
    const payload = verifyToken(refreshToken);
    const user = await prisma.sysUser.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.status !== 0) {
      unauthorized(res, '用户不存在或已停用');
      return;
    }

    const newPayload = { userId: user.id, username: user.username };
    const accessToken = generateToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    success(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    unauthorized(res, '刷新令牌无效或已过期');
  }
});

// 获取当前用户信息
router.get('/info', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.sysUser.findUnique({
      where: { id: req.user!.userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        dept: true,
        posts: {
          include: {
            post: true,
          },
        },
      },
    });

    if (!user) {
      unauthorized(res, '用户不存在');
      return;
    }

    const roles = user.roles.map((ur) => ur.role.code);
    const posts = user.posts.map((up) => up.post.name);
    const permissions = await getUserPermissions(user.id);

    success(res, {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      sex: user.sex,
      dept: user.dept,
      roles,
      posts,
      permissions,
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    fail(res, '获取用户信息失败');
  }
});

// 登出
router.post('/logout', auth, async (req: Request, res: Response): Promise<void> => {
  // JWT 是无状态的，客户端删除 Token 即可
  // 这里可以记录登出日志
  try {
    await prisma.sysLoginLog.create({
      data: {
        username: req.user!.username,
        ip: req.ip || '',
        status: 0,
        msg: '登出成功',
      },
    });
    success(res, null, '登出成功');
  } catch (error) {
    success(res, null, '登出成功');
  }
});

// 获取用户权限列表
async function getUserPermissions(userId: number): Promise<string[]> {
  const roleMenus = await prisma.sysRoleMenu.findMany({
    where: {
      role: {
        users: {
          some: {
            userId,
          },
        },
      },
      menu: {
        status: 0,
        permission: { not: null },
      },
    },
    include: {
      menu: true,
    },
  });

  const permissions = new Set<string>();
  roleMenus.forEach((rm) => {
    if (rm.menu.permission) {
      permissions.add(rm.menu.permission);
    }
  });

  return Array.from(permissions);
}

export default router;
