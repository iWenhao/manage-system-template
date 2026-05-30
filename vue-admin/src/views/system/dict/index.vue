<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="正常" :value="0" />
          <el-option label="停用" :value="1" />
        </el-select>
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
    </el-row>

    <el-table v-loading="loading" :data="dictList">
      <el-table-column type="index" width="50" />
      <el-table-column prop="name" label="字典名称" width="200" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="200" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
          <el-button link type="primary" @click="handleData(scope.row)">数据</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-show="total > 0"
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="getList"
      @current-change="getList"
    />

    <!-- 字典类型对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="dictRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
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

    <!-- 字典数据对话框 -->
    <el-dialog title="字典数据" v-model="dataVisible" width="800px">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain @click="handleAddData">新增</el-button>
        </el-col>
      </el-row>

      <el-table :data="dataList">
        <el-table-column prop="label" label="字典标签" width="150" />
        <el-table-column prop="value" label="字典值" width="150" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdateData(scope.row)">修改</el-button>
            <el-button link type="primary" @click="handleDeleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 字典数据表单对话框 -->
    <el-dialog :title="dataDialogTitle" v-model="dataDialogVisible" width="500px">
      <el-form ref="dataRef" :model="dataForm" :rules="dataRules" label-width="100px">
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="dataForm.label" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="dataForm.value" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dataForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDataForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  listDictType,
  getDictType,
  addDictType,
  updateDictType,
  deleteDictType,
  listDictData,
  getDictData,
  addDictData,
  updateDictData,
  deleteDictData,
} from '@/api/system';

const loading = ref(false);
const dictList = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dataVisible = ref(false);
const dataDialogVisible = ref(false);
const dataDialogTitle = ref('');
const dataList = ref<any[]>([]);
const currentDictTypeId = ref<number>(0);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  status: undefined as number | undefined,
});

const form = reactive({
  id: undefined as number | undefined,
  name: '',
  status: 0,
  remark: '',
});

const rules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
};

const dataForm = reactive({
  id: undefined as number | undefined,
  dictTypeId: 0,
  label: '',
  value: '',
  sort: 0,
  status: 0,
  remark: '',
});

const dataRules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listDictType(queryParams);
    dictList.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.dictName = '';
  queryParams.status = undefined;
  handleQuery();
};

const handleAdd = () => {
  dialogTitle.value = '新增字典类型';
  Object.assign(form, { id: undefined, name: '', status: 0, remark: '' });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改字典类型';
  const res: any = await getDictType(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该字典类型?', '提示', { type: 'warning' }).then(async () => {
    await deleteDictType(row.id);
    ElMessage.success('删除成功');
    getList();
  });
};

const submitForm = async () => {
  if (form.id) {
    await updateDictType(form.id, form);
    ElMessage.success('修改成功');
  } else {
    await addDictType(form);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};

const handleData = async (row: any) => {
  currentDictTypeId.value = row.id;
  const res: any = await listDictData({ dictTypeId: row.id });
  dataList.value = res.data;
  dataVisible.value = true;
};

const handleAddData = () => {
  dataDialogTitle.value = '新增字典数据';
  Object.assign(dataForm, {
    id: undefined,
    dictTypeId: currentDictTypeId.value,
    label: '',
    value: '',
    sort: 0,
    status: 0,
    remark: '',
  });
  dataDialogVisible.value = true;
};

const handleUpdateData = async (row: any) => {
  dataDialogTitle.value = '修改字典数据';
  const res: any = await getDictData(row.id);
  Object.assign(dataForm, res.data);
  dataDialogVisible.value = true;
};

const handleDeleteData = (row: any) => {
  ElMessageBox.confirm('确认删除该字典数据?', '提示', { type: 'warning' }).then(async () => {
    await deleteDictData(row.id);
    ElMessage.success('删除成功');
    handleData({ id: currentDictTypeId.value });
  });
};

const submitDataForm = async () => {
  if (dataForm.id) {
    await updateDictData(dataForm.id, dataForm);
    ElMessage.success('修改成功');
  } else {
    await addDictData(dataForm);
    ElMessage.success('新增成功');
  }
  dataDialogVisible.value = false;
  handleData({ id: currentDictTypeId.value });
};

onMounted(() => getList());
</script>
