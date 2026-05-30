<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input v-model="queryParams.noticeTitle" placeholder="请输入公告标�? @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input v-model="queryParams.createBy" placeholder="请输入操作人�? @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="请选择类型" clearable>
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
      <el-col :span="1.5">
        <el-button type="danger" plain :disabled="multiple" @click="handleDelete()">删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" width="50" />
      <el-table-column prop="noticeTitle" label="公告标题" width="200">
        <template #default="scope">
          <el-link type="primary" @click="handleView(scope.row)">{{ scope.row.noticeTitle }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="noticeType" label="类型" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.noticeType === 1 ? 'success' : 'warning'">{{ scope.row.noticeType === 1 ? '通知' : '公告' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状�? width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">{{ scope.row.status === 0 ? '正常' : '关闭' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建�? width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-show="total > 0" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form ref="noticeRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="公告标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入公告标�? />
        </el-form-item>
        <el-form-item label="类型" prop="noticeType">
          <el-radio-group v-model="form.noticeType">
            <el-radio :value="1">通知</el-radio>
            <el-radio :value="2">公告</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状�?>
          <el-radio-group v-model="form.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容" prop="noticeContent">
          <el-input v-model="form.noticeContent" type="textarea" :rows="5" placeholder="请输入内�? />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="查看公告" v-model="viewVisible" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="公告标题">{{ viewData.noticeTitle }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ viewData.noticeType === 1 ? '通知' : '公告' }}</el-descriptions-item>
        <el-descriptions-item label="状�?>{{ viewData.status === 0 ? '正常' : '关闭' }}</el-descriptions-item>
        <el-descriptions-item label="创建�?>{{ viewData.createBy }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ viewData.noticeContent }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
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
const viewVisible = ref(false);
const viewData = ref<any>({});
const multiple = ref(true);
const ids = ref<number[]>([]);

const queryParams = reactive({ pageNum: 1, pageSize: 10, noticeTitle: '', createBy: '', noticeType: undefined as number | undefined });
const form = reactive({ id: undefined as number | undefined, noticeTitle: '', noticeType: 1, noticeContent: '', status: 0 });
const rules = {
  noticeTitle: [{ required: true, message: '请输入公告标�?, trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  noticeContent: [{ required: true, message: '请输入内�?, trigger: 'blur' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listNotice(queryParams);
    noticeList.value = res.data.list;
    total.value = res.data.total;
  } finally { loading.value = false; }
};

const handleQuery = () => { queryParams.pageNum = 1; getList(); };
const resetQuery = () => { queryParams.noticeTitle = ''; queryParams.createBy = ''; queryParams.noticeType = undefined; handleQuery(); };

const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  dialogTitle.value = '新增公告';
  Object.assign(form, { id: undefined, noticeTitle: '', noticeType: 1, noticeContent: '', status: 0 });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改公告';
  const res: any = await getNotice(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleView = (row: any) => {
  viewData.value = row;
  viewVisible.value = true;
};

const handleDelete = (row?: any) => {
  const noticeIds = row ? [row.id] : ids.value;
  ElMessageBox.confirm('确认删除选中的公�?', '提示', { type: 'warning' }).then(async () => {
    await deleteNotice(noticeIds);
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
