import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/auth';
import { setToken, setRefreshToken, removeToken } from '@/utils/auth';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<any>(null);
  const roles = ref<string[]>([]);
  const permissions = ref<string[]>([]);

  async function login(loginForm: { username: string; password: string }) {
    const res: any = await loginApi(loginForm);
    setToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    userInfo.value = res.data.user;
    roles.value = res.data.user.roles;
    permissions.value = res.data.user.permissions;
    return res;
  }

  async function getInfo() {
    const res: any = await getUserInfoApi();
    userInfo.value = res.data;
    roles.value = res.data.roles;
    permissions.value = res.data.permissions;
    return res;
  }

  async function logout() {
    try {
      await logoutApi();
    } finally {
      resetState();
    }
  }

  function resetState() {
    userInfo.value = null;
    roles.value = [];
    permissions.value = [];
    removeToken();
  }

  function hasRole(role: string): boolean {
    return roles.value.includes('admin') || roles.value.includes(role);
  }

  function hasPermission(permission: string): boolean {
    return roles.value.includes('admin') || permissions.value.includes('*:*:*') || permissions.value.includes(permission);
  }

  return {
    userInfo,
    roles,
    permissions,
    login,
    getInfo,
    logout,
    resetState,
    hasRole,
    hasPermission,
  };
});
