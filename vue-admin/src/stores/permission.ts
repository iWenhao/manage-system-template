import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserMenus } from '@/api/system';

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<any[]>([]);
  const addRoutes = ref<any[]>([]);

  async function generateRoutes() {
    const res: any = await getUserMenus();
    menus.value = res.data;
    const routes = filterAsyncRoutes(res.data);
    addRoutes.value = routes;
    return routes;
  }

  function filterAsyncRoutes(menus: any[]): any[] {
    const routes: any[] = [];
    menus.forEach((menu: any) => {
      const route: any = {
        path: menu.path,
        name: menu.name,
        meta: {
          title: menu.name,
          icon: menu.icon,
          hidden: menu.visible === 1,
          noCache: !menu.isCache,
        },
      };

      if (menu.type === 0) {
        // 目录
        route.component = () => import('@/layouts/index.vue');
        route.redirect = menu.path;
        if (menu.children && menu.children.length > 0) {
          route.children = filterAsyncRoutes(menu.children);
        }
      } else if (menu.type === 1) {
        // 菜单
        if (menu.component) {
          route.component = () => import(`@/views/${menu.component}.vue`);
        }
        if (menu.children && menu.children.length > 0) {
          route.children = filterAsyncRoutes(menu.children);
        }
      }

      if (menu.type !== 2) {
        routes.push(route);
      }
    });
    return routes;
  }

  function resetState() {
    menus.value = [];
    addRoutes.value = [];
  }

  return {
    menus,
    addRoutes,
    generateRoutes,
    resetState,
  };
});
