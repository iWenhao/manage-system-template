// 操作日志记录中间件
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.js';

// 操作类型映射
const OPER_TYPE_MAP: Record<string, number> = {
  POST: 1,   // 新增
  PUT: 2,    // 修改
  DELETE: 3, // 删除
  GET: 4,    // 查询
};

// 记录操作日志
export function operLog(title: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();

    // 保存原始的 end 方法
    const originalEnd = res.end;

    // 重写 end 方法
    res.end = function (this: Response, ...args: any[]) {
      const duration = Date.now() - startTime;

      // 异步记录日志
      setImmediate(async () => {
        try {
          await prisma.sysOperLog.create({
            data: {
              title,
              method: req.method,
              requestMethod: req.method,
              url: req.originalUrl,
              ip: req.ip || req.socket.remoteAddress || '',
              operName: req.user?.username || 'anonymous',
              userId: req.user?.userId,
              status: res.statusCode >= 400 ? 1 : 0,
              errorMsg: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : undefined,
            },
          });
        } catch (error) {
          console.error('记录操作日志失败:', error);
        }
      });

      // 调用原始的 end 方法
      return originalEnd.apply(this, args as any);
    } as any;

    next();
  };
}
