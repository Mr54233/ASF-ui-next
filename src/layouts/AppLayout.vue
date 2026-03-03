<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': settingsStore.sidebarCollapsed }">
    <!-- 移动端遮罩 -->
    <div class="sidebar-overlay" @click="settingsStore.toggleSidebar"></div>

    <!-- 侧边栏 -->
    <aside class="app-sidebar" :class="{ collapsed: settingsStore.sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">ASF</div>
        <button class="collapse-btn" @click="settingsStore.toggleSidebar">
          <el-icon :size="20"><Fold /></el-icon>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActiveRoute(item.path) }"
        >
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 统计数据 -->
      <div class="sidebar-stats" v-if="asfStore.isRunning">
        <div class="stat-item">
          <span class="stat-value">{{ botsStore.botsCount }}</span>
          <span class="stat-label">Bots</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value farming">{{ botsStore.farmingCount }}</span>
          <span class="stat-label">挂卡中</span>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="app-main">
      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <div class="connection-status" :class="{ connected: asfStore.connected }">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
          <span class="version">ASF {{ asfStore.version }}</span>
        </div>

        <div class="header-right">
          <el-button size="small" @click="restartASF">
            <el-icon><RefreshRight /></el-icon>
            重启
          </el-button>
          <el-button size="small" @click="shutdownASF">
            <el-icon><CircleClose /></el-icon>
            关闭
          </el-button>
        </div>
      </header>

      <!-- 路由出口 -->
      <div class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAsfStore } from '@/stores/asf'
import { useBotsStore } from '@/stores/bots'
import { useSettingsStore } from '@/stores/settings'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  RefreshRight,
  CircleClose,
  CircleCheckFilled,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const asfStore = useAsfStore()
const botsStore = useBotsStore()
const settingsStore = useSettingsStore()

// 导航菜单
const navItems = [
  { path: '/', label: '首页', icon: 'House' },
  { path: '/bots', label: 'Bot 管理', icon: 'User' },
  { path: '/commands', label: '命令控制台', icon: 'Monitor' },
  { path: '/log', label: '日志', icon: 'Document' },
  { path: '/asf-config', label: 'ASF 配置', icon: 'Setting' },
]

// 判断路由是否激活
function isActiveRoute(path: string): boolean {
  if (path === '/') {
    // 首页需要精确匹配
    return route.path === '/'
  }
  // 其他路径使用前缀匹配
  return route.path.startsWith(path)
}

onMounted(() => {
  // 启动 Bot 自动更新
  botsStore.startAutoUpdate()
})

// 重启 ASF
async function restartASF() {
  try {
    await ElMessageBox.confirm('确定要重启 ASF 吗？', '确认', {
      type: 'warning',
    })
    ElMessage.success('ASF 正在重启...')
    // TODO: 调用重启 API
  } catch {
    // 用户取消
  }
}

// 关闭 ASF
async function shutdownASF() {
  try {
    await ElMessageBox.confirm('确定要关闭 ASF 吗？', '确认', {
      type: 'warning',
    })
    ElMessage.success('ASF 正在关闭...')
    // TODO: 调用关闭 API
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="less">
/* ============================================
   整体布局架构重构
   ============================================ */

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

/* ============================================
   Sidebar - 侧边栏
   ============================================ */
.app-sidebar {
  width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;

  &.collapsed {
    width: 64px;

    .nav-text,
    .sidebar-stats,
    .logo {
      display: none;
    }

    .sidebar-header {
      justify-content: center;
      padding: 20px 0;
    }

    .nav-item {
      justify-content: center;
      padding: 12px;
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
  transition: opacity 0.2s;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: var(--el-text-color-primary);
    background-color: var(--el-fill-color-light);
  }
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  overflow-x: hidden;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-dark);
    border-radius: 2px;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  border-radius: 10px;
  margin-bottom: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;

  &:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }

  &.active {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }
}

/* 侧边栏底部统计 */
.sidebar-stats {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-shrink: 0;
  background: var(--el-fill-color-extra-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;

  &.farming {
    color: var(--el-color-success);
  }
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background-color: var(--el-border-color);
}

/* ============================================
   Main - 主内容区
   ============================================ */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--el-color-danger);
  position: relative;

  &.connected {
    background-color: var(--el-color-success);
    box-shadow: 0 0 8px var(--el-color-success);
  }
}

.version {
  color: var(--el-text-color-regular);
  font-size: 14px;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* ============================================
   Content - 内容区（滚动容器）
   ============================================ */
.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-dark);
    border-radius: 4px;

    &:hover {
      background: var(--el-border-color-darker);
    }
  }
}

/* ============================================
   过渡动画
   ============================================ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ============================================
   移动端遮罩
   ============================================ */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 90;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;

  @media (max-width: 768px) {
    opacity: 1;
    visibility: visible;
  }
}

/* ============================================
   响应式设计
   ============================================ */

/* 移动端 */
@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);

    &.collapsed {
      transform: translateX(0);
    }
  }

  .app-content {
    padding: 16px;
  }

  .header-left .version {
    font-size: 12px;
  }

  .header-right .el-button {
    padding: 6px 10px;
    font-size: 12px;

    span {
      display: none;
    }
  }
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  .app-sidebar {
    width: 220px;

    &.collapsed {
      width: 64px;
    }
  }

  .app-content {
    padding: 20px;
  }
}

/* 大屏幕 */
@media (min-width: 1920px) {
  .app-sidebar {
    width: 280px;

    &.collapsed {
      width: 70px;
    }
  }

  .app-content {
    padding: 32px;
  }
}
</style>
