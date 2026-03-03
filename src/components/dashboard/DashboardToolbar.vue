<template>
  <div class="dashboard-toolbar">
    <div class="toolbar-left">
      <h2 class="page-title">数据概览</h2>
      <el-tag :type="asfStore.connected ? 'success' : 'danger'" size="large">
        {{ asfStore.connected ? '已连接' : '未连接' }}
      </el-tag>
    </div>

    <div class="toolbar-right">
      <el-button
        :icon="Refresh"
        :loading="refreshing"
        @click="handleRefresh"
        circle
      />

      <el-tooltip content="页面设置" placement="bottom">
        <el-button :icon="Setting" @click="showSettings = true" circle />
      </el-tooltip>

      <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
        <el-button
          :icon="FullScreen"
          @click="toggleFullscreen"
          circle
        />
      </el-tooltip>
    </div>

    <!-- 设置抽屉 -->
    <el-drawer v-model="showSettings" title="页面设置" direction="rtl" :size="320">
      <DashboardSettings v-if="showSettings" @close="showSettings = false" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Setting, FullScreen } from '@element-plus/icons-vue'
import { useAsfStore } from '@/stores/asf'
import { useBotsStore } from '@/stores/bots'
import DashboardSettings from './DashboardSettings.vue'

const asfStore = useAsfStore()
const botsStore = useBotsStore()

const refreshing = ref(false)
const showSettings = ref(false)
const isFullscreen = ref(false)

// 刷新数据
async function handleRefresh() {
  refreshing.value = true
  try {
    await Promise.all([
      asfStore.fetchInfo(),
      botsStore.fetchBots(),
    ])
    ElMessage.success('已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 切换全屏
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})
</script>

<style scoped lang="less">
.dashboard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 24px;
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 响应式
@media (max-width: 768px) {
  .dashboard-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    justify-content: space-between;
  }

  .toolbar-right {
    justify-content: flex-end;
  }
}
</style>
