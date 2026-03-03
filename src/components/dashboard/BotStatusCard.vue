<template>
  <div class="bot-status-card card">
    <div class="card-header">
      <h3 class="card-title">Bot 状态分布</h3>
      <el-tag v-if="totalBots > 0" size="small">共 {{ totalBots }} 个</el-tag>
    </div>

    <div class="card-content">
      <v-chart v-if="totalBots > 0" class="chart" :option="chartOption" autoresize />

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-icon size="48" class="empty-icon"><User /></el-icon>
        <p class="empty-text">暂无 Bot</p>
        <p class="empty-desc">请先在 Bots 页面添加 Bot</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User } from '@element-plus/icons-vue'
import { useBotsStore } from '@/stores/bots'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const botsStore = useBotsStore()

// 状态颜色（Element Plus 标准色）
const STATUS_COLORS: Record<string, string> = {
  挂卡中: '#67c23a',  // success - 深绿
  在线: '#95d475',    // success-light - 浅绿
  暂停: '#e6a23c',    // warning
  离线: '#909399',    // info
  禁用: '#f56c6c',    // danger
}

// 总 Bot 数
const totalBots = computed(() => botsStore.botsCount)

// 图表配置
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: 'var(--el-bg-color)',
    borderColor: 'var(--el-border-color)',
    textStyle: {
      color: 'var(--el-text-color-primary)',
    },
  },
  legend: {
    show: false,
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '50%'],
      data: [
        { value: botsStore.farmingCount, name: '挂卡中', itemStyle: { color: STATUS_COLORS['挂卡中'] } },
        { value: botsStore.onlineCount, name: '在线', itemStyle: { color: STATUS_COLORS['在线'] } },
        { value: botsStore.pausedCount, name: '暂停', itemStyle: { color: STATUS_COLORS['暂停'] } },
        { value: botsStore.offlineCount, name: '离线', itemStyle: { color: STATUS_COLORS['离线'] } },
        { value: botsStore.disabledCount, name: '禁用', itemStyle: { color: STATUS_COLORS['禁用'] } },
      ].filter((item) => item.value > 0),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
    },
  ],
}))
</script>

<style scoped lang="less">
.bot-status-card {
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
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.card-content {
  position: relative;
  height: 200px;
}

.chart {
  width: 100%;
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.empty-icon {
  color: var(--el-text-color-placeholder);
  margin-bottom: 12px;
}

.empty-text {
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}

.empty-desc {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
