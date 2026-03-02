<template>
  <div class="commands-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>命令控制台</h2>
      <el-tag type="info">ASF IPC 命令接口</el-tag>
    </div>

    <!-- 常用命令 -->
    <div class="quick-commands">
      <div class="section-title">常用命令</div>
      <div class="command-buttons">
        <el-button
          v-for="cmd in quickCommands"
          :key="cmd.command"
          :icon="cmd.icon"
          @click="handleQuickCommand(cmd.command)"
        >
          {{ cmd.label }}
        </el-button>
      </div>
    </div>

    <!-- 命令输入 -->
    <div class="command-input-wrapper">
      <el-input
        ref="inputRef"
        v-model="command"
        placeholder="输入命令，按回车发送..."
        :prefix-icon="ChatDotRound"
        size="large"
        clearable
        @keyup.enter="handleSend"
      />
      <el-button type="primary" size="large" :loading="sending" @click="handleSend">
        发送
      </el-button>
    </div>

    <!-- 命令历史提示 -->
    <div v-if="commandHistory.length > 0" class="history-hint">
      <el-text size="small" type="info">
        <el-icon><ArrowUp /></el-icon>
        上键/下键 浏览历史命令（{{ commandHistoryIndex + 1 }}/{{ commandHistory.length }}）
      </el-text>
    </div>

    <!-- 命令输出 -->
    <div class="command-output">
      <div v-for="(item, index) in commandOutput" :key="index" class="output-item">
        <div class="output-command">
          <el-icon><ArrowRight /></el-icon>
          <span class="command-text">{{ item.command }}</span>
        </div>
        <div v-if="item.output" class="output-text">
          <pre>{{ item.output }}</pre>
        </div>
        <div v-if="item.error" class="output-error">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ item.error }}</span>
        </div>
        <div class="output-time">
          {{ item.timestamp }}
        </div>
      </div>
    </div>

    <!-- 清空按钮 -->
    <el-button
      v-if="commandOutput.length > 0"
      type="danger"
      :icon="Delete"
      @click="handleClear"
      class="clear-btn"
    >
      清空输出
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { sendCommand } from '@/api/Command'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound,
  ArrowUp,
  ArrowRight,
  WarningFilled,
  Delete,
  Document,
  VideoPlay,
  VideoPause,
  RefreshRight,
} from '@element-plus/icons-vue'

const inputRef = ref()
const command = ref('')
const sending = ref(false)
const commandOutput = ref<
  Array<{
    command: string
    output?: string
    error?: string
    timestamp: string
  }>
>([])

// 命令历史
const commandHistory = ref<string[]>([])
const commandHistoryIndex = ref(-1)

// 常用命令
const quickCommands = [
  { label: '帮助', icon: 'QuestionFilled', command: 'help' },
  { label: '状态', icon: Document, command: 'status' },
  { label: '启动所有', icon: VideoPlay, command: 'start' },
  { label: '暂停所有', icon: VideoPause, command: 'pause' },
  { label: '重启', icon: RefreshRight, command: 'restart' },
]

// 发送命令
async function handleSend() {
  const cmd = command.value.trim()
  if (!cmd) return

  sending.value = true

  // 添加到输出
  const outputItem = {
    command: cmd,
    timestamp: new Date().toLocaleTimeString(),
    output: undefined as string | undefined,
    error: undefined as string | undefined,
  }
  commandOutput.value.push(outputItem)

  // 添加到历史
  addToHistory(cmd)

  try {
    // TODO: 调用命令 API
    // const result = await sendCommand(cmd)
    const result = await new Promise<{ Success: boolean; Message?: string; Result?: string }>(
      (resolve) =>
        setTimeout(
          () =>
            resolve({
              Success: true,
              Message: '模拟命令输出',
              Result: `Command "${cmd}" executed successfully\n这是一个模拟的输出结果。`,
            }),
          1000,
        ),
    )

    if (result.Success) {
      outputItem.output = result.Result as string
    } else {
      outputItem.error = result.Message || '命令执行失败'
    }
  } catch (error) {
    console.error('Command error:', error)
    outputItem.error = error instanceof Error ? error.message : '命令执行失败'
  } finally {
    sending.value = false
    command.value = ''
    commandHistoryIndex.value = -1
  }
}

// 快捷命令
function handleQuickCommand(cmd: string) {
  command.value = cmd
  nextTick(() => {
    inputRef.value?.focus()
    handleSend()
  })
}

// 添加到历史
function addToHistory(cmd: string) {
  const index = commandHistory.value.indexOf(cmd)
  if (index > -1) {
    commandHistory.value.splice(index, 1)
  }
  commandHistory.value.unshift(cmd)
  localStorage.setItem('asf-command-history', JSON.stringify(commandHistory.value))
}

// 浏览历史
function handleKeyNavigation(e: KeyboardEvent) {
  if (commandHistory.value.length === 0) return

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    commandHistoryIndex.value = Math.min(
      commandHistoryIndex.value + 1,
      commandHistory.value.length - 1,
    )
    command.value = commandHistory.value[commandHistoryIndex.value]
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    commandHistoryIndex.value = Math.max(commandHistoryIndex.value - 1, -1)
    command.value =
      commandHistoryIndex.value >= 0 ? commandHistory.value[commandHistoryIndex.value] : ''
  }
}

// 清空输出
function handleClear() {
  ElMessageBox.confirm('确定要清空所有命令输出吗？', '确认', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      commandOutput.value = []
      ElMessage.success('已清空输出')
    })
    .catch(() => {
      // 用户取消
    })
}

// 组件挂载
onMounted(() => {
  // 加载命令历史
  try {
    const saved = localStorage.getItem('asf-command-history')
    if (saved) {
      commandHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load command history:', error)
  }

  // 添加键盘监听
  window.addEventListener('keydown', handleKeyNavigation)

  // 自动聚焦
  nextTick(() => {
    inputRef.value?.focus()
  })
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyNavigation)
})
</script>

<style scoped lang="less">
.commands-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

// 页面标题
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 24px;
  }
}

// 常用命令
.quick-commands {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color);
}

.section-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.command-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

// 命令输入
.command-input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

:deep(.el-input__wrapper) {
  flex: 1;
}

:deep(.el-input__inner) {
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color-light);
  color: var(--el-text-color-primary);
  font-family: 'Courier New', monospace;
  font-size: 14px;

  &::placeholder {
    color: var(--el-text-color-secondary);
  }
}

// 历史提示
.history-hint {
  padding: 8px 12px;
  background-color: var(--el-fill-color);
  border-radius: 4px;
  margin-bottom: 20px;
}

// 命令输出
.command-output {
  background-color: var(--el-fill-color);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  max-height: 600px;
  overflow-y: auto;
}

.output-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-fill-color-light);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.output-command {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 500;
}

.output-text {
  background-color: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 4px;
  color: var(--el-text-color-regular);
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;

  pre {
    margin: 0;
    white-space: pre-wrap;
  }
}

.output-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f56c6c20;
  border-radius: 4px;
  color: #f56c6c;
}

.output-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 8px;
}

// 清空按钮
.clear-btn {
  margin-top: 16px;
  width: 100%;
}

// 响应式
@media (max-width: 768px) {
  .commands-page {
    padding: 16px;
  }

  .command-input-wrapper {
    flex-direction: column;
  }

  :deep(.el-input__wrapper) {
    width: 100%;
  }

  .command-buttons {
    .el-button {
      width: calc(50% - 4px);
    }
  }

  .command-output {
    max-height: 400px;
  }
}
</style>
