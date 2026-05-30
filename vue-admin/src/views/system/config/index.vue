<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model="queryParams.configName" placeholder="请输入参数名称" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model="queryParams.configKey" placeholder="请输入参数键名" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain :disabled="multiple" @click="handleDelete()">删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" width="50" />
      <el-table-column prop="configName" label="参数名称" width="200" />
      <el-table-column prop="configKey" label="参数键名" width="200" />
      <el-table-column prop="configValue" label="参数键值" width="200" />
      <el-table-column prop="configType" label="系统内置" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.configType === 'Y' ? 'danger' : 'success'">{{ scope.row.configType === 'Y' ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="200" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-show="total > 0" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="configRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置">
          <el-radio-group v-model="form.configType">
            <el-radio label="Y">是</el-radio>
            <el-radio label="N">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listConfig, getConfig, addConfig, updateConfig, deleteConfig } from '@/api/system';

const loading = ref(false);
const configList = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const multiple = ref(true);
const ids = ref<number[]>([]);

const queryParams = reactive({ pageNum: 1, pageSize: 10, configName: '', configKey: '' });
const form = reactive({ id: undefined as number | undefined, configName: '', configKey: '', configValue: '', configType: 'Y', remark: '' });
const rules = {
  configName: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  configKey: [{ required: true, message: '请输入参数键名', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入参数键值', trigger: 'blur' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listConfig(queryParams);
    configList.value = res.data.list;
    total.value = res.data.total;
  } finally { loading.value = false; }
};

const handleQuery = () => { queryParams.pageNum = 1; getList(); };
const resetQuery = () => { queryParams.configName = ''; queryParams.configKey = ''; handleQuery(); };

const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  dialogTitle.value = '新增参数';
  Object.assign(form, { id: undefined, configName: '', configKey: '', configValue: '', configType: 'Y', remark: '' });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改参数';
  const res: any = await getConfig(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row?: any) => {
  const configIds = row ? [row.id] : ids.value;
  ElMessageBox.confirm('确认删除选中的参数?', '提示', { type: 'warning' }).then(async () => {
    for (const id of configIds) {
      await deleteConfig(id);
    }
    ElMessage.success('删除成功');
    getList();
  });
};

const submitForm = async () => {
  if (form.id) {
    await updateConfig(form.id, form);
    ElMessage.success('修改成功');
  } else {
    await addConfig(form);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};

onMounted(() => getList());
</script>
