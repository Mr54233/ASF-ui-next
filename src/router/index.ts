import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'bots',
        name: 'bots',
        component: () => import('@/views/AboutView.vue'),
        meta: { title: 'Bot 管理' },
      },
      {
        path: 'commands',
        name: 'commands',
        component: () => import('@/views/AboutView.vue'),
        meta: { title: '命令控制台' },
      },
      {
        path: 'log',
        name: 'log',
        component: () => import('@/views/AboutView.vue'),
        meta: { title: '日志' },
      },
      {
        path: 'asf-config',
        name: 'asf-config',
        component: () => import('@/views/AboutView.vue'),
        meta: { title: 'ASF 配置' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - ASF UI` : 'ASF UI'

  // 检查是否需要认证
  const requiresAuth = to.meta?.requiresAuth !== false

  if (requiresAuth && !authStore.authenticated) {
    // 未登录，跳转到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.name === 'login' && authStore.authenticated) {
    // 已登录，跳转到首页或重定向地址
    const redirect = (to.query?.redirect as string) || '/'
    next(redirect)
  } else {
    next()
  }
})

export default router
