// 统一响应工具
import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export function success<T>(res: Response, data?: T, message = '操作成功'): void {
  res.json({
    code: 200,
    message,
    data,
  });
}

export function fail(res: Response, message = '操作失败', code = 500): void {
  res.json({
    code,
    message,
  });
}

export function unauthorized(res: Response, message = '未授权'): void {
  res.status(401).json({
    code: 401,
    message,
  });
}

export function forbidden(res: Response, message = '权限不足'): void {
  res.status(403).json({
    code: 403,
    message,
  });
}

export function notFound(res: Response, message = '资源不存在'): void {
  res.status(404).json({
    code: 404,
    message,
  });
}

export function badRequest(res: Response, message = '请求参数错误'): void {
  res.status(400).json({
    code: 400,
    message,
  });
}

// 分页响应
export function pageSuccess<T>(
  res: Response,
  data: T[],
  total: number,
  pageNum: number,
  pageSize: number
): void {
  res.json({
    code: 200,
    message: '操作成功',
    data: {
      list: data,
      total,
      pageNum,
      pageSize,
      pages: Math.ceil(total / pageSize),
    },
  });
}
