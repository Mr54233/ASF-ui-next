<template>
  <div class="dashboard-settings">
    <el-form label-position="top" size="large">
      <!-- 布局设置 -->
      <div class="setting-section">
        <h4 class="section-title">布局设置</h4>

        <el-form-item label="显示快捷操作">
          <el-switch v-model="settings.layout.showQuickActions" @change="saveSettings" />
          <span class="setting-desc">显示快捷操作按钮</span>
        </el-form-item>

        <el-form-item label="紧凑模式">
          <el-switch v-model="settings.layout.compactMode" @change="saveSettings" />
          <span class="setting-desc">减少卡片间距</span>
        </el-form-item>
      </div>

      <!-- 活动流设置 -->
      <div class="setting-section">
        <h4 class="section-title">活动流设置</h4>

        <el-form-item label="显示条数">
          <el-radio-group v-model="settings.activity.maxItems" @change="saveSettings">
            <el-radio-button :label="10">10 条</el-radio-button>
            <el-radio-button :label="20">20 条</el-radio-button>
            <el-radio-button :label="50">50 条</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="自动滚动">
          <el-switch v-model="settings.activity.autoScroll" @change="saveSettings" />
          <span class="setting-desc">新事件时自动滚动到顶部</span>
        </el-form-item>

        <el-form-item label="显示时间戳">
          <el-switch v-model="settings.activity.showTimestamp" @change="saveSettings" />
        </el-form-item>
      </div>

      <!-- 刷新设置 -->
      <div class="setting-section">
        <h4 class="section-title">刷新设置</h4>

        <el-form-item label="自动刷新">
          <el-switch v-model="settings.refresh.enabled" @change="saveSettings" />
        </el-form-item>

        <el-form-item label="刷新间隔" v-if="settings.refresh.enabled">
          <el-radio-group v-model="settings.refresh.interval" @change="saveSettings">
            <el-radio-button :label="2500">2.5 秒</el-radio-button>
            <el-radio-button :label="5000">5 秒</el-radio-button>
            <el-radio-button :label="10000">10 秒</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- 卡片设置 -->
      <div class="setting-section">
        <h4 class="section-title">卡片显示</h4>

        <el-form-item label="Bot 状态卡片">
          <el-switch v-model="settings.cards.botStatus.enabled" @change="saveSettings" />
        </el-form-item>

        <el-form-item label="剩余卡片统计">
          <el-switch v-model="settings.cards.cardsRemaining.enabled" @change="saveSettings" />
        </el-form-item>

        <el-form-item label="ASF 信息卡片">
          <el-switch v-model="settings.cards.asfInfo.enabled" @change="saveSettings" />
        </el-form-item>

        <el-form-item label="活动流">
          <el-switch v-model="settings.cards.activityStream.enabled" @change="saveSettings" />
        </el-form-item>
      </div>
    </el-form>

    <div class="setting-actions">
      <el-button @click="resetSettings">恢复默认</el-button>
      <el-button type="primary" @click="emit('close')">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits<{
  close: []
}>()

// 默认设置
const DEFAULT_SETTINGS = {
  layout: {
    showQuickActions: true,
    compactMode: false,
  },
  activity: {
    maxItems: 20,
    autoScroll: true,
    showTimestamp: true,
  },
  refresh: {
    enabled: true,
    interval: 2500,
  },
  cards: {
    botStatus: { enabled: true, position: 1 },
    cardsRemaining: { enabled: true, position: 2 },
    asfInfo: { enabled: true, position: 3 },
    activityStream: { enabled: true, position: 4 },
  },
}

// 当前设置
const settings = reactive(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)))

// 从 localStorage 加载设置
function loadSettings() {
  const saved = localStorage.getItem('dashboard-settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(settings, parsed)
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }
}

// 保存设置
function saveSettings() {
  localStorage.setItem('dashboard-settings', JSON.stringify(settings))
}

// 重置设置
function resetSettings() {
  Object.assign(settings, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)))
  saveSettings()
  ElMessage.success('已恢复默认设置')
}

// 初始化
loadSettings()

// 暴露设置给父组件
defineExpose({
  settings,
})
</script>

<style scoped lang="less">
.dashboard-settings {
  padding: 0;
}

.setting-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-of-type {
    border-bottom: none;
  }
}

.section-title {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.setting-desc {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.setting-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 8px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
