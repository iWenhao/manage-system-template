import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken } from '@/utils/auth';
import { useUserStore } from '@/stores/user';
import { usePermissionStore } from '@/stores/permission';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { hidden: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/index.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页', icon: 'HomeFilled', affix: true },
        },
      ],
    },
    {
      path: '/404',
      component: () => import('@/views/error/404.vue'),
      meta: { hidden: true },
    },
  ],
});

const whiteList = ['/login'];

router.beforeEach(async (to, _from, next) => {
  NProgress.start();
  const token = getToken();

  if (token) {
    if (to.path === '/login') {
      next('/');
    } else {
      const userStore = useUserStore();
      const permissionStore = usePermissionStore();

      if (userStore.roles.length === 0) {
        try {
          await userStore.getInfo();
          const routes = await permissionStore.generateRoutes();
          routes.forEach((route) => router.addRoute(route));
          router.addRoute({ path: '/:pathMatch(.*)*', redirect: '/404' });
          next({ ...to, replace: true });
        } catch {
          userStore.resetState();
          next('/login');
        }
      } else {
        next();
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next('/login');
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
