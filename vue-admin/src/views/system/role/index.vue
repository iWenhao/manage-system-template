<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" @keyup.enter="handleQuery" />
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

    <el-table v-loading="loading" :data="roleList">
      <el-table-column type="index" width="50" />
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="code" label="角色编码" width="150" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">{{ scope.row.status === 0 ? '正常' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
          <el-button link type="primary" @click="handlePermission(scope.row)">权限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-show="total > 0" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
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

    <!-- 权限配置对话框 -->
    <el-dialog title="分配权限" v-model="permissionVisible" width="500px">
      <el-tree ref="menuTreeRef" :data="menuTree" show-checkbox node-key="id" :default-checked-keys="checkedMenuIds" :props="{ label: 'name', children: 'children' }" />
      <template #footer>
        <el-button @click="permissionVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPermission">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listRole, getRole, addRole, updateRole, deleteRole, listMenu } from '@/api/system';

const loading = ref(false);
const roleList = ref([]);
const total = ref(0);
const dialogVisible = ref(false);
const permissionVisible = ref(false);
const dialogTitle = ref('');
const menuTree = ref([]);
const checkedMenuIds = ref<number[]>([]);
const currentRoleId = ref<number>(0);

const queryParams = reactive({ pageNum: 1, pageSize: 10, roleName: '' });
const form = reactive({ id: undefined as number | undefined, name: '', code: '', sort: 0, status: 0, remark: '' });
const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listRole(queryParams);
    roleList.value = res.data.list;
    total.value = res.data.total;
  } finally { loading.value = false; }
};

const getMenuTree = async () => {
  const res: any = await listMenu();
  menuTree.value = res.data;
};

const handleQuery = () => { queryParams.pageNum = 1; getList(); };
const resetQuery = () => { queryParams.roleName = ''; handleQuery(); };

const handleAdd = () => {
  dialogTitle.value = '新增角色';
  Object.assign(form, { id: undefined, name: '', code: '', sort: 0, status: 0, remark: '' });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改角色';
  const res: any = await getRole(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该角色?', '提示', { type: 'warning' }).then(async () => {
    await deleteRole(row.id);
    ElMessage.success('删除成功');
    getList();
  });
};

const handlePermission = async (row: any) => {
  currentRoleId.value = row.id;
  const res: any = await getRole(row.id);
  checkedMenuIds.value = res.data.menuIds || [];
  permissionVisible.value = true;
};

const submitForm = async () => {
  if (form.id) {
    await updateRole(form.id, form);
    ElMessage.success('修改成功');
  } else {
    await addRole(form);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};

const submitPermission = async () => {
  // TODO: 调用更新角色菜单 API
  permissionVisible.value = false;
  ElMessage.success('权限分配成功');
};

onMounted(() => { getList(); getMenuTree(); });
</script>