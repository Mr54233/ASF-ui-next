<template>
  <div class="cards-remaining-card card">
    <div class="card-header">
      <h3 class="card-title">剩余卡片统计</h3>
      <el-icon class="card-icon" size="20"><Grid /></el-icon>
    </div>

    <div class="card-content">
      <div class="main-stat">
        <div class="stat-value">{{ formatNumber(botsStore.cardsRemaining) }}</div>
        <div class="stat-label">剩余卡片张数</div>
      </div>

      <div class="sub-stats">
        <div class="sub-stat">
          <span class="sub-stat-value">{{ botsStore.gamesRemaining }}</span>
          <span class="sub-stat-label">个游戏</span>
        </div>

        <div class="sub-stat-divider" />

        <div class="sub-stat">
          <span class="sub-stat-value">{{ formatTime(botsStore.timeRemaining) }}</span>
          <span class="sub-stat-label">预计时间</span>
        </div>

        <div class="sub-stat-divider" />

        <div class="sub-stat">
          <span class="sub-stat-value">{{ botsStore.farmingCount }}</span>
          <span class="sub-stat-label">Bot 挂卡中</span>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Grid } from '@element-plus/icons-vue'
import { useBotsStore } from '@/stores/bots'

const botsStore = useBotsStore()

// 进度百分比（基于假设的总量，实际可能需要调整）
const progressPercent = computed(() => {
  const maxCards = 500 // 假设最大卡片数
  const percent = (botsStore.cardsRemaining / maxCards) * 100
  return Math.min(percent, 100)
})

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化时间
function formatTime(seconds: number): string {
  if (seconds === 0) return '无任务'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}天${hours}小时`
  }
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  if (minutes > 0) {
    return `${minutes}分钟`
  }
  return '即将完成'
}
</script>

<style scoped lang="less">
.cards-remaining-card {
  grid-column: span 2;
  grid-row: span 2;

  @media (max-width: 992px) {
    grid-column: span 1;
    grid-row: span 1;
  }
}

.card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.card-icon {
  color: var(--el-color-warning);
  opacity: 0.8;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-stat {
  text-align: center;
  margin-bottom: 20px;
}

.stat-value {
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-size: 48px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
}

.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.sub-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.sub-stat {
  text-align: center;
}

.sub-stat-value {
  display: block;
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.sub-stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.sub-stat-divider {
  width: 1px;
  height: 24px;
  background: var(--el-border-color-lighter);
}

.progress-bar {
  height: 4px;
  background: var(--el-fill-color-light);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e6a23c, #f0c78a);
  border-radius: 2px;
  transition: width 0.5s ease;
}
</style>
