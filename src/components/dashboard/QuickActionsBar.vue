<template>
  <div v-if="props.layout.showQuickActions" class="quick-actions-bar">
    <el-button
      type="success"
      :icon="VideoPlay"
      :loading="loading.start"
      @click="handleStartAll"
    >
      全部启动
    </el-button>

    <el-button
      type="warning"
      :icon="VideoPause"
      :loading="loading.pause"
      @click="handlePauseAll"
    >
      全部暂停
    </el-button>

    <el-button
      :icon="RefreshRight"
      :loading="loading.resume"
      @click="handleResumeAll"
    >
      全部恢复
    </el-button>

    <el-button
      :icon="Setting"
      @click="showConfig = true"
    >
      配置
    </el-button>

    <!-- 配置对话框 -->
    <el-dialog v-model="showConfig" title="批量操作配置" width="500px">
      <el-form label-position="top">
        <el-form-item label="暂停模式">
          <el-radio-group v-model="pauseMode">
            <el-radio :label="false">临时暂停</el-radio>
            <el-radio :label="true">永久暂停</el-radio>
          </el-radio-group>
          <div class="form-desc">临时暂停可恢复，永久暂停需要手动恢复</div>
        </el-form-item>

        <el-form-item label="暂停时长" v-if="!pauseMode">
          <el-input-number
            v-model="pauseDuration"
            :min="0"
            :max="1440"
            :step="10"
            controls-position="right"
          />
          <span class="unit">分钟</span>
          <div class="form-desc">设置为 0 表示无限期暂停</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showConfig = false">取消</el-button>
        <el-button type="primary" @click="showConfig = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, VideoPause, RefreshRight, Setting } from '@element-plus/icons-vue'
import { useBotsStore } from '@/stores/bots'
import { BotStatus } from '@/types/bot'

// Props 定义
interface Settings {
  layout: {
    showQuickActions: boolean
  }
}

const props = defineProps<Settings>()

const botsStore = useBotsStore()

const showConfig = ref(false)
const pauseMode = ref(false)
const pauseDuration = ref(60)

const loading = reactive({
  start: false,
  pause: false,
  resume: false,
})

// 全部启动
async function handleStartAll() {
  const activeBots = botsStore.botsList.filter(
    (bot) => bot.KeepRunning && bot.Status !== BotStatus.OFFLINE && bot.Status !== BotStatus.DISABLED
  )

  if (activeBots.length === 0) {
    ElMessage.info('没有可启动的 Bot')
    return
  }

  loading.start = true
  try {
    const result = await botsStore.startBots(activeBots.map((b) => b.BotName!))
    if (result.success) {
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.start = false
  }
}

// 全部暂停
async function handlePauseAll() {
  const farmingBots = botsStore.botsList.filter((bot) => bot.Status === BotStatus.FARMING)

  if (farmingBots.length === 0) {
    ElMessage.info('没有正在挂卡的 Bot')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要暂停 ${farmingBots.length} 个正在挂卡的 Bot 吗？`,
      '批量暂停确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }

  loading.pause = true
  try {
    const options = pauseMode.value
      ? { permanent: true }
      : { resumeInSeconds: pauseDuration.value * 60 }

    const result = await botsStore.pauseBots(
      farmingBots.map((b) => b.BotName!),
      options
    )
    if (result.success) {
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.pause = false
  }
}

// 全部恢复
async function handleResumeAll() {
  const pausedBots = botsStore.botsList.filter((bot) => bot.Status === BotStatus.PAUSED)

  if (pausedBots.length === 0) {
    ElMessage.info('没有暂停的 Bot')
    return
  }

  loading.resume = true
  try {
    const result = await botsStore.resumeBots(pausedBots.map((b) => b.BotName!))
    if (result.success) {
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.resume = false
  }
}

</script>

<style scoped lang="less">
.quick-actions-bar {
  grid-column: span 4;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }

  .el-button {
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
      flex: 1 1 calc(50% - 6px);
    }

    @media (max-width: 480px) {
      flex: 1 1 100%;
    }
  }
}

.form-desc {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}
</style>
