<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="用户�? prop="username">
        <el-input v-model="queryParams.username" placeholder="请输入用户名" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状�? prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状�? clearable>
          <el-option label="正常" :value="0" />
          <el-option label="停用" :value="1" />
        </el-select>
      </el-form-item>
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
    <el-table v-loading="loading" :data="userList">
      <el-table-column type="index" width="50" />
      <el-table-column prop="username" label="用户�? width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="dept.name" label="部门" width="120" />
      <el-table-column prop="phone" label="手机�? width="120" />
      <el-table-column prop="status" label="状�? width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
          <el-button link type="primary" @click="handleResetPwd(scope.row)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-show="total > 0"
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="getList"
      @current-change="getList"
    />

    <!-- 新增/修改对话�?-->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户�? prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵�? />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="!form.id">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入密�? show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机�? prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮�? />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状�?>
              <el-radio-group v-model="form.status">
                <el-radio :value="0">正常</el-radio>
                <el-radio :value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择角色">
                <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备�? />
            </el-form-item>
          </el-col>
        </el-row>
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
import { listUser, getUser, addUser, updateUser, deleteUser, resetUserPwd, getAllRole } from '@/api/system';

const loading = ref(false);
const userList = ref<any[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const roleOptions = ref<any[]>([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
  status: undefined as number | undefined,
});

const form = reactive({
  id: undefined as number | undefined,
  username: '',
  nickname: '',
  password: '',
  phone: '',
  email: '',
  status: 0,
  roleIds: [] as number[],
  remark: '',
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵�?, trigger: 'blur' }],
  password: [{ required: true, message: '请输入密�?, trigger: 'blur' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listUser(queryParams);
    userList.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};

const getRoles = async () => {
  const res: any = await getAllRole();
  roleOptions.value = res.data;
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.username = '';
  queryParams.status = undefined;
  handleQuery();
};

const handleAdd = () => {
  dialogTitle.value = '新增用户';
  Object.assign(form, { id: undefined, username: '', nickname: '', password: '', phone: '', email: '', status: 0, roleIds: [], remark: '' });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改用户';
  const res: any = await getUser(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该用�?', '提示', { type: 'warning' }).then(async () => {
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    getList();
  });
};

const handleResetPwd = (row: any) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: '123456',
  }).then(async ({ value }) => {
    await resetUserPwd(row.id, value);
    ElMessage.success('重置成功');
  });
};

const submitForm = async () => {
  if (form.id) {
    await updateUser(form.id, form);
    ElMessage.success('修改成功');
  } else {
    await addUser(form);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};

onMounted(() => {
  getList();
  getRoles();
});
</script>
