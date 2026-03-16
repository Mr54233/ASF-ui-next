<template>
  <el-dialog
    v-model="visible"
    :title="`双重认证 (2FA) - ${bot?.BotName || ''}`"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
    @open="handleOpen"
  >
    <div v-if="bot" class="bot-2fa-dialog">
      <!-- 未配置 2FA -->
      <div v-if="!has2FA" class="no-2fa">
        <p class="info-text">该 Bot 尚未配置 2FA，        </p>

        <div class="import-section">
          <input ref="fileInput" type="file" accept=".maFile" class="hidden" @change="handleImport">
          <el-button type="primary" :loading="importing" @click="$refs.fileInput?.click()">
            {{ importing ? '导入中...' : '导入 2FA 文件 (.maFile)' }}
          </el-button>
        </div>
      </div>

      <!-- 已配置 2FA -->
      <div v-else class="has-2fa-section">
        <div class="token-display">
          <div class="token-value">{{ displayToken }}</div>
          <div class="token-actions">
            <el-button
              :icon="Refresh"
              circle
              :loading="refreshing"
              @click="refreshToken"
            />
            <el-button
              :icon="DocumentCopy"
              @click="copyToken"
            />
          </div>
        </div>

        <div class="confirmations-section">
          <p class="section-title">交易确认</p>
          <div class="confirm-actions">
            <el-button type="success" :loading="accepting" @click="acceptConfirmations">
              接受所有确认
            </el-button>
            <el-button type="danger" :loading="rejecting" @click="rejectConfirmations">
              拒绝所有确认
            </el-button>
          </div>
        </div>

        <div class="delete-section">
          <el-button type="warning" plain @click="showDeleteConfirm">
            删除 2FA
          </el-button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDelete"
      title="删除 2FA"
      width="400px"
    >
      <p>确定要删除 {{ bot?.BotName }} 的双重认证吗？此操作不可恢复！</p>
      <template #footer>
        <el-button @click="showDelete = false">取消</el-button>
        <el-button type="danger" :loading="deleting" @click="delete2FA">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, DocumentCopy } from '@element-plus/icons-vue'
import { getBot } from '@/api/Bot'
import type { Bot } from '@/types/bot'

interface Props {
  modelValue: boolean
  bot: Bot | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 状态
const has2FA = ref(true)
const token = ref('-----')
const importing = ref(false)
const refreshing = ref(false)
const accepting = ref(false)
const rejecting = ref(false)
const deleting = ref(false)
const showDelete = ref(false)

// Token 自动过期（30秒）
watch(token, async (newToken) => {
  if (newToken === '-----') return

  // 30秒后自动过期
  setTimeout(() => {
    if (token.value === newToken) {
      token.value = '-----'
    }
  }, 30000)
})

// 打开时检查 2FA 状态
watch(visible, async (isOpen) => {
  if (isOpen && props.bot) {
    has2FA.value = props.bot.HasMobileAuthenticator ?? false
    if (has2FA.value) {
      await refreshToken()
    }
  }
})

// 生成显示用的 Token（每 4 位加空格）
const displayToken = computed(() => {
  if (token.value === '-----') return '-----'
  // 每 4 位加一个空格，  return token.value.match(/.{4}/g).join(' ')
})

// 导入 2FA 文件
async function handleImport() {
  if (!props.bot || importing.value) return

  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = fileInput?.files?.[0]
  if (!file) return

  importing.value = true

  try {
    const content = await readFile(file)
    const response = await fetch(`/api/bot/${props.bot.BotName}/twoFactorAuthentication`, {
      method: 'POST',
      body: JSON.parse(content),
    })

    if (response[props.bot.BotName]?.Success) {
      ElMessage.success('2FA 导入成功')
      has2FA.value = true
      await refreshToken()
    } else {
      ElMessage.error(response[props.bot.BotName]?.Message || '导入失败')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导入失败')
  } finally {
    importing.value = false
  }
}

// 读取文件
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// 刷新 Token
async function refreshToken() {
  if (!props.bot || refreshing.value) return

  refreshing.value = true
  token.value = '-----'

  try {
    const response = await fetch(`/api/bot/${props.bot.BotName}/twoFactorAuthentication/token`)
    const data = await response.json()

    if (data[props.bot.BotName]?.Success && data[props.bot.BotName]?.Result) {
      token.value = data[props.bot.BotName].Result
    } else {
      ElMessage.error(data[props.bot.BotName]?.Message || '获取 Token 失败')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取 Token 失败')
  } finally {
    refreshing.value = false
  }
}

// 复制 Token
function copyToken() {
  if (token.value === '-----') {
    ElMessage.warning('请先生成 Token')
    return
  }

  navigator.clipboard.writeText(token.value)
  ElMessage.success('Token 已复制到剪贴板')
}

// 接受所有确认
async function acceptConfirmations() {
  if (!props.bot || accepting.value) return

  accepting.value = true

  try {
    const response = await fetch(`/api/bot/${props.bot.BotName}/twoFactorAuthentication/confirmations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept: true }),
    })
    const data = await response.json()

    if (data[props.bot.BotName]?.Success) {
      const count = data[props.bot.BotName].Message?.match(/\d+/)?.[0] || '0'
      if (count === '0') {
        ElMessage.info('没有待处理的确认')
      } else {
        ElMessage.success(`已接受 ${count} 个确认`)
      }
    } else {
      ElMessage.error(data[props.bot.BotName]?.Message || '操作失败')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    accepting.value = false
  }
}

// 拒绝所有确认
async function rejectConfirmations() {
  if (!props.bot || rejecting.value) return

  rejecting.value = true

  try {
    const response = await fetch(`/api/bot/${props.bot.BotName}/twoFactorAuthentication/confirmations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept: false }),
    })
    const data = await response.json()

    if (data[props.bot.BotName]?.Success) {
      const count = data[props.bot.BotName].Message?.match(/\d+/)?.[0] || '0'
      if (count === '0') {
        ElMessage.info('没有待处理的确认')
      } else {
        ElMessage.success(`已拒绝 ${count} 个确认`)
      }
    } else {
      ElMessage.error(data[props.bot.BotName]?.Message || '操作失败')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    rejecting.value = false
  }
}

// 删除 2FA
async function delete2FA() {
  if (!props.bot || deleting.value) return

  deleting.value = true

  try {
    const response = await fetch(`/api/bot/${props.bot.BotName}/twoFactorAuthentication`, {
      method: 'DELETE',
    })
    const data = await response.json()

    if (data[props.bot.BotName]?.Success) {
      ElMessage.success('2FA 已删除')
      showDelete.value = false
      has2FA.value = false
      token.value = '-----'
    } else {
      ElMessage.error(data[props.bot.BotName]?.Message || '删除失败')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  } finally {
    deleting.value = false
  }
}

function handleOpen() {
  // 重置状态
  token.value = '-----'
}
</script>

<style scoped lang="less">
.bot-2fa-dialog {
  padding: 20px;
}

.no-2fa {
  text-align: center;
  padding: 40px 0;

  .info-text {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.import-section {
  margin-top: 24px;
}

.has-2fa-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.token-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.token-value {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 4px;
  font-family: monospace;
  background: var(--el-fill-color-light);
  padding: 12px 24px;
  border-radius: 8px;
  min-width: 180px;
  text-align: center;
}

.token-actions {
  display: flex;
  gap: 8px;
}

.confirmations-section {
  .section-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
  }
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.delete-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 20px;
}
</style>
