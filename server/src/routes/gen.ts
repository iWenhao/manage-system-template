// 代码生成路由
import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';
import { importTableFromDb, previewCode } from '../services/gen.service.js';

const router = Router();

// 获取表列表
router.get(
  '/list',
  auth,
  checkPermission('tool:gen:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageNum = '1', pageSize = '10', tableName, tableComment } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);
      const skip = (page - 1) * size;

      const where: any = {};
      if (tableName) where.tableName = { contains: tableName as string };
      if (tableComment) where.tableComment = { contains: tableComment as string };

      const [list, total] = await Promise.all([
        prisma.genTable.findMany({
          where,
          skip,
          take: size,
          orderBy: { id: 'asc' },
        }),
        prisma.genTable.count({ where }),
      ]);

      pageSuccess(res, list, total, page, size);
    } catch (error) {
      console.error('获取表列表失败:', error);
      fail(res, '获取表列表失败');
    }
  }
);

// 获取列信息
router.get(
  '/columns/:tableId',
  auth,
  checkPermission('tool:gen:query'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = parseInt(req.params.tableId);
      const columns = await prisma.genTableColumn.findMany({
        where: { tableId },
        orderBy: { sort: 'asc' },
      });
      success(res, columns);
    } catch (error) {
      console.error('获取列信息失败:', error);
      fail(res, '获取列信息失败');
    }
  }
);

// 导入表
router.post(
  '/import',
  auth,
  checkPermission('tool:gen:import'),
  operLog('代码生成-导入'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tables } = req.body;

      if (!tables || !Array.isArray(tables) || tables.length === 0) {
        badRequest(res, '请选择要导入的表');
        return;
      }

      for (const tableName of tables) {
        // 检查是否已导入
        const existing = await prisma.genTable.findUnique({
          where: { tableName },
        });

        if (!existing) {
          await importTableFromDb(tableName);
        }
      }

      success(res, null, '导入成功');
    } catch (error: any) {
      console.error('导入表失败:', error);
      fail(res, error.message || '导入表失败');
    }
  }
);

// 获取数据库表列表（未导入的）
router.get(
  '/db/tables',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tableName } = req.query;

      // 查询数据库中的表
      let query = `
        SELECT 
          t.table_name,
          obj_description(c.oid) as table_comment
        FROM information_schema.tables t
        LEFT JOIN pg_class c ON c.relname = t.table_name
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT LIKE '_prisma_%'
      `;

      if (tableName) {
        query += ` AND t.table_name LIKE '%${tableName}%'`;
      }

      query += ` ORDER BY t.table_name`;

      const tables = await prisma.$queryRawUnsafe<any[]>(query);

      // 获取已导入的表名
      const importedTables = await prisma.genTable.findMany({
        select: { tableName: true },
      });
      const importedNames = new Set(importedTables.map((t) => t.tableName));

      // 标记是否已导入
      const result = tables.map((t) => ({
        tableName: t.table_name,
        tableComment: t.table_comment || t.table_name,
        isImported: importedNames.has(t.table_name),
      }));

      success(res, result);
    } catch (error) {
      console.error('获取数据库表列表失败:', error);
      fail(res, '获取数据库表列表失败');
    }
  }
);

// 更新表/列配置
router.put(
  '/:id',
  auth,
  checkPermission('tool:gen:edit'),
  operLog('代码生成-修改'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { table, columns } = req.body;

      await prisma.$transaction(async (tx) => {
        // 更新表信息
        if (table) {
          await tx.genTable.update({
            where: { id },
            data: {
              tableComment: table.tableComment,
              className: table.className,
              tplCategory: table.tplCategory,
              packageName: table.packageName,
              moduleName: table.moduleName,
              businessName: table.businessName,
              functionName: table.functionName,
              functionAuthor: table.functionAuthor,
            },
          });
        }

        // 更新列信息
        if (columns && Array.isArray(columns)) {
          for (const col of columns) {
            await tx.genTableColumn.update({
              where: { id: col.id },
              data: {
                columnComment: col.columnComment,
                javaType: col.javaType,
                javaField: col.javaField,
                isRequired: col.isRequired,
                isInsert: col.isInsert,
                isEdit: col.isEdit,
                isList: col.isList,
                isQuery: col.isQuery,
                queryType: col.queryType,
                htmlType: col.htmlType,
                dictType: col.dictType,
                sort: col.sort,
              },
            });
          }
        }
      });

      success(res, null, '修改成功');
    } catch (error) {
      console.error('更新配置失败:', error);
      fail(res, '更新配置失败');
    }
  }
);

// 删除表配置
router.delete(
  '/:id',
  auth,
  checkPermission('tool:gen:remove'),
  operLog('代码生成-删除'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      await prisma.$transaction(async (tx) => {
        await tx.genTableColumn.deleteMany({ where: { tableId: id } });
        await tx.genTable.delete({ where: { id } });
      });

      success(res, null, '删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      fail(res, '删除失败');
    }
  }
);

// 预览代码
router.post(
  '/preview/:id',
  auth,
  checkPermission('tool:gen:preview'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const code = await previewCode(id);
      success(res, code);
    } catch (error: any) {
      console.error('预览代码失败:', error);
      fail(res, error.message || '预览代码失败');
    }
  }
);

// 生成代码（下载）
router.post(
  '/download/:id',
  auth,
  checkPermission('tool:gen:code'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const code = await previewCode(id);

      // 返回代码内容，前端可以打包下载
      success(res, code);
    } catch (error: any) {
      console.error('生成代码失败:', error);
      fail(res, error.message || '生成代码失败');
    }
  }
);

// 批量生成代码
router.post(
  '/batch',
  auth,
  checkPermission('tool:gen:code'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tableIds } = req.body;

      if (!tableIds || !Array.isArray(tableIds) || tableIds.length === 0) {
        badRequest(res, '请选择要生成的表');
        return;
      }

      const result: Record<number, Record<string, string>> = {};

      for (const tableId of tableIds) {
        result[tableId] = await previewCode(tableId);
      }

      success(res, result);
    } catch (error: any) {
      console.error('批量生成代码失败:', error);
      fail(res, error.message || '批量生成代码失败');
    }
  }
);

export default router;
