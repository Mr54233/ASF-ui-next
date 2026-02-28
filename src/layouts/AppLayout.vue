<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': settingsStore.sidebarCollapsed }">
    <!-- 侧边栏 -->
    <aside class="app-sidebar" :class="{ 'collapsed': settingsStore.sidebarCollapsed }">
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
          active-class="active"
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
          <div
            class="connection-status"
            :class="{ connected: asfStore.connected }"
          >
            <el-icon><CircleFilled /></el-icon>
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
import { useRouter } from 'vue-router'
import { useAsfStore } from '@/stores/asf'
import { useBotsStore } from '@/stores/bots'
import { useSettingsStore } from '@/stores/settings'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Fold, RefreshRight, CircleClose, CircleFilled } from '@element-plus/icons-vue'

const router = useRouter()
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

onMounted(() => {
  // 启动 Bot 自动更新
  botsStore.startAutoUpdate()
  // 应用暗色主题
  settingsStore.applyTheme()
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
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #0a0a0a;
}

// 侧边栏
.app-sidebar {
  width: 240px;
  background-color: #141414;
  border-right: 1px solid #2b2b2c;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  &.collapsed {
    width: 64px;

    .nav-text,
    .sidebar-stats {
      display: none;
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #2b2b2c;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #e5eaf3;
}

.collapse-btn {
  background: none;
  border: none;
  color: #a3a6ad;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s;

  &:hover {
    color: #e5eaf3;
    background-color: #262727;
  }
}

// 导航
.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #cfd3dc;
  text-decoration: none;
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s;

  &:hover {
    background-color: #262727;
    color: #e5eaf3;
  }

  &.active {
    background-color: #409eff;
    color: #ffffff;
  }
}

// 统计
.sidebar-stats {
  padding: 16px;
  border-top: 1px solid #2b2b2c;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #e5eaf3;

  &.farming {
    color: #67c23a;
  }
}

.stat-label {
  font-size: 12px;
  color: #8d9095;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: #2b2b2c;
}

// 主内容区
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Header
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #141414;
  border-bottom: 1px solid #2b2b2c;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #f56c6c;

  &.connected {
    background-color: #67c23a;
  }
}

.version {
  color: #cfd3dc;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 8px;
}

// 内容区
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式 - 移动端
@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    z-index: 100;
    height: 100%;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.collapsed {
      transform: translateX(0);
    }
  }

  .app-main {
    margin-left: 0;
  }

  .app-content {
    padding: 16px;
  }

  .header-left .version {
    font-size: 12px;
  }

  .header-right .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

// 响应式 - 平板
@media (min-width: 769px) and (max-width: 1024px) {
  .app-sidebar {
    width: 200px;

    &.collapsed {
      width: 64px;
    }
  }

  .app-content {
    padding: 20px;
  }
}
</style>
