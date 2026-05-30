<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="queryParams.username" placeholder="请输入用户名" @keyup.enter.native="handleQuery" />
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

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain @click="handleAdd">新增</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="userList">
      <el-table-column type="index" width="50" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="dept.name" label="部门" width="120" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="text" @click="handleResetPwd(scope.row)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-show="total > 0"
      :current-page.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="getList"
      @current-change="getList"
    />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form ref="userForm" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="!form.id">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="0">正常</el-radio>
                <el-radio :label="1">停用</el-radio>
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
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, getUser, addUser, updateUser, deleteUser, resetUserPwd, getAllRole } from '@/api/system'

export default {
  name: 'UserManage',
  data() {
    return {
      loading: false,
      userList: [],
      total: 0,
      dialogVisible: false,
      dialogTitle: '',
      roleOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: '',
        status: undefined,
      },
      form: {
        id: undefined,
        username: '',
        nickname: '',
        password: '',
        phone: '',
        email: '',
        status: 0,
        roleIds: [],
        remark: '',
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getList()
    this.getRoles()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const res = await listUser(this.queryParams)
        this.userList = res.data.list
        this.total = res.data.total
      } finally {
        this.loading = false
      }
    },
    async getRoles() {
      const res = await getAllRole()
      this.roleOptions = res.data
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.username = ''
      this.queryParams.status = undefined
      this.handleQuery()
    },
    handleAdd() {
      this.dialogTitle = '新增用户'
      this.form = {
        id: undefined,
        username: '',
        nickname: '',
        password: '',
        phone: '',
        email: '',
        status: 0,
        roleIds: [],
        remark: '',
      }
      this.dialogVisible = true
    },
    async handleUpdate(row) {
      this.dialogTitle = '修改用户'
      const res = await getUser(row.id)
      this.form = res.data
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该用户?', '提示', { type: 'warning' }).then(async () => {
        await deleteUser(row.id)
        this.$message.success('删除成功')
        this.getList()
      })
    },
    handleResetPwd(row) {
      this.$prompt('请输入新密码', '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: '123456',
      }).then(async ({ value }) => {
        await resetUserPwd(row.id, value)
        this.$message.success('重置成功')
      })
    },
    async submitForm() {
      if (this.form.id) {
        await updateUser(this.form.id, this.form)
        this.$message.success('修改成功')
      } else {
        await addUser(this.form)
        this.$message.success('新增成功')
      }
      this.dialogVisible = false
      this.getList()
    },
  },
}
</script>
