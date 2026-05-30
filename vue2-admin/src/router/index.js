import Vue from 'vue'
import VueRouter from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
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
        meta: { title: '首页', icon: 'el-icon-s-home', affix: true },
      },
    ],
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const token = getToken()

  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      if (store.state.roles.length === 0) {
        try {
          await store.dispatch('getInfo')
          const asyncRoutes = await generateRoutes()
          asyncRoutes.forEach(route => router.addRoute(route))
          router.addRoute({ path: '*', redirect: '/404' })
          next({ ...to, replace: true })
        } catch {
          store.dispatch('resetState')
          next('/login')
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

// 生成动态路由
async function generateRoutes() {
  const res = await import('@/api/system').then(m => m.getUserMenus())
  const menus = res.data
  return filterAsyncRoutes(menus)
}

function filterAsyncRoutes(menus) {
  const routes = []
  menus.forEach(menu => {
    const route = {
      path: menu.path,
      name: menu.name,
      meta: {
        title: menu.name,
        icon: menu.icon,
        hidden: menu.visible === 1,
        noCache: !menu.isCache,
      },
    }

    if (menu.type === 0) {
      // 目录
      route.component = () => import('@/layouts/index.vue')
      route.redirect = menu.path
      if (menu.children && menu.children.length > 0) {
        route.children = filterAsyncRoutes(menu.children)
      }
    } else if (menu.type === 1) {
      // 菜单
      if (menu.component) {
        route.component = () => import(`@/views/${menu.component}.vue`)
      }
      if (menu.children && menu.children.length > 0) {
        route.children = filterAsyncRoutes(menu.children)
      }
    }

    if (menu.type !== 2) {
      routes.push(route)
    }
  })
  return routes
}

export default router
