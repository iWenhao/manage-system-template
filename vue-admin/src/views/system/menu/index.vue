<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true">
      <el-form-item label="菜单名称">
        <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain @click="handleAdd()">新增</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="id"
      :tree-props="{ children: 'children' }"
      default-expand-all
    >
      <el-table-column prop="name" label="菜单名称" width="200" />
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="scope">
          <el-icon v-if="scope.row.icon">
            <component :is="scope.row.icon" />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.type === 0">目录</el-tag>
          <el-tag v-else-if="scope.row.type === 1" type="success">菜单</el-tag>
          <el-tag v-else type="warning">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" width="150" />
      <el-table-column prop="component" label="组件路径" width="200" />
      <el-table-column prop="permission" label="权限标识" width="150" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleAdd(scope.row)">新增</el-button>
          <el-button link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select
                v-model="form.parentId"
                :data="menuTreeOptions"
                :props="{ label: 'name', value: 'id', children: 'children' }"
                check-strictly
                placeholder="请选择上级菜单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :value="0">目录</el-radio>
                <el-radio :value="1">菜单</el-radio>
                <el-radio :value="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 2">
            <el-form-item label="路由路径">
              <el-input v-model="form.path" placeholder="请输入路由路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type === 1">
            <el-form-item label="组件路径">
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 0">
            <el-form-item label="权限标识">
              <el-input v-model="form.permission" placeholder="请输入权限标识" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.type !== 2">
            <el-form-item label="图标">
              <el-input v-model="form.icon" placeholder="请输入图标名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="0">正常</el-radio>
                <el-radio :value="1">停用</el-radio>
              </el-radio-group>
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
import { listMenu, getMenu, addMenu, updateMenu, deleteMenu } from '@/api/system';

const loading = ref(false);
const menuList = ref<any[]>([]);
const menuTreeOptions = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const queryParams = reactive({
  menuName: '',
});

const form = reactive({
  id: undefined as number | undefined,
  parentId: 0,
  name: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  type: 0,
  permission: '',
  visible: 0,
  status: 0,
});

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
};

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listMenu(queryParams);
    menuList.value = res.data;
    menuTreeOptions.value = [{ id: 0, name: '主类目', children: res.data }];
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => getList();

const resetQuery = () => {
  queryParams.menuName = '';
  getList();
};

const handleAdd = (row?: any) => {
  dialogTitle.value = '新增菜单';
  Object.assign(form, {
    id: undefined,
    parentId: row?.id || 0,
    name: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    type: row ? 1 : 0,
    permission: '',
    visible: 0,
    status: 0,
  });
  dialogVisible.value = true;
};

const handleUpdate = async (row: any) => {
  dialogTitle.value = '修改菜单';
  const res: any = await getMenu(row.id);
  Object.assign(form, res.data);
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该菜单?', '提示', { type: 'warning' }).then(async () => {
    await deleteMenu(row.id);
    ElMessage.success('删除成功');
    getList();
  });
};

const submitForm = async () => {
  if (form.id) {
    await updateMenu(form.id, form);
    ElMessage.success('修改成功');
  } else {
    await addMenu(form);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  getList();
};

onMounted(() => getList());
</script>
