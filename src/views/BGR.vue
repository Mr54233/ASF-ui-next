<template>
  <div class="bgr-page">
    <!-- 页面标题 + 统计 -->
    <div class="page-header">
      <div class="header-left">
        <h2>BGR 后台兑换</h2>
        <el-tag type="info">Steam 游戏激活码管理</el-tag>
      </div>

      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="showAddDialog = true"> 添加 Key </el-button>
      </div>
    </div>

    <!-- BGR 状态统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-icon pending">
            <el-icon :size="24"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">待兑换</div>
            <div class="stat-value">{{ bgrStatus.KeysToRedeem }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-icon redeeming">
            <el-icon :size="24"><VideoPlay /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">兑换中</div>
            <div class="stat-value">{{ bgrStatus.RedeemingNow }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon :size="24"><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">已兑换</div>
            <div class="stat-value">{{ bgrStatus.Redeemed }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="6" :md="6">
        <div class="stat-card">
          <div class="stat-icon failed">
            <el-icon :size="24"><CircleCloseFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">失败/跳过</div>
            <div class="stat-value">{{ bgrStatus.Failed + bgrStatus.Skipped }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Key 列表 -->
    <el-card class="keys-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>兑换记录</span>
          <el-button link @click="handleClear">清空</el-button>
        </div>
      </template>

      <el-table :data="keys" stripe style="width: 100%">
        <el-table-column prop="key" label="Key" min-width="200">
          <template #default="{ row }">
            <el-text style="font-family: monospace">{{ maskKey(row.key) }}</el-text>
            <el-button link size="small" @click="handleCopyKey(row.key)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="botName" label="Bot" width="120" />

        <el-table-column prop="game" label="游戏" min-width="180">
          <template #default="{ row }">
            <el-link
              v-if="row.game"
              type="primary"
              :href="getGameUrl(row.game.AppID)"
              target="_blank"
            >
              {{ row.game.GameName }}
            </el-link>
            <el-text v-else type="info">-</el-text>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="time" label="时间" width="180" />

        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" :icon="Delete" @click="handleDeleteKey(row)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加 Key 对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加兑换 Key"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <!-- Key 输入 -->
        <el-form-item label="Steam Key" prop="keys">
          <el-input
            v-model="form.keys"
            type="textarea"
            :rows="6"
            placeholder="输入 Steam Key，每行一个&#10;格式：AAAAA-BBBBB-CCCCC-DDDDD-EEEEE"
          />
        </el-form-item>

        <!-- 选择 Bot -->
        <el-form-item label="兑换到 Bot" prop="botName">
          <el-select
            v-model="form.botName"
            placeholder="选择 Bot（留空为所有 Bot）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="bot in botsStore.botsList"
              :key="bot.BotName"
              :label="bot.Nickname"
              :value="bot.BotName"
            />
          </el-select>
        </el-form-item>

        <!-- 兑换类型 -->
        <el-form-item label="兑换类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="">自动检测</el-radio>
            <el-radio label="App">应用</el-radio>
            <el-radio label="Sub">订阅</el-radio>
            <el-radio label="License">许可证</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" :loading="adding" @click="handleAddKeys"> 添加 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useBotsStore } from '@/stores/bots'
import type { BGRStatus } from '@/types/asf'
import { addKeysToBGR, clearBGRQueue, deleteKeysFromBGR } from '@/api/BGR'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Clock,
  VideoPlay,
  CircleCheckFilled,
  CircleCloseFilled,
  CopyDocument,
  Delete,
} from '@element-plus/icons-vue'

const botsStore = useBotsStore()

// 添加 Key 对话框
const showAddDialog = ref(false)
const adding = ref(false)
const formRef = ref()

const form = reactive({
  keys: '',
  botName: '',
  type: '',
})

// BGR 状态
const bgrStatus = ref<BGRStatus>({
  KeysToRedeem: 0,
  RedeemingNow: 0,
  Redeemed: 0,
  Failed: 0,
  Skipped: 0,
})

// Key 列表
const keys = ref<
  Array<{
    key: string
    botName: string
    game: any
    status: string
    time: string
  }>
>([])

// 表单验证
const rules = {
  keys: [{ required: true, message: '请输入至少一个 Key', trigger: 'blur' }],
}

// 添加 Keys
async function handleAddKeys() {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    adding.value = true

    // 解析 Key（按行分割）
    const keyList = form.keys
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)

    if (keyList.length === 0) {
      ElMessage.warning('请输入有效的 Steam Key')
      return
    }

    // TODO: 调用添加 API
    // const result = await addKeysToBGR([form.botName], keyList, {
    //   botName: form.botName,
    //   type: form.type,
    // })

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 添加到列表（模拟）
    const now = new Date().toLocaleString()
    for (const key of keyList) {
      keys.value.unshift({
        key,
        botName: form.botName || '所有 Bot',
        game: null,
        status: 'Added',
        time: now,
      })
    }

    ElMessage.success(`已添加 ${keyList.length} 个 Key`)
    showAddDialog.value = false

    // 重置表单
    form.keys = ''
    form.botName = ''
    form.type = ''
    formRef.value?.resetFields()
  } catch (error) {
    console.error('Add keys error:', error)
    ElMessage.error('添加 Key 失败')
  } finally {
    adding.value = false
  }
}

// 复制 Key
function handleCopyKey(key: string) {
  navigator.clipboard
    .writeText(key)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

// 删除 Key
async function handleDeleteKey(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除 Key "${maskKey(row.key)}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // TODO: 调用删除 API
    // await deleteKeysFromBGR([row.botName], [row.key])

    keys.value = keys.value.filter((k) => k !== row)
    ElMessage.success('已删除 Key')
  } catch (error) {
    // 用户取消
  }
}

// 清空队列
async function handleClear() {
  try {
    await ElMessageBox.confirm('确定要清空所有 Key 和兑换记录吗？', '确认清空', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // TODO: 调用清空 API
    // await clearBGRQueue([form.botName])

    keys.value = []
    ElMessage.success('已清空')
  } catch (error) {
    // 用户取消
  }
}

// 遮盖 Key
function maskKey(key: string) {
  return key.substring(0, 8) + '...' + key.substring(key.length - 4)
}

// 获取状态类型
function getStatusType(status: string) {
  switch (status) {
    case 'Added':
      return 'info'
    case 'Redeemed':
      return 'success'
    case 'Failed':
      return 'danger'
    case 'Skipped':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态文本
function getStatusText(status: string) {
  switch (status) {
    case 'Added':
      return '已添加'
    case 'Redeemed':
      return '已兑换'
    case 'Failed':
      return '失败'
    case 'Skipped':
      return '已拥有'
    default:
      return status
  }
}

// 获取游戏 URL
function getGameUrl(appId: number) {
  return `https://store.steampowered.com/app/${appId}`
}

// 组件挂载
onMounted(async () => {
  // TODO: 加载 BGR 状态
  // const status = await getBGRStatus(['asf'])
  // bgrStatus.value = status
})
</script>

<style scoped lang="less">
.bgr-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

// 页面标题
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 24px;
    }
  }
}

// 统计卡片
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--el-border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.pending {
    background-color: #e6a23c20;
    color: #e6a23c;
  }

  &.redeeming {
    background-color: #409eff20;
    color: #409eff;
  }

  &.success {
    background-color: #67c23a20;
    color: #67c23a;
  }

  &.failed {
    background-color: #f56c6c20;
    color: #f56c6c;
  }
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin-bottom: 4px;
}

.stat-value {
  color: var(--el-text-color-primary);
  font-size: 24px;
  font-weight: 600;
}

// Key 列表卡片
.keys-card {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);

  :deep(.el-card__header) {
    background-color: var(--el-fill-color);
    border-bottom: 1px solid var(--el-border-color);
  }

  :deep(.el-table) {
    background-color: transparent;
    color: var(--el-text-color-primary);
  }

  :deep(.el-table__row) {
    background-color: transparent;

    &:hover > td {
      background-color: var(--el-fill-color-light);
    }
  }

  :deep(.el-table__body tr.current-row > td) {
    background-color: var(--el-fill-color-light);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 对话框
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  color: var(--el-text-color-regular);
}

:deep(.el-textarea__inner) {
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color-light);
  color: var(--el-text-color-primary);
  font-family: 'Courier New', monospace;
}

// 响应式
@media (max-width: 768px) {
  .bgr-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .header-right {
      width: 100%;
    }

    .el-button {
      width: 100%;
    }
  }

  .stats-row {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }
}
</style>
