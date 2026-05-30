<template>
  <div class="app-wrapper" :class="{ 'sidebar-collapsed': !sidebarOpened }">
    <!-- 侧边栏 -->
    <div class="sidebar-container">
      <div class="logo-container">
        <img :src="appConfig.logo" class="logo" alt="Logo" />
        <span v-show="sidebarOpened" class="title">{{ appConfig.title }}</span>
      </div>
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="!sidebarOpened"
          :collapse-transition="false"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          router
        >
          <sidebar-item v-for="menu in menus" :key="menu.path" :item="menu" :base-path="menu.path" />
        </el-menu>
      </el-scrollbar>
      <!-- 折叠/展开按钮 -->
      <div class="collapse-btn" @click="toggleSidebar">
        <i :class="sidebarOpened ? 'el-icon-s-fold' : 'el-icon-s-unfold'"></i>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <div class="navbar">
        <div class="left">
          <i class="el-icon-s-fold hamburger" v-if="sidebarOpened" @click="toggleSidebar"></i>
          <i class="el-icon-s-unfold hamburger" v-else @click="toggleSidebar"></i>
          <breadcrumb />
        </div>
        <div class="right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :src="userInfo && userInfo.avatar" :size="30"></el-avatar>
              <span class="username">{{ userInfo && userInfo.nickname }}</span>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { appConfig } from '@/config/app'
import SidebarItem from './components/SidebarItem.vue'
import Breadcrumb from './components/Breadcrumb.vue'

export default {
  name: 'Layout',
  components: { SidebarItem, Breadcrumb },
  data() {
    return {
      appConfig,
      sidebarOpened: true,
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    menus() {
      return this.$store.state.menus || []
    },
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpened = !this.sidebarOpened
    },
    async handleCommand(command) {
      if (command === 'logout') {
        await this.$store.dispatch('logout')
        this.$router.push('/login')
      } else if (command === 'profile') {
        this.$router.push('/system/user/profile')
      }
    },
  },
  async created() {
    // 获取用户菜单
    try {
      const { getUserMenus } = await import('@/api/system')
      const res = await getUserMenus()
      this.$store.commit('SET_MENUS', res.data)
    } catch (error) {
      console.error('获取菜单失败:', error)
    }
  },
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  height: 100%;
}

.sidebar-container {
  width: var(--sidebar-width);
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .logo-container {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b2f3a;
    flex-shrink: 0;

    .logo {
      width: 32px;
      height: 32px;
    }

    .title {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      margin-left: 10px;
      white-space: nowrap;
    }
  }

  .menu-scrollbar {
    flex: 1;
    overflow: hidden;
  }

  .collapse-btn {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b2f3a;
    cursor: pointer;
    color: #bfcbd9;
    transition: all 0.3s;
    flex-shrink: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      color: #409eff;
      background-color: #263445;
    }

    i {
      font-size: 18px;
    }
  }
}

.sidebar-collapsed .sidebar-container {
  width: var(--sidebar-collapsed-width);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .left {
    display: flex;
    align-items: center;

    .hamburger {
      font-size: 20px;
      cursor: pointer;
      margin-right: 15px;
    }
  }

  .right {
    display: flex;
    align-items: center;

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;

      .username {
        margin-left: 8px;
        font-size: 14px;
      }
    }
  }
}

.app-main {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style>
