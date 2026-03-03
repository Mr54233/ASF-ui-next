<template>
  <div class="asf-info-cards">
    <!-- 内存使用 -->
    <div class="info-card small-card">
      <div class="info-icon memory">
        <el-icon :size="20"><Cpu /></el-icon>
      </div>
      <div class="info-content">
        <div class="info-value">{{ formatMemory(asfStore.memoryUsage) }}</div>
        <div class="info-label">内存</div>
      </div>
    </div>

    <!-- 运行时间 -->
    <div class="info-card small-card">
      <div class="info-icon uptime">
        <el-icon :size="20"><Clock /></el-icon>
      </div>
      <div class="info-content">
        <div class="info-value">{{ formatUptime(asfStore.uptime) }}</div>
        <div class="info-label">运行时间</div>
      </div>
    </div>

    <!-- 版本 -->
    <div class="info-card small-card">
      <div class="info-icon version">
        <el-icon :size="20"><Document /></el-icon>
      </div>
      <div class="info-content">
        <div class="info-value">{{ asfStore.version || '-' }}</div>
        <div class="info-label">版本</div>
      </div>
    </div>

    <!-- 更新渠道 -->
    <div class="info-card small-card">
      <div class="info-icon channel">
        <el-icon :size="20"><InfoFilled /></el-icon>
      </div>
      <div class="info-content">
        <div class="info-value">{{ updateChannelText }}</div>
        <div class="info-label">渠道</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, Clock, Document, InfoFilled } from '@element-plus/icons-vue'
import { useAsfStore } from '@/stores/asf'

const asfStore = useAsfStore()

// 更新渠道文本
const updateChannelText = computed(() => {
  const channel = asfStore.info?.GlobalConfig?.UpdateChannel
  switch (channel) {
    case 0:
      return '无'
    case 1:
      return 'Stable'
    case 2:
      return 'Preview'
    default:
      return '-'
  }
})

// 格式化内存
function formatMemory(mb: number | null): string {
  if (!mb) return '-'
  if (mb < 1024) return `${mb} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

// 格式化运行时间
function formatUptime(seconds: number): string {
  if (!seconds || seconds === 0) return '-'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}分钟`)

  return parts.join(' ')
}
</script>

<style scoped lang="less">
.asf-info-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  grid-column: span 4;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  &.memory {
    background: linear-gradient(135deg, #909399, #b1b3b8);
  }

  &.uptime {
    background: linear-gradient(135deg, #67c23a, #95d475);
  }

  &.version {
    background: linear-gradient(135deg, #409eff, #66b1ff);
  }

  &.channel {
    background: linear-gradient(135deg, #e6a23c, #f0c78a);
  }
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-value {
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
</style>
