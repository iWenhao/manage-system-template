<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model="queryParams.postName" placeholder="请输入岗位名称" @keyup.enter="handleQuery" />
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

    <el-table v-loading="loading" :data="postList">
      <el-table-column type="index" width="50" />
      <el-table-column prop="code" label="岗位编码" width="150" />
      <el-table-column prop="name" label="岗位名称" width="150" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
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

    <el-pagination
      v-show="total > 0"
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="getList"
      @current-change="getList"
    />

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="postRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="岗位编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入岗位编码" />
        </el-form-item>
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listPost, getPost, addPost, updatePost, deletePost } from '@/api/system';

const loading = ref(false);
const postList = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  postName: '',
  status: undefined as number | undefined,
});

const form = reactive({
  id: undefined as number | undefined,
  code: '',
  name: '',
  sort: 0,
  status: 0,
  remark: '',
});

const rules = {
  code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listPost(queryParams);
    postList.value = res.data.list;
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
  queryParams.postName = '';
  queryParams.status = undefined;
  handleQuery();
};

const handleAdd = () => {
  dialogTitle.value = '新增岗位';
  Object.assign(form, {
    id: undefined,
    code: '',
    name: '',
    sort: 0,
    status: 0,
    remark: '',
  });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改岗位';
  const res: any = await getPost(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该岗位?', '提示', { type: 'warning' }).then(async () => {
    await deletePost(row.id);
    ElMessage.success('删除成功');
    getList();
  });
};

const submitForm = async () => {
  if (form.id) {
    await updatePost(form.id, form);
    ElMessage.success('修改成功');
  } else {
    await addPost(form);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};

onMounted(() => getList());
</script>
