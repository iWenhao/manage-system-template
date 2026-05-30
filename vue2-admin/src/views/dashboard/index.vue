<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header">用户数量</div>
          <div class="statistic">1,024</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header">在线用户</div>
          <div class="statistic">128</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header">今日访问</div>
          <div class="statistic">3,456</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div slot="header">系统消息</div>
          <div class="statistic">12</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div slot="header">快捷操作</div>
          <el-button @click="$router.push('/system/user')">用户管理</el-button>
          <el-button @click="$router.push('/system/role')">角色管理</el-button>
          <el-button @click="$router.push('/system/menu')">菜单管理</el-button>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">系统信息</div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统名称">Admin Pro</el-descriptions-item>
            <el-descriptions-item label="技术栈">Vue 2 + Element UI</el-descriptions-item>
            <el-descriptions-item label="当前版本">v1.0.0</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.statistic {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  text-align: center;
}
</style>
