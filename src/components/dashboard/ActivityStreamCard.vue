<template>
  <div class="activity-stream-card card">
    <div class="card-header">
      <div class="header-left">
        <h3 class="card-title">实时活动流</h3>
        <el-tag v-if="activities.length > 0" size="small" type="info">
          {{ activities.length }} 条
        </el-tag>
      </div>
      <div class="header-right">
        <el-select
          v-model="filterType"
          size="small"
          placeholder="全部类型"
          style="width: 100px"
          @change="filterActivities"
        >
          <el-option label="全部" value="" />
          <el-option label="挂卡" value="farming" />
          <el-option label="完成" value="complete" />
          <el-option label="错误" value="error" />
        </el-select>

        <el-button
          :icon="Refresh"
          size="small"
          @click="clearActivities"
          title="清空活动记录"
          circle
        />
      </div>
    </div>

    <div class="card-content">
      <!-- 活动列表 -->
      <div v-if="filteredActivities.length > 0" class="activity-list">
        <div
          v-for="item in displayActivities"
          :key="item.id"
          class="activity-item"
          :class="`activity-item--${item.type}`"
        >
          <div class="activity-icon">
            <el-icon>
              <component :is="getEventIcon(item.type)" />
            </el-icon>
          </div>
          <div class="activity-content">
            <div class="activity-message">
              <span class="bot-name">{{ item.bot }}</span>
              <span>{{ item.message }}</span>
            </div>
            <div v-if="item.metadata" class="activity-meta">
              <span v-if="item.metadata.cardsGained" class="meta-tag">
                +{{ item.metadata.cardsGained }} 张卡
              </span>
              <span v-if="item.metadata.timeRemaining" class="meta-tag">
                {{ item.metadata.timeRemaining }}
              </span>
            </div>
          </div>
          <div class="activity-time">
            {{ formatTime(item.timestamp) }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-icon size="48" class="empty-icon"><Document /></el-icon>
        <p class="empty-text">暂无活动记录</p>
        <p class="empty-desc">当 Bot 有活动时会显示在此处</p>
      </div>
    </div>

    <!-- 底部加载更多 -->
    <div v-if="hasMore" class="card-footer">
      <el-button text @click="loadMore">加载更多</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Document,
  VideoPlay,
  CircleCheck,
  CircleClose,
  Warning,
  Refresh,
} from '@element-plus/icons-vue'
import { useActivitiesStore } from '@/stores/activities'
import type { ActivityType } from '@/stores/activities'

const activitiesStore = useActivitiesStore()

const filterType = ref<ActivityType | ''>('')
const maxItems = ref(20)

// 所有活动
const activities = computed(() => activitiesStore.activitiesList)

// 筛选后的活动
const filteredActivities = computed(() => {
  if (!filterType.value) return activities.value

  const typeMap: Record<string, ActivityType[]> = {
    farming: ['farming'],
    complete: ['complete'],
    error: ['error', 'warning'],
  }

  const types = typeMap[filterType.value] || []
  return activities.value.filter((item) => types.includes(item.type))
})

// 显示的活动（限制数量）
const displayActivities = computed(() => {
  return filteredActivities.value.slice(0, maxItems.value)
})

// 是否还有更多
const hasMore = computed(() => {
  return filteredActivities.value.length > maxItems.value
})

// 获取事件图标
function getEventIcon(type: ActivityType) {
  const icons: Record<ActivityType, any> = {
    login: CircleCheck,
    farming: VideoPlay,
    complete: CircleCheck,
    error: CircleClose,
    warning: Warning,
  }
  return icons[type] || Document
}

// 格式化时间
function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  }
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  }
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  }

  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 筛选活动
function filterActivities() {
  // 筛选逻辑已经在 computed 中实现
}

// 加载更多
function loadMore() {
  maxItems.value += 20
}

// 清空活动
function clearActivities() {
  activitiesStore.clearActivities()
}
</script>

<style scoped lang="less">
.activity-stream-card {
  grid-column: span 4;
  grid-row: span 2;
  display: flex;
  flex-direction: column;

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
    border-color: var(--el-border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content {
  flex: 1;
  min-height: 200px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .activity-item--farming & {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }

  .activity-item--complete & {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }

  .activity-item--error & {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }

  .activity-item--warning & {
    background: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
  }

  .activity-item--login & {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-message {
  color: var(--el-text-color-primary);
  font-size: 14px;
  margin-bottom: 4px;
}

.bot-name {
  font-weight: 600;
  margin-right: 4px;
}

.activity-meta {
  display: flex;
  gap: 8px;
}

.meta-tag {
  padding: 2px 6px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.activity-time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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

.card-footer {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

// 响应式
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
