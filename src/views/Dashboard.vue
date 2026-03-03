<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <h2>数据概览</h2>
      <el-tag :type="asfStore.connected ? 'success' : 'danger'" size="large">
        {{ asfStore.connected ? '已连接' : '未连接' }}
      </el-tag>
    </div>

    <!-- 卡片统计 -->
    <div class="stats-row">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon bot-count">
              <el-icon :size="28"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总 Bot 数</div>
              <div class="stat-value">{{ botsStore.botsCount }}</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon farming">
              <el-icon :size="28"><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">挂卡中</div>
              <div class="stat-value">{{ botsStore.farmingCount }}</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon cards">
              <el-icon :size="28"><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">剩余卡片</div>
              <div class="stat-value">{{ botsStore.cardsRemaining }}</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon games">
              <el-icon :size="28"><VideoPlay /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">剩余游戏</div>
              <div class="stat-value">{{ botsStore.gamesRemaining }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区 -->
    <div class="charts-section">
      <el-row :gutter="16">
        <!-- Bot 状态分布（饼图） -->
        <el-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Bot 状态分布</h3>
            </div>
            <v-chart class="chart" :option="botStatusOption" autoresize />
          </div>
        </el-col>

        <!-- 内存使用（仪表盘） -->
        <el-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>ASF 内存使用</h3>
            </div>
            <v-chart class="chart" :option="memoryOption" autoresize />
          </div>
        </el-col>

        <!-- Bot 卡片数排行（柱状图） -->
        <el-col :xs="24">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Bot 挂卡进度排行</h3>
            </div>
            <v-chart class="chart" :option="botRankOption" autoresize />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsfStore } from '@/stores/asf'
import { useBotsStore } from '@/stores/bots'
import { BotStatus } from '@/types/bot'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart, GaugeChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
use([
  PieChart,
  GaugeChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
])

const asfStore = useAsfStore()
const botsStore = useBotsStore()

// Bot 状态分布（饼图）
const botStatusOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: {
      color: 'var(--el-text-color-regular)',
    },
  },
  series: [
    {
      name: 'Bot 状态',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: [
        { value: botsStore.farmingCount, name: '挂卡中', itemStyle: { color: '#67c23a' } },
        { value: botsStore.onlineCount, name: '在线', itemStyle: { color: '#409eff' } },
        { value: botsStore.pausedCount, name: '暂停', itemStyle: { color: '#e6a23c' } },
        {
          value: botsStore.offlineCount,
          name: '离线',
          itemStyle: { color: 'var(--el-text-color-secondary)' },
        },
        { value: botsStore.disabledCount, name: '禁用', itemStyle: { color: '#f56c6c' } },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
}))

// 内存使用（仪表盘）
const memoryOption = computed(() => {
  // memoryUsage 现在是 number（MB），假设最大内存为 4GB
  const used = asfStore.memoryUsage ?? 0
  const total = 4096 // 4GB
  const percentage = (used / total) * 100

  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.3, '#67c23a'],
              [0.7, '#e6a23c'],
              [1, '#f56c6c'],
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          distance: -20,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2,
          },
        },
        splitLine: {
          distance: -20,
          length: 20,
          lineStyle: {
            color: '#fff',
            width: 4,
          },
        },
        axisLabel: {
          color: 'var(--el-text-color-regular)',
          fontSize: 12,
          distance: -30,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: 'var(--el-text-color-primary)',
          fontSize: 20,
        },
        data: [{ value: percentage.toFixed(1) }],
      },
    ],
  }
})

// Bot 卡片数排行（柱状图）
const botRankOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: botsStore.botsList.map((bot) => bot.BotName),
    axisLabel: {
      color: 'var(--el-text-color-regular)',
      rotate: 45,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: 'var(--el-border-color)',
      },
    },
    axisLabel: {
      color: 'var(--el-text-color-regular)',
    },
  },
  series: [
    {
      name: '剩余卡片',
      type: 'bar',
      data: botsStore.botsList.map((bot) => {
        const cards =
          bot.CardsFarmer?.GamesToFarm?.reduce((sum, game) => {
            const c =
              typeof game.CardsRemaining === 'string'
                ? parseInt(game.CardsRemaining)
                : game.CardsRemaining
            return sum + (c || 0)
          }, 0) ?? 0
        return cards
      }),
      itemStyle: {
        color: '#409eff',
      },
      barWidth: '40%',
    },
  ],
}))
</script>

<style scoped lang="less">
.dashboard {
  /* 不设置高度限制，让内容自然撑开 */
  max-width: 1600px;
  margin: 0 auto;
}

/* 页面标题 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 24px;
    font-weight: 600;
  }
}

/* 统计卡片区域 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;

  &.bot-count {
    background: linear-gradient(135deg, #409eff, #66b1ff);
  }

  &.farming {
    background: linear-gradient(135deg, #67c23a, #95d475);
  }

  &.cards {
    background: linear-gradient(135deg, #e6a23c, #f0c78a);
  }

  &.games {
    background: linear-gradient(135deg, #f56c6c, #f89898);
  }
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value {
  color: var(--el-text-color-primary);
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

/* 图表区域 */
.charts-section {
  .el-row {
    margin-bottom: -16px;

    .el-col {
      margin-bottom: 16px;
    }
  }
}

.chart-card {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

.chart-header {
  margin-bottom: 16px;

  h3 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
  }
}

.chart {
  width: 100%;
  height: 280px;
}

/* ============================================
   响应式设计
   ============================================ */

/* 移动端 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stat-card {
    height: 80px;
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 22px;
  }

  .chart {
    height: 220px;
  }
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  .chart {
    height: 250px;
  }
}

/* 大屏幕 */
@media (min-width: 1920px) {
  .stat-card {
    height: 110px;
    padding: 24px;
  }

  .stat-icon {
    width: 64px;
    height: 64px;
  }

  .stat-value {
    font-size: 30px;
  }

  .chart {
    height: 320px;
  }
}
</style>
