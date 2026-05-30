// OAuth/SSO 路由
import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const router = Router();

// 授权端点
router.get(
  '/authorize',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { client_id, redirect_uri, response_type, scope, state } = req.query;

      if (!client_id || !redirect_uri || !response_type) {
        badRequest(res, '缺少必要参数');
        return;
      }

      // 验证客户端
      const client = await prisma.oAuthClient.findUnique({
        where: { clientId: client_id as string },
      });

      if (!client) {
        badRequest(res, '无效的客户端');
        return;
      }

      if (client.status !== 0) {
        badRequest(res, '客户端已被禁用');
        return;
      }

      // 验证重定向URI
      if (client.redirectUri !== redirect_uri) {
        badRequest(res, '无效的重定向URI');
        return;
      }

      // 生成授权码
      const code = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟过期

      await prisma.oAuthCode.create({
        data: {
          code,
          clientId: client.id,
          userId: req.user!.userId,
          redirectUri: redirect_uri as string,
          scope: scope as string,
          expiresAt,
        },
      });

      // 重定向回客户端
      const redirectUrl = new URL(redirect_uri as string);
      redirectUrl.searchParams.set('code', code);
      if (state) {
        redirectUrl.searchParams.set('state', state as string);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('授权失败:', error);
      fail(res, '授权失败');
    }
  }
);

// 获取Token
router.post(
  '/token',
  [
    body('grant_type').notEmpty().withMessage('grant_type不能为空'),
    body('code').optional(),
    body('client_id').notEmpty().withMessage('client_id不能为空'),
    body('client_secret').notEmpty().withMessage('client_secret不能为空'),
    body('redirect_uri').optional(),
    body('refresh_token').optional(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = req.body;

      // 验证客户端
      const client = await prisma.oAuthClient.findUnique({
        where: { clientId: client_id },
      });

      if (!client) {
        badRequest(res, '无效的客户端');
        return;
      }

      if (client.clientSecret !== client_secret) {
        badRequest(res, '客户端密钥错误');
        return;
      }

      if (client.status !== 0) {
        badRequest(res, '客户端已被禁用');
        return;
      }

      if (grant_type === 'authorization_code') {
        // 授权码模式
        if (!code) {
          badRequest(res, 'code不能为空');
          return;
        }

        // 查找授权码
        const authCode = await prisma.oAuthCode.findUnique({
          where: { code },
        });

        if (!authCode) {
          badRequest(res, '无效的授权码');
          return;
        }

        if (authCode.expiresAt < new Date()) {
          badRequest(res, '授权码已过期');
          return;
        }

        if (authCode.clientId !== client.id) {
          badRequest(res, '授权码与客户端不匹配');
          return;
        }

        if (redirect_uri && authCode.redirectUri !== redirect_uri) {
          badRequest(res, '重定向URI不匹配');
          return;
        }

        // 生成Token
        const accessToken = crypto.randomBytes(64).toString('hex');
        const refreshTokenValue = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时

        // 删除已使用的授权码
        await prisma.oAuthCode.delete({ where: { id: authCode.id } });

        // 保存Token
        const token = await prisma.oAuthToken.create({
          data: {
            accessToken,
            refreshToken: refreshTokenValue,
            clientId: client.id,
            userId: authCode.userId,
            scope: authCode.scope,
            expiresAt,
          },
        });

        success(res, {
          access_token: token.accessToken,
          refresh_token: token.refreshToken,
          token_type: 'Bearer',
          expires_in: 86400,
          scope: token.scope,
        });
      } else if (grant_type === 'refresh_token') {
        // 刷新Token模式
        if (!refresh_token) {
          badRequest(res, 'refresh_token不能为空');
          return;
        }

        // 查找刷新Token
        const existingToken = await prisma.oAuthToken.findFirst({
          where: { refreshToken: refresh_token },
        });

        if (!existingToken) {
          badRequest(res, '无效的refresh_token');
          return;
        }

        if (existingToken.clientId !== client.id) {
          badRequest(res, 'refresh_token与客户端不匹配');
          return;
        }

        // 生成新Token
        const newAccessToken = crypto.randomBytes(64).toString('hex');
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // 删除旧Token
        await prisma.oAuthToken.delete({ where: { id: existingToken.id } });

        // 保存新Token
        const newToken = await prisma.oAuthToken.create({
          data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            clientId: client.id,
            userId: existingToken.userId,
            scope: existingToken.scope,
            expiresAt: newExpiresAt,
          },
        });

        success(res, {
          access_token: newToken.accessToken,
          refresh_token: newToken.refreshToken,
          token_type: 'Bearer',
          expires_in: 86400,
          scope: newToken.scope,
        });
      } else {
        badRequest(res, '不支持的grant_type');
      }
    } catch (error) {
      console.error('获取Token失败:', error);
      fail(res, '获取Token失败');
    }
  }
);

// 获取用户信息
router.get(
  '/userinfo',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        badRequest(res, '缺少Authorization头');
        return;
      }

      const accessToken = authHeader.substring(7);

      // 查找Token
      const token = await prisma.oAuthToken.findUnique({
        where: { accessToken },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
              email: true,
              phone: true,
              avatar: true,
              sex: true,
              status: true,
            },
          },
        },
      });

      if (!token) {
        badRequest(res, '无效的access_token');
        return;
      }

      if (token.expiresAt < new Date()) {
        badRequest(res, 'access_token已过期');
        return;
      }

      success(res, {
        sub: token.user.id.toString(),
        name: token.user.username,
        nickname: token.user.nickname,
        email: token.user.email,
        phone: token.user.phone,
        picture: token.user.avatar,
        gender: token.user.sex,
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      fail(res, '获取用户信息失败');
    }
  }
);

// 获取客户端列表
router.get(
  '/clients',
  auth,
  checkPermission('system:oauth:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        name,
        status,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (name) where.name = { contains: name as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [clients, total] = await Promise.all([
        prisma.oAuthClient.findMany({
          where,
          skip,
          take: size,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            clientId: true,
            name: true,
            redirectUri: true,
            scope: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.oAuthClient.count({ where }),
      ]);

      success(res, {
        list: clients,
        total,
        pageNum: page,
        pageSize: size,
      });
    } catch (error) {
      console.error('获取客户端列表失败:', error);
      fail(res, '获取客户端列表失败');
    }
  }
);

// 创建客户端
router.post(
  '/clients',
  auth,
  checkPermission('system:oauth:add'),
  operLog('OAuth客户端-新增'),
  [
    body('name').notEmpty().withMessage('客户端名称不能为空'),
    body('redirectUri').notEmpty().withMessage('重定向URI不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { name, redirectUri, scope, status } = req.body;

      // 生成客户端ID和密钥
      const clientId = crypto.randomBytes(16).toString('hex');
      const clientSecret = crypto.randomBytes(32).toString('hex');

      const client = await prisma.oAuthClient.create({
        data: {
          clientId,
          clientSecret,
          name,
          redirectUri,
          scope,
          status: status || 0,
        },
      });

      success(res, {
        id: client.id,
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        name: client.name,
        redirectUri: client.redirectUri,
        scope: client.scope,
        status: client.status,
      }, '创建成功');
    } catch (error) {
      console.error('创建客户端失败:', error);
      fail(res, '创建客户端失败');
    }
  }
);

export default router;
