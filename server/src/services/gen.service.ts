// 代码生成服务
import prisma from '../utils/prisma.js';

// 从数据库导入表结构
export async function importTableFromDb(tableName: string): Promise<void> {
  // 获取表信息
  const tableInfo = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      table_name,
      table_comment
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = '${tableName}'
  `);

  if (!tableInfo || tableInfo.length === 0) {
    throw new Error(`表 ${tableName} 不存在`);
  }

  // 获取列信息
  const columns = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      c.column_name,
      c.data_type as column_type,
      c.is_nullable,
      c.column_default,
      pgd.description as column_comment
    FROM information_schema.columns c
    LEFT JOIN pg_catalog.pg_statio_all_tables st ON c.table_schema = st.schemaname AND c.table_name = st.relname
    LEFT JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position
    WHERE c.table_schema = 'public'
    AND c.table_name = '${tableName}'
    ORDER BY c.ordinal_position
  `);

  // 生成类名（帕斯卡命名）
  const className = tableName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // 创建表记录
  const genTable = await prisma.genTable.create({
    data: {
      tableName,
      tableComment: tableInfo[0].table_comment || tableName,
      className,
      tplCategory: 'crud',
      packageName: 'com.admin',
      moduleName: tableName.split('_')[0],
      businessName: tableName.split('_').slice(1).join('_'),
      functionName: tableInfo[0].table_comment || tableName,
      functionAuthor: 'Admin Pro',
    },
  });

  // 创建列记录
  for (const col of columns) {
    const javaType = mapToJavaType(col.column_type);
    const javaField = toCamelCase(col.column_name);
    const isPk = col.column_name === 'id';
    const isIncrement = col.column_default?.includes('nextval') || false;

    await prisma.genTableColumn.create({
      data: {
        tableId: genTable.id,
        columnName: col.column_name,
        columnComment: col.column_comment || col.column_name,
        columnType: col.column_type,
        javaType,
        javaField,
        isPk,
        isIncrement,
        isRequired: col.is_nullable === 'NO' && !isPk && !col.column_default,
        isInsert: !isPk && !isIncrement && col.column_name !== 'created_at' && col.column_name !== 'updated_at',
        isEdit: !isPk && !isIncrement && col.column_name !== 'created_at' && col.column_name !== 'updated_at',
        isList: true,
        isQuery: col.column_name.includes('name') || col.column_name.includes('status') || col.column_name.includes('type'),
        queryType: col.column_name.includes('name') ? 'LIKE' : 'EQ',
        htmlType: getHtmlType(col.column_type, col.column_name),
        sort: 0,
      },
    });
  }
}

// 预览代码
export async function previewCode(tableId: number): Promise<Record<string, string>> {
  const table = await prisma.genTable.findUnique({
    where: { id: tableId },
    include: { columns: { orderBy: { sort: 'asc' } } },
  });

  if (!table) {
    throw new Error('表不存在');
  }

  return {
    'Prisma Model': generatePrismaModel(table),
    'Express Route': generateExpressRoute(table),
    'Vue Page': generateVuePage(table),
    'API File': generateApiFile(table),
  };
}

// 生成 Prisma Model
function generatePrismaModel(table: any): string {
  const fields = table.columns
    .map((col: any) => {
      let line = `  ${col.javaField}`;
      if (col.isPk) line += ' Int @id @default(autoincrement())';
      else {
        line += ` ${mapToPrismaType(col.javaType)}`;
        if (col.isRequired) line += '';
        else line += '?';
        if (col.javaField === 'createdAt') line += ' @default(now())';
        if (col.javaField === 'updatedAt') line += ' @updatedAt';
        if (col.columnName !== col.javaField) line += ` @map("${col.columnName}")`;
      }
      return line;
    })
    .join('\n');

  return `model ${table.className} {
${fields}

  @@map("${table.tableName}")
}`;
}

// 生成 Express Route
function generateExpressRoute(table: any): string {
  const lowerName = table.className.charAt(0).toLowerCase() + table.className.slice(1);
  const permissionPrefix = `${table.moduleName}:${table.businessName}`;

  return `import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';
import { success, fail, badRequest, pageSuccess, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';
import { operLog } from '../middleware/logger.js';

const router = Router();

// 获取${table.functionName}列表
router.get('/list', auth, checkPermission('${permissionPrefix}:list'), async (req: Request, res: Response) => {
  try {
    const { pageNum = '1', pageSize = '10' } = req.query;
    const page = parseInt(pageNum as string);
    const size = parseInt(pageSize as string);
    const skip = (page - 1) * size;

    const [list, total] = await Promise.all([
      prisma.${lowerName}.findMany({ skip, take: size, orderBy: { id: 'asc' } }),
      prisma.${lowerName}.count(),
    ]);

    pageSuccess(res, list, total, page, size);
  } catch (error) {
    fail(res, '获取列表失败');
  }
});

// 获取${table.functionName}详情
router.get('/:id', auth, checkPermission('${permissionPrefix}:query'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = await prisma.${lowerName}.findUnique({ where: { id } });
    if (!data) { notFound(res, '数据不存在'); return; }
    success(res, data);
  } catch (error) {
    fail(res, '获取详情失败');
  }
});

// 创建${table.functionName}
router.post('/', auth, checkPermission('${permissionPrefix}:add'), operLog('${table.functionName}-新增'), async (req: Request, res: Response) => {
  try {
    const data = await prisma.${lowerName}.create({ data: req.body });
    success(res, data, '创建成功');
  } catch (error) {
    fail(res, '创建失败');
  }
});

// 更新${table.functionName}
router.put('/:id', auth, checkPermission('${permissionPrefix}:edit'), operLog('${table.functionName}-修改'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.${lowerName}.update({ where: { id }, data: req.body });
    success(res, null, '修改成功');
  } catch (error) {
    fail(res, '修改失败');
  }
});

// 删除${table.functionName}
router.delete('/:id', auth, checkPermission('${permissionPrefix}:remove'), operLog('${table.functionName}-删除'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.${lowerName}.delete({ where: { id } });
    success(res, null, '删除成功');
  } catch (error) {
    fail(res, '删除失败');
  }
});

export default router;`;
}

// 生成 Vue 页面
function generateVuePage(table: any): string {
  const listColumns = table.columns
    .filter((col: any) => col.isList)
    .slice(0, 6)
    .map((col: any) => `        <el-table-column prop="${col.javaField}" label="${col.columnComment}" />`)
    .join('\n');

  return `<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
${table.columns
  .filter((col: any) => col.isQuery)
  .map(
    (col: any) =>
      `      <el-form-item label="${col.columnComment}" prop="${col.javaField}">
        <el-input v-model="queryParams.${col.javaField}" placeholder="请输入${col.columnComment}" />
      </el-form-item>`
  )
  .join('\n')}
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column type="index" width="50" />
${listColumns}
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="${table.className}Ref" :model="form" :rules="rules" label-width="100px">
${table.columns
  .filter((col: any) => col.isEdit)
  .map(
    (col: any) =>
      `        <el-form-item label="${col.columnComment}" prop="${col.javaField}">
          <el-input v-model="form.${col.javaField}" placeholder="请输入${col.columnComment}" />
        </el-form-item>`
  )
  .join('\n')}
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const dataList = ref([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

const form = reactive({
  id: undefined,
${table.columns
  .filter((col: any) => col.isEdit)
  .map((col: any) => `  ${col.javaField}: undefined,`)
  .join('\n')}
});

const rules = {
${table.columns
  .filter((col: any) => col.isRequired)
  .map((col: any) => `  ${col.javaField}: [{ required: true, message: '请输入${col.columnComment}', trigger: 'blur' }],`)
  .join('\n')}
};

// 获取列表
const getList = async () => {
  loading.value = true;
  // TODO: 调用 API
  loading.value = false;
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  getList();
};

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增${table.functionName}';
  dialogVisible.value = true;
};

// 修改
const handleUpdate = (row: any) => {
  dialogTitle.value = '修改${table.functionName}';
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该数据?', '提示', {
    type: 'warning',
  }).then(async () => {
    // TODO: 调用删除 API
    ElMessage.success('删除成功');
    getList();
  });
};

// 提交表单
const submitForm = async () => {
  // TODO: 调用新增/修改 API
  dialogVisible.value = false;
  getList();
};

getList();
</script>`;
}

// 生成 API 文件
function generateApiFile(table: any): string {
  const lowerName = table.className.charAt(0).toLowerCase() + table.className.slice(1);

  return `import request from '@/utils/request';

// 查询${table.functionName}列表
export function list${table.className}(params: any) {
  return request({
    url: '/api/${table.moduleName}/${table.businessName}/list',
    method: 'get',
    params,
  });
}

// 查询${table.functionName}详细
export function get${table.className}(id: number) {
  return request({
    url: '/api/${table.moduleName}/${table.businessName}/' + id,
    method: 'get',
  });
}

// 新增${table.functionName}
export function add${table.className}(data: any) {
  return request({
    url: '/api/${table.moduleName}/${table.businessName}',
    method: 'post',
    data,
  });
}

// 修改${table.functionName}
export function update${table.className}(id: number, data: any) {
  return request({
    url: '/api/${table.moduleName}/${table.businessName}/' + id,
    method: 'put',
    data,
  });
}

// 删除${table.functionName}
export function del${table.className}(id: number) {
  return request({
    url: '/api/${table.moduleName}/${table.businessName}/' + id,
    method: 'delete',
  });
}`;
}

// 辅助函数：数据库类型映射到 Java/TypeScript 类型
function mapToJavaType(dbType: string): string {
  const typeMap: Record<string, string> = {
    integer: 'number',
    bigint: 'number',
    smallint: 'number',
    numeric: 'number',
    decimal: 'number',
    real: 'number',
    'double precision': 'number',
    varchar: 'string',
    'character varying': 'string',
    text: 'string',
    boolean: 'boolean',
    timestamp: 'Date',
    'timestamp without time zone': 'Date',
    'timestamp with time zone': 'Date',
    date: 'Date',
    json: 'any',
    jsonb: 'any',
  };
  return typeMap[dbType.toLowerCase()] || 'string';
}

// 辅助函数：映射到 Prisma 类型
function mapToPrismaType(javaType: string): string {
  const typeMap: Record<string, string> = {
    number: 'Int',
    string: 'String',
    boolean: 'Boolean',
    Date: 'DateTime',
    any: 'Json',
  };
  return typeMap[javaType] || 'String';
}

// 辅助函数：下划线转驼峰
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 辅助函数：根据列类型和名称推断 HTML 类型
function getHtmlType(columnType: string, columnName: string): string {
  if (columnName.includes('time') || columnName.includes('date')) return 'datetime';
  if (columnName.includes('status') || columnName.includes('type')) return 'select';
  if (columnType === 'text') return 'textarea';
  if (columnType === 'boolean') return 'switch';
  return 'input';
}

export default {
  importTableFromDb,
  previewCode,
};
