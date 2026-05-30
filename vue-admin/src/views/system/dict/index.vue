<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="queryParams.dictName" placeholder="请输入字典名�? @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="queryParams.dictType" placeholder="请输入字典类�? @keyup.enter="handleQuery" />
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
      <el-table-column prop="dictName" label="字典名称" width="150" />
      <el-table-column prop="dictType" label="字典类型" width="200">
        <template #default="scope">
          <el-link type="primary" @click="handleDictData(scope.row)">{{ scope.row.dictType }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状�? width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">{{ scope.row.status === 0 ? '正常' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="200" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
          <el-button link type="primary" @click="handleDictData(scope.row)">数据</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-show="total > 0" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="dictRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名�? />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类�? />
        </el-form-item>
        <el-form-item label="状�?>
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备�? />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="字典数据" v-model="dictDataVisible" width="800px">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain @click="handleAddData">新增</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="dataLoading" :data="dictDataList">
        <el-table-column type="index" width="50" />
        <el-table-column prop="dictLabel" label="字典标签" width="150" />
        <el-table-column prop="dictValue" label="字典键�? width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状�? width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">{{ scope.row.status === 0 ? '正常' : '停用' }}</el-tag>
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

    <el-dialog :title="dataDialogTitle" v-model="dataDialogVisible" width="500px">
      <el-form ref="dataRef" :model="dataForm" :rules="dataRules" label-width="100px">
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="请输入字典标�? />
        </el-form-item>
        <el-form-item label="字典键�? prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="请输入字典键�? />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dataForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状�?>
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dataForm.remark" type="textarea" placeholder="请输入备�? />
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
import { listDictType, getDictType, addDictType, updateDictType, deleteDictType, listDictData, getDictData, addDictData, updateDictData, deleteDictData } from '@/api/system';

const loading = ref(false);
const dictList = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dictDataVisible = ref(false);
const dataLoading = ref(false);
const dictDataList = ref<any[]>([]);
const dataDialogVisible = ref(false);
const dataDialogTitle = ref('');
const currentDictType = ref('');

const queryParams = reactive({ pageNum: 1, pageSize: 10, dictName: '', dictType: '' });
const form = reactive({ id: undefined as number | undefined, dictName: '', dictType: '', status: 0, remark: '' });
const rules = {
  dictName: [{ required: true, message: '请输入字典名�?, trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入字典类�?, trigger: 'blur' }],
};

const dataForm = reactive({ id: undefined as number | undefined, dictType: '', dictLabel: '', dictValue: '', sort: 0, status: 0, remark: '' });
const dataRules = {
  dictLabel: [{ required: true, message: '请输入字典标�?, trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典键�?, trigger: 'blur' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listDictType(queryParams);
    dictList.value = res.data.list;
    total.value = res.data.total;
  } finally { loading.value = false; }
};

const handleQuery = () => { queryParams.pageNum = 1; getList(); };
const resetQuery = () => { queryParams.dictName = ''; queryParams.dictType = ''; handleQuery(); };

const handleAdd = () => {
  dialogTitle.value = '新增字典类型';
  Object.assign(form, { id: undefined, dictName: '', dictType: '', status: 0, remark: '' });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改字典类型';
  const res: any = await getDictType(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该字典类�?', '提示', { type: 'warning' }).then(async () => {
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

const handleDictData = async (row: any) => {
  currentDictType.value = row.dictType;
  dictDataVisible.value = true;
  await getDictDataList();
};

const getDictDataList = async () => {
  dataLoading.value = true;
  try {
    const res: any = await listDictData({ dictType: currentDictType.value });
    dictDataList.value = res.data;
  } finally { dataLoading.value = false; }
};

const handleAddData = () => {
  dataDialogTitle.value = '新增字典数据';
  Object.assign(dataForm, { id: undefined, dictType: currentDictType.value, dictLabel: '', dictValue: '', sort: 0, status: 0, remark: '' });
  dataDialogVisible.value = true;
};

const handleUpdateData = async (row: any) => {
  dataDialogTitle.value = '修改字典数据';
  const res: any = await getDictData(row.id);
  Object.assign(dataForm, res.data);
  dataDialogVisible.value = true;
};

const handleDeleteData = (row: any) => {
  ElMessageBox.confirm('确认删除该字典数�?', '提示', { type: 'warning' }).then(async () => {
    await deleteDictData(row.id);
    ElMessage.success('删除成功');
    getDictDataList();
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
  getDictDataList();
};

onMounted(() => getList());
</script>
