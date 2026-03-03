<template>
  <div class="dashboard glass-panel">
    <div class="dashboard-header">
      <h2>数据概览</h2>
      <el-tag :type="asfStore.connected ? 'success' : 'danger'" size="large">
        {{ asfStore.connected ? '已连接' : '未连接' }}
      </el-tag>
    </div>

    <!-- 卡片统计 -->
    <el-row :gutter="16" class="stats-row glass-sm">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon bot-count">
            <el-icon :size="32"><User /></el-icon>
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
            <el-icon :size="32"><Timer /></el-icon>
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
            <el-icon :size="32"><Grid /></el-icon>
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
            <el-icon :size="32"><VideoPlay /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">剩余游戏</div>
            <div class="stat-value">{{ botsStore.gamesRemaining }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16">
      <!-- Bot 状态分布（饼图） -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card glass glass-glow">
          <div class="chart-header">
            <h3>Bot 状态分布</h3>
          </div>
          <v-chart class="chart" :option="botStatusOption" autoresize />
        </div>
      </el-col>

      <!-- 内存使用（仪表盘） -->
      <el-col :xs="24" :lg="12">
        <div class="chart-card glass glass-glow">
          <div class="chart-header">
            <h3>ASF 内存使用</h3>
          </div>
          <v-chart class="chart" :option="memoryOption" autoresize />
        </div>
      </el-col>

      <!-- Bot 卡片数排行（柱状图） -->
      <el-col :xs="24">
        <div class="chart-card glass glass-glow">
          <div class="chart-header">
            <h3>Bot 挂卡进度排行</h3>
          </div>
          <v-chart class="chart" :option="botRankOption" autoresize />
        </div>
      </el-col>
    </el-row>
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
            const c = typeof game.CardsRemaining === 'string' ? parseInt(game.CardsRemaining) : game.CardsRemaining
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
  padding: 24px;
  position: relative;

  /* 动态背景光晕效果 */
  &::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(64, 158, 255, 0.03) 0%,
      transparent 50%
    );
    animation: bg-rotate 30s linear infinite;
    pointer-events: none;
    z-index: -2;
  }

  &::after {
    content: '';
    position: fixed;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at 70% 70%,
      rgba(103, 194, 58, 0.02) 0%,
      transparent 50%
    );
    animation: bg-rotate 40s linear infinite reverse;
    pointer-events: none;
    z-index: -1;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 24px;
    }
  }
}

@keyframes bg-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 统计卡片
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  // 暗色模式玻璃态效果
  html.dark & {
    background: rgba(30, 30, 35, 0.5);
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    &:hover {
      background: rgba(30, 30, 35, 0.65);
      border-color: rgba(64, 158, 255, 0.2);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        0 0 20px rgba(64, 158, 255, 0.1);
      transform: translateY(-2px);
    }
  }

  // 亮色模式玻璃态效果
  html:not(.dark) & {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);

    &:hover {
      background: rgba(255, 255, 255, 0.75);
      border-color: rgba(64, 158, 255, 0.3);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        0 0 20px rgba(64, 158, 255, 0.15);
      transform: translateY(-2px);
    }
  }

  // 内发光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }

  // 微妙噪点纹理
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.5;
    pointer-events: none;
    border-radius: inherit;
  }

  // 内容确保在噪点层之上
  > * {
    position: relative;
    z-index: 1;
  }
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  // 玻璃态光泽
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    border-radius: 14px 14px 0 0;
  }

  // 内阴影
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.15);

  &.bot-count {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 50%, #409eff 100%);

    &:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.2),
        0 8px 24px rgba(64, 158, 255, 0.4);
    }
  }

  &.farming {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 50%, #67c23a 100%);

    &:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.2),
        0 8px 24px rgba(103, 194, 58, 0.4);
    }
  }

  &.cards {
    background: linear-gradient(135deg, #e6a23c 0%, #ebb563 50%, #e6a23c 100%);

    &:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.2),
        0 8px 24px rgba(230, 162, 60, 0.4);
    }
  }

  &.games {
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 50%, #f56c6c 100%);

    &:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.2),
        0 8px 24px rgba(245, 108, 108, 0.4);
    }
  }
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 600;
}

// 图表卡片
.chart-card {
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;

  .chart-header {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }
  }

  .chart {
    width: 100%;
    height: 300px;
  }
}

// 响应式 - 移动端
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stat-card {
    height: 80px;
    padding: 16px;

    .stat-icon {
      width: 48px;
      height: 48px;
    }

    .stat-value {
      font-size: 24px;
    }
  }

  .chart-card {
    padding: 16px;

    .chart {
      height: 250px;
    }
  }
}

// 响应式 - 平板
@media (min-width: 769px) and (max-width: 1024px) {
  .chart-card .chart {
    height: 280px;
  }
}
</style>
