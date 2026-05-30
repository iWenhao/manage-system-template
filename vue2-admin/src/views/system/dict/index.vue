<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--字典类型-->
      <el-col :span="10" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典类型</span>
          </div>
          <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="字典名称" prop="dictName">
              <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable size="small" @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="字典类型" prop="dictType">
              <el-input v-model="queryParams.dictType" placeholder="请输入字典类型" clearable size="small" @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:dict:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:dict:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:dict:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['system:dict:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
          </el-row>

          <el-table v-loading="loading" :data="typeList" @selection-change="handleSelectionChange" @row-click="handleRowClick" highlight-current-row>
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="字典编号" prop="dictId" width="80" />
            <el-table-column label="字典名称" prop="dictName" :show-overflow-tooltip="true" />
            <el-table-column label="字典类型" prop="dictType" :show-overflow-tooltip="true">
              <template slot-scope="scope">
                <el-link type="primary" @click="handleDictData(scope.row)">{{ scope.row.dictType }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="status" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '0' ? '' : 'danger'">{{ statusFormat(scope.row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']">修改</el-button>
                <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>

      <!--字典数据-->
      <el-col :span="14" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典数据</span>
          </div>
          <el-form :model="dataQueryParams" ref="dataQueryForm" :inline="true" v-show="showDataSearch" label-width="68px">
            <el-form-item label="字典标签" prop="dictLabel">
              <el-input v-model="dataQueryParams.dictLabel" placeholder="请输入字典标签" clearable size="small" @keyup.enter.native="handleDataQuery" />
            </el-form-item>
            <el-form-item label="字典值" prop="dictValue">
              <el-input v-model="dataQueryParams.dictValue" placeholder="请输入字典值" clearable size="small" @keyup.enter.native="handleDataQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleDataQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetDataQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAddData" v-hasPermi="['system:dict:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="dataSingle" @click="handleUpdateData" v-hasPermi="['system:dict:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="dataMultiple" @click="handleDeleteData" v-hasPermi="['system:dict:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExportData" v-hasPermi="['system:dict:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showDataSearch" @queryTable="getDataList"></right-toolbar>
          </el-row>

          <el-table v-loading="dataLoading" :data="dataList" @selection-change="handleDataSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="字典标签" prop="dictLabel" width="120" />
            <el-table-column label="字典值" prop="dictValue" width="120" />
            <el-table-column label="字典排序" prop="dictSort" width="100" />
            <el-table-column label="状态" align="center" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '0' ? '' : 'danger'">{{ dataStatusFormat(scope.row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdateData(scope.row)" v-hasPermi="['system:dict:edit']">修改</el-button>
                <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDeleteData(scope.row)" v-hasPermi="['system:dict:remove']">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="dataTotal > 0" :total="dataTotal" :page.sync="dataQueryParams.pageNum" :limit.sync="dataQueryParams.pageSize" @pagination="getDataList" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改字典类型对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改字典数据对话框 -->
    <el-dialog :title="dataTitle" :visible.sync="dataOpen" width="500px" append-to-body>
      <el-form ref="dataForm" :model="dataForm" :rules="dataRules" label-width="100px">
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="dataForm.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="请输入字典值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="dataForm.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="dataForm.listClass" placeholder="请选择">
            <el-option v-for="item in listClassOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="dataForm.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dataForm.status">
            <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataForm">确 定</el-button>
        <el-button @click="cancelData">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listType, getType, delType, addType, updateType, listData, getData, delData, addData, updateData } from '@/api/system'

export default {
  name: 'Dict',
  data() {
    return {
      // 遮罩层
      loading: true,
      dataLoading: true,
      // 选中数组
      ids: [],
      dataIds: [],
      // 非单个禁用
      single: true,
      dataSingle: true,
      // 非多个禁用
      multiple: true,
      dataMultiple: true,
      // 显示搜索条件
      showSearch: true,
      showDataSearch: true,
      // 总条数
      total: 0,
      dataTotal: 0,
      // 字典类型表格数据
      typeList: [],
      // 字典数据表格数据
      dataList: [],
      // 弹出层标题
      title: '',
      dataTitle: '',
      // 是否显示弹出层
      open: false,
      dataOpen: false,
      // 状态数据字典
      statusOptions: [],
      // 数据标签回显样式
      listClassOptions: [
        { value: 'default', label: '默认' },
        { value: 'primary', label: '主要' },
        { value: 'success', label: '成功' },
        { value: 'info', label: '信息' },
        { value: 'warning', label: '警告' },
        { value: 'danger', label: '危险' }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined
      },
      dataQueryParams: {
        pageNum: 1,
        pageSize: 10,
        dictType: undefined,
        dictLabel: undefined,
        dictValue: undefined
      },
      // 表单参数
      form: {},
      dataForm: {},
      // 当前选中的字典类型
      currentDictType: '',
      // 表单校验
      rules: {
        dictName: [
          { required: true, message: '字典名称不能为空', trigger: 'blur' }
        ],
        dictType: [
          { required: true, message: '字典类型不能为空', trigger: 'blur' }
        ]
      },
      dataRules: {
        dictLabel: [
          { required: true, message: '字典标签不能为空', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '字典值不能为空', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '字典排序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询字典类型列表 */
    getList() {
      this.loading = true
      listType(this.queryParams).then(response => {
          this.typeList = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },
    /** 查询字典数据列表 */
    getDataList() {
      this.dataLoading = true
      listData(this.dataQueryParams).then(response => {
          this.dataList = response.rows
          this.dataTotal = response.total
          this.dataLoading = false
        }
      )
    },
    // 字典类型状态字典翻译
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 字典数据状态字典翻译
    dataStatusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 取消按钮（字典数据）
    cancelData() {
      this.dataOpen = false
      this.resetData()
    },
    // 字典类型表单重置
    reset() {
      this.form = {
        dictId: undefined,
        dictName: undefined,
        dictType: undefined,
        status: '0',
        remark: undefined
      }
      this.resetForm('form')
    },
    // 字典数据表单重置
    resetData() {
      this.dataForm = {
        dictCode: undefined,
        dictSort: 0,
        dictLabel: undefined,
        dictValue: undefined,
        cssClass: undefined,
        listClass: 'default',
        dictType: this.currentDictType,
        status: '0',
        remark: undefined
      }
      this.resetForm('dataForm')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 数据搜索按钮操作 */
    handleDataQuery() {
      this.dataQueryParams.pageNum = 1
      this.getDataList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 数据重置按钮操作 */
    resetDataQuery() {
      this.resetForm('dataQueryForm')
      this.handleDataQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dictId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    // 数据多选框选中数据
    handleDataSelectionChange(selection) {
      this.dataIds = selection.map(item => item.dictCode)
      this.dataSingle = selection.length != 1
      this.dataMultiple = !selection.length
    },
    // 点击字典类型行
    handleRowClick(row) {
      this.currentDictType = row.dictType
      this.dataQueryParams.dictType = row.dictType
      this.getDataList()
    },
    /** 字典类型新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加字典类型'
    },
    /** 字典数据新增按钮操作 */
    handleAddData() {
      if (!this.currentDictType) {
        this.msgWarning('请先选择字典类型')
        return
      }
      this.resetData()
      this.dataOpen = true
      this.dataTitle = '添加字典数据'
    },
    /** 字典类型修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const dictId = row.dictId || this.ids
      getType(dictId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改字典类型'
      })
    },
    /** 字典数据修改按钮操作 */
    handleUpdateData(row) {
      this.resetData()
      const dictCode = row.dictCode || this.dataIds
      getData(dictCode).then(response => {
        this.dataForm = response.data
        this.dataOpen = true
        this.dataTitle = '修改字典数据'
      })
    },
    /** 查看字典数据 */
    handleDictData(row) {
      this.currentDictType = row.dictType
      this.dataQueryParams.dictType = row.dictType
      this.getDataList()
    },
    /** 字典类型提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.dictId != undefined) {
            updateType(this.form).then(response => {
              this.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addType(this.form).then(response => {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 字典数据提交按钮 */
    submitDataForm: function() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (this.dataForm.dictCode != undefined) {
            updateData(this.dataForm).then(response => {
              this.msgSuccess('修改成功')
              this.dataOpen = false
              this.getDataList()
            })
          } else {
            addData(this.dataForm).then(response => {
              this.msgSuccess('新增成功')
              this.dataOpen = false
              this.getDataList()
            })
          }
        }
      })
    },
    /** 字典类型删除按钮操作 */
    handleDelete(row) {
      const dictIds = row.dictId || this.ids
      this.$confirm('是否确认删除字典编号为"' + dictIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delType(dictIds)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /** 字典数据删除按钮操作 */
    handleDeleteData(row) {
      const dictCodes = row.dictCode || this.dataIds
      this.$confirm('是否确认删除字典数据编号为"' + dictCodes + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delData(dictCodes)
      }).then(() => {
        this.getDataList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /** 字典类型导出按钮操作 */
    handleExport() {
      this.download('system/dict/type/export', {
        ...this.queryParams
      }, `dict_type_${new Date().getTime()}.xlsx`)
    },
    /** 字典数据导出按钮操作 */
    handleExportData() {
      this.download('system/dict/data/export', {
        ...this.dataQueryParams
      }, `dict_data_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.box-card {
  height: calc(100vh - 84px);
}
</style>