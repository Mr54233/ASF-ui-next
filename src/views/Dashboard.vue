<template>
  <div class="dashboard">
    <!-- 工具栏 -->
    <DashboardToolbar />

    <!-- 卡片网格布局 -->
    <div class="dashboard-grid">
      <!-- Bot 统计概览 (4x1) -->
      <BotsSummaryCard />

      <!-- Bot 状态分布 (2x2) -->
      <BotStatusCard />

      <!-- 剩余卡片统计 (2x2) -->
      <CardsRemainingCard />

      <!-- ASF 信息卡片组 (4x1x1) -->
      <AsfInfoCard />

      <!-- 快捷操作条 (4x1, 可选) -->
      <QuickActionsBar :layout="dashboardSettings.layout" />

      <!-- 实时活动流 (4x2) -->
      <ActivityStreamCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useAsfStore } from '@/stores/asf'
import { useBotsStore } from '@/stores/bots'
import DashboardToolbar from '@/components/dashboard/DashboardToolbar.vue'
import BotsSummaryCard from '@/components/dashboard/BotsSummaryCard.vue'
import BotStatusCard from '@/components/dashboard/BotStatusCard.vue'
import CardsRemainingCard from '@/components/dashboard/CardsRemainingCard.vue'
import AsfInfoCard from '@/components/dashboard/AsfInfoCard.vue'
import QuickActionsBar from '@/components/dashboard/QuickActionsBar.vue'
import ActivityStreamCard from '@/components/dashboard/ActivityStreamCard.vue'

const asfStore = useAsfStore()
const botsStore = useBotsStore()

// Dashboard 设置
const dashboardSettings = ref({
  layout: {
    showQuickActions: true,
    compactMode: false,
  },
})

// 刷新定时器
let refreshInterval: number | null = null

// 初始化
onMounted(async () => {
  // 立即获取数据
  await Promise.all([
    asfStore.fetchInfo(),
    botsStore.fetchBots(),
  ])

  // 启动 Bot 自动更新
  botsStore.startAutoUpdate()

  // 启动 ASF 定期更新 (30 秒)
  refreshInterval = window.setInterval(() => {
    asfStore.fetchInfo()
  }, 30000)

  // 加载用户设置
  loadSettings()
})

// 清理
onUnmounted(() => {
  botsStore.stopAutoUpdate()
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// 加载设置
function loadSettings() {
  const saved = localStorage.getItem('dashboard-settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      dashboardSettings.value = parsed
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }
}
</script>

<style scoped lang="less">
.dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// 紧凑模式
.dashboard-grid.compact {
  gap: 8px;
}
</style>
