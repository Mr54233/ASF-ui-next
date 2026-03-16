<template>
  <el-dialog
    v-model="visible"
    :title="`后台兑换 (BGR) - ${bot?.BotName || ''}`"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @open="handleOpen"
  >
    <div v-if="bot" class="bgr-dialog">
      <!-- 状态显示 -->
      <div v-if="loading" class="loading-section">
        <el-icon class="is-loading" :size="40">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>

      <template v-else>
        <!-- 输入状态 -->
        <div v-if="state === 'input'" class="input-state">
          <el-input
            v-model="keysInput"
            type="textarea"
            :rows="8"
            placeholder="输入游戏激活码，每行一个格式：产品代码/激活码"
          />

          <div v-if="bot.GamesToRedeemInBackgroundCount > 0" class="queue-info">
            <el-icon><Warning /></el-icon>
            <span>后台队列中有 {{ bot.GamesToRedeemInBackgroundCount }} 个激活码等待处理</span>
          </div>

          <div class="input-actions">
            <el-button @click="checkKeys" :loading="checking">
              检查激活码
            </el-button>
            <el-button type="danger" plain @click="showReset">
              重置队列
            </el-button>
          </div>
        </div>

        <!-- 检查状态 -->
        <div v-else-if="state === 'check'" class="check-state">
          <p class="check-title">发现 {{ foundKeysCount }} 个有效激活码：</p>

          <div class="keys-list">
            <div v-for="(key, value) in Object.entries(keys)" :key="key" class="key-item">
              <span class="key-name">{{ key }}</span>
              <span class="key-code">{{ value }}</span>
            </div>
          </div>

          <div class="check-actions">
            <el-button @click="cancelCheck">取消</el-button>
            <el-button type="primary" :loading="confirming" @click="confirmKeys">
              确认添加
            </el-button>
          </div>
        </div>

        <!-- 重置状态 -->
        <div v-else-if="state === 'reset'" class="reset-state">
          <p>确定要重置后台队列吗？这将清空所有待处理的激活码!</p>

          <div class="reset-actions">
            <el-button @click="cancelReset">取消</el-button>
            <el-button type="danger" :loading="resetting" @click="resetQueue">
              确认重置
            </el-button>
          </div>
        </div>

        <!-- 汇总状态 -->
        <div v-else-if="state === 'summary'" class="summary-state">
          <el-result
            icon="success"
            title="添加成功"
            :sub-title="`已添加 {{ addedKeysCount }} 个激活码到后台队列`"
          />

          <div class="summary-actions">
            <el-button type="primary" @click="close">
              完成
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning, Loading } from '@element-plus/icons-vue'
import { redeemKeysInBackground } from '@/api/Bot'
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
const state = ref<'input' | 'check' | 'reset' | 'summary'>('input')
const loading = ref(true)
const keysInput = ref('')
const keys = ref<Record<string, string>>({})
const checking = ref(false)
const confirming = ref(false)
const resetting = ref(false)

// 统计
const foundKeysCount = computed(() => Object.keys(keys.value).length)
const addedKeysCount = computed(() => Object.keys(keys.value).length)

// 打开时初始化
function handleOpen() {
  state.value = 'input'
  keysInput.value = ''
  keys.value = {}
  loading.value = false
}

// 检查激活码
async function checkKeys() {
  if (!keysInput.value.trim()) {
    ElMessage.warning('请输入激活码')
    return
  }

  checking.value = true

  try {
    const lines = keysInput.value.trim().split('\n').filter(line => line.trim())
    const parsedKeys: Record<string, string> = {}

    for (const line of lines) {
        const parts = line.trim().split(',')
        if (parts.length >= 2) {
          const appName = parts[0].trim()
          const key = parts[1].trim()
          if (appName && key) {
            parsedKeys[appName] = key
          }
        }
      }

    if (Object.keys(parsedKeys).length === 0) {
      ElMessage.warning('未找到有效的激活码')
        return
      }

    keys.value = parsedKeys
    state.value = 'check'
  } finally {
    checking.value = false
  }
}

// 取消检查
function cancelCheck() {
  state.value = 'input'
  keys.value = {}
}

// 确认添加
async function confirmKeys() {
  if (!props.bot) return

  confirming.value = true

  try {
    await redeemKeysInBackground([props.bot.BotName], keys.value)
    ElMessage.success('激活码已添加到后台队列')
    state.value = 'summary'
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '添加失败')
  } finally {
    confirming.value = false
  }
}

// 显示重置
function showReset() {
  state.value = 'reset'
}

// 取消重置
function cancelReset() {
  state.value = 'input'
}

// 重置队列
async function resetQueue() {
  if (!props.bot) return

  resetting.value = true

  try {
    // 调用删除 API
    const response = await fetch(`/api/Bot/${props.bot.BotName}/GamesToRedeemInBackground`, {
      method: 'DELETE',
    })
    const data = await response.json()

    if (data[props.bot.BotName]?.Success) {
      ElMessage.success('后台队列已重置')
      state.value = 'input'
    } else {
      ElMessage.error(data[props.bot.BotName]?.Message || '重置失败')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '重置失败')
  } finally {
    resetting.value = false
  }
}

// 关闭弹窗
function close() {
  visible.value = false
}
</script>

<style scoped lang="less">
.bgr-dialog {
  padding: 20px;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.input-state {
  .queue-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 12px;
    background: var(--el-color-warning-light-9);
    border-radius: 4px;
    color: var(--el-color-warning-dark-2);
  }

  .input-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
  }
}

.check-state {
  .check-title {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 16px;
  }

  .keys-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    padding: 12px;
  }

  .key-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }
  }

  .key-name {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }

  .key-code {
    font-family: monospace;
    color: var(--el-text-color-secondary);
  }

  .check-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
  }
}

.reset-state {
  text-align: center;
  padding: 20px;

  .reset-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    justify-content: center;
  }
}

.summary-state {
  text-align: center;
  padding: 20px;

  .summary-actions {
    margin-top: 20px;
  }
}
</style>
