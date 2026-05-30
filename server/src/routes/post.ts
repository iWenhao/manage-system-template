// 岗位管理路由
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 获取岗位列表
router.get(
  '/list',
  auth,
  checkPermission('system:post:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        postCode,
        postName,
        status,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (postCode) where.code = { contains: postCode as string };
      if (postName) where.name = { contains: postName as string };
      if (status !== undefined && status !== '') where.status = parseInt(status as string);

      const [posts, total] = await Promise.all([
        prisma.sysPost.findMany({
          where,
          skip,
          take: size,
          orderBy: { sort: 'asc' },
        }),
        prisma.sysPost.count({ where }),
      ]);

      pageSuccess(res, posts, total, page, size);
    } catch (error) {
      console.error('获取岗位列表失败:', error);
      fail(res, '获取岗位列表失败');
    }
  }
);

// 获取岗位详情
router.get(
  '/:id',
  auth,
  checkPermission('system:post:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const post = await prisma.sysPost.findUnique({
        where: { id },
      });

      if (!post) {
        notFound(res, '岗位不存在');
        return;
      }

      success(res, post);
    } catch (error) {
      console.error('获取岗位详情失败:', error);
      fail(res, '获取岗位详情失败');
    }
  }
);

// 创建岗位
router.post(
  '/',
  auth,
  checkPermission('system:post:add'),
  operLog('岗位管理-新增'),
  [
    body('code').notEmpty().withMessage('岗位编码不能为空'),
    body('name').notEmpty().withMessage('岗位名称不能为空'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, errors.array()[0].msg);
      return;
    }

    try {
      const { code, name, sort, status, remark } = req.body;

      // 检查岗位编码是否已存在
      const existingPost = await prisma.sysPost.findUnique({
        where: { code },
      });

      if (existingPost) {
        badRequest(res, '岗位编码已存在');
        return;
      }

      const post = await prisma.sysPost.create({
        data: {
          code,
          name,
          sort: sort || 0,
          status: status || 0,
          remark,
        },
      });

      success(res, post, '创建成功');
    } catch (error) {
      console.error('创建岗位失败:', error);
      fail(res, '创建岗位失败');
    }
  }
);

// 更新岗位
router.put(
  '/:id',
  auth,
  checkPermission('system:post:edit'),
  operLog('岗位管理-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { code, name, sort, status, remark } = req.body;

      const existingPost = await prisma.sysPost.findUnique({
        where: { id },
      });

      if (!existingPost) {
        notFound(res, '岗位不存在');
        return;
      }

      // 检查岗位编码是否已存在
      if (code && code !== existingPost.code) {
        const duplicatePost = await prisma.sysPost.findUnique({
          where: { code },
        });

        if (duplicatePost) {
          badRequest(res, '岗位编码已存在');
          return;
        }
      }

      await prisma.sysPost.update({
        where: { id },
        data: {
          code,
          name,
          sort,
          status,
          remark,
        },
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新岗位失败:', error);
      fail(res, '更新岗位失败');
    }
  }
);

// 删除岗位
router.delete(
  '/:id',
  auth,
  checkPermission('system:post:remove'),
  operLog('岗位管理-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const post = await prisma.sysPost.findUnique({
        where: { id },
        include: {
          users: true,
        },
      });

      if (!post) {
        notFound(res, '岗位不存在');
        return;
      }

      if (post.users.length > 0) {
        badRequest(res, '岗位下存在用户，不允许删除');
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 删除用户岗位关联
        await tx.sysUserPost.deleteMany({ where: { postId: id } });
        // 删除岗位
        await tx.sysPost.delete({ where: { id } });
      });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除岗位失败:', error);
      fail(res, '删除岗位失败');
    }
  }
);

export default router;
