<template>
  <div class="app-wrapper" :class="{ 'sidebar-collapsed': !appStore.sidebar.opened }">
    <!-- 侧边栏 -->
    <div class="sidebar-container">
      <div class="logo-container">
        <img src="@/assets/logo.svg" class="logo" alt="Logo" />
        <span v-show="appStore.sidebar.opened" class="title">Admin Pro</span>
      </div>
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="!appStore.sidebar.opened"
          :collapse-transition="false"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          router
        >
          <sidebar-item v-for="menu in permissionStore.menus" :key="menu.path" :item="menu" :base-path="menu.path" />
        </el-menu>
      </el-scrollbar>
      <!-- 折叠/展开按钮 -->
      <div class="collapse-btn" @click="appStore.toggleSidebar">
        <el-icon>
          <Fold v-if="appStore.sidebar.opened" />
          <Expand v-else />
        </el-icon>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <div class="navbar">
        <div class="left">
          <el-icon class="hamburger" @click="appStore.toggleSidebar">
            <Fold v-if="appStore.sidebar.opened" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :src="userStore.userInfo?.avatar" :size="30" />
              <span class="username">{{ userStore.userInfo?.nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 标签页 -->
      <tags-view v-if="appStore.showTagsView" />

      <!-- 页面内容 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <keep-alive :include="tagsStore.cachedViews">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import { usePermissionStore } from '@/stores/permission';
import { useTagsStore } from '@/stores/tags';
import SidebarItem from './components/SidebarItem.vue';
import Breadcrumb from './components/Breadcrumb.vue';
import TagsView from './components/TagsView.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const tagsStore = useTagsStore();

const activeMenu = computed(() => route.path);

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await userStore.logout();
    router.push('/login');
  } else if (command === 'profile') {
    router.push('/system/user/profile');
  }
};
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

    .el-icon {
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
