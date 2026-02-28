import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
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
  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - ASF UI` : 'ASF UI'
  next()
})

export default router
