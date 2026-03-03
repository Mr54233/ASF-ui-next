<template>
  <div class="bots-summary-card card">
    <div class="stat-group">
      <div class="stat-item">
        <div class="stat-icon bots">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ botsCount }}</div>
          <div class="stat-label">Bots</div>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-item">
        <div class="stat-icon farming">
          <el-icon><VideoPlay /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value farming">{{ farmingCount }}</div>
          <div class="stat-label">挂卡中</div>
        </div>
      </div>
    </div>

    <!-- 状态条 -->
    <div class="status-bar">
      <div
        v-for="status in statusItems"
        :key="status.label"
        class="status-item"
        :title="`${status.label}: ${status.count}`"
      >
        <div
          class="status-segment"
          :style="{
            width: status.percent + '%',
            backgroundColor: status.color,
          }"
        />
      </div>
    </div>

    <!-- 状态图例 -->
    <div class="status-legend">
      <span
        v-for="status in statusItems.filter((s) => s.count > 0)"
        :key="status.label"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ backgroundColor: status.color }"></span>
        <span class="legend-text">{{ status.label }} {{ status.count }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, VideoPlay } from '@element-plus/icons-vue'
import { useBotsStore } from '@/stores/bots'
import { BotStatus } from '@/types/bot'

const botsStore = useBotsStore()

const botsCount = computed(() => botsStore.botsCount)
const farmingCount = computed(() => botsStore.farmingCount)

// 状态分布数据（Element Plus 标准色）
const statusItems = computed(() => {
  const items = [
    { label: '挂卡中', count: botsStore.farmingCount, color: '#67c23a' },
    { label: '在线', count: botsStore.onlineCount, color: '#95d475' },
    { label: '暂停', count: botsStore.pausedCount, color: '#e6a23c' },
    { label: '离线', count: botsStore.offlineCount, color: '#909399' },
    { label: '禁用', count: botsStore.disabledCount, color: '#f56c6c' },
  ]

  const total = botsCount.value || 1 // 避免除以 0

  return items.map((item) => ({
    ...item,
    percent: (item.count / total) * 100,
  }))
})
</script>

<style scoped lang="less">
.bots-summary-card {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;

  &.bots {
    background: linear-gradient(135deg, #409eff, #66b1ff);
  }

  &.farming {
    background: linear-gradient(135deg, #67c23a, #85ce61);
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;

  &.farming {
    color: var(--el-color-success);
  }
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: var(--el-border-color);
}

// 状态条
.status-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--el-fill-color-light);
}

.status-segment {
  height: 100%;
  transition: width 0.3s ease;
}

// 状态图例
.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

// 响应式
@media (max-width: 768px) {
  .stat-value {
    font-size: 24px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .status-legend {
    gap: 8px;
  }
}
</style>
