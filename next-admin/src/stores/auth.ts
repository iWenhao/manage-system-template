import { create } from 'zustand';
import Cookies from 'js-cookie';

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  userInfo: UserInfo | null;
  roles: string[];
  permissions: string[];
  setUserInfo: (user: UserInfo) => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userInfo: null,
  roles: [],
  permissions: [],
  setUserInfo: (user) => set({ userInfo: user, roles: user.roles, permissions: user.permissions }),
  hasRole: (role) => {
    const { roles } = get();
    return roles.includes('admin') || roles.includes(role);
  },
  hasPermission: (permission) => {
    const { roles, permissions } = get();
    return roles.includes('admin') || permissions.includes('*:*:*') || permissions.includes(permission);
  },
  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('userInfo');
    set({ userInfo: null, roles: [], permissions: [] });
  },
}));