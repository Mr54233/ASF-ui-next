<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>数据概览</h2>
      <el-tag :type="asfStore.connected ? 'success' : 'danger'" size="large">
        {{ asfStore.connected ? '已连接' : '未连接' }}
      </el-tag>
    </div>

    <!-- 卡片统计 -->
    <el-row :gutter="16" class="stats-row">
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
      color: '#cfd3dc',
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
        { value: botsStore.offlineCount, name: '离线', itemStyle: { color: '#909399' } },
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
  const used = asfStore.memoryUsage?.Used ?? 0
  const total = asfStore.memoryUsage?.Total ?? 1
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
          color: '#cfd3dc',
          fontSize: 12,
          distance: -30,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: '#e5eaf3',
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
      color: '#cfd3dc',
      rotate: 45,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: '#2b2b2c',
      },
    },
    axisLabel: {
      color: '#cfd3dc',
    },
  },
  series: [
    {
      name: '剩余卡片',
      type: 'bar',
      data: botsStore.botsList.map((bot) => {
        const cards =
          bot.CardsFarmer?.GamesToFarm?.reduce((sum, game) => sum + game.CardsRemaining, 0) ?? 0
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
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      color: #e5eaf3;
      font-size: 24px;
    }
  }
}

// 统计卡片
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background-color: #141414;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100px;
  border: 1px solid #2b2b2c;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;

  &.bot-count {
    background: linear-gradient(135deg, #409eff, #79bbff);
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
}

.stat-label {
  color: #8d9095;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  color: #e5eaf3;
  font-size: 28px;
  font-weight: 600;
}

// 图表卡片
.chart-card {
  background-color: #141414;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #2b2b2c;

  .chart-header {
    margin-bottom: 16px;

    h3 {
      margin: 0;
      color: #e5eaf3;
      font-size: 18px;
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
