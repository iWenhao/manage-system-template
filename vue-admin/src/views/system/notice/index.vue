<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="公告标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入公告标题" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
          <el-option label="通知" :value="1" />
          <el-option label="公告" :value="2" />
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

    <el-table v-loading="loading" :data="noticeList">
      <el-table-column type="index" width="50" />
      <el-table-column prop="title" label="公告标题" width="200" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 1">通知</el-tag>
          <el-tag v-else type="warning">公告</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form ref="noticeRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">通知</el-radio>
            <el-radio :value="2">公告</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入内容" />
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
import { listNotice, getNotice, addNotice, updateNotice, deleteNotice } from '@/api/system';

const loading = ref(false);
const noticeList = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  type: undefined as number | undefined,
});

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  type: 1,
  content: '',
  status: 0,
});

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listNotice(queryParams);
    noticeList.value = res.data.list;
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
  queryParams.title = '';
  queryParams.type = undefined;
  handleQuery();
};

const handleAdd = () => {
  dialogTitle.value = '新增公告';
  Object.assign(form, {
    id: undefined,
    title: '',
    type: 1,
    content: '',
    status: 0,
  });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改公告';
  const res: any = await getNotice(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该公告?', '提示', { type: 'warning' }).then(async () => {
    await deleteNotice(row.id);
    ElMessage.success('删除成功');
    getList();
  });
};

const submitForm = async () => {
  if (form.id) {
    await updateNotice(form.id, form);
    ElMessage.success('修改成功');
  } else {
    await addNotice(form);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};

onMounted(() => getList());
</script>
