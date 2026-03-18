<template>
  <div class="bots-page">
    <!-- 页面标题 + 操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>Bot 管理</h2>
        <el-tag type="info" size="large">{{ botsStore.botsCount }} 个 Bot</el-tag>
      </div>

      <div class="header-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索 Bot 名称或昵称"
          :prefix-icon="Search"
          clearable
          style="width: 200px; margin-right: 12px"
        />

        <el-button type="primary" :icon="Plus" @click="handleCreateBot"> 创建 Bot </el-button>
      </div>
    </div>

    <!-- 状态筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="filterStatus" @change="handleFilterChange">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button :label="BotStatus.FARMING"> 挂卡中 </el-radio-button>
        <el-radio-button :label="BotStatus.ONLINE">在线</el-radio-button>
        <el-radio-button :label="BotStatus.PAUSED">暂停</el-radio-button>
        <el-radio-button :label="BotStatus.OFFLINE">离线</el-radio-button>
        <el-radio-button :label="BotStatus.DISABLED">禁用</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Bot 列表 -->
    <div class="bots-grid">
      <div
        v-for="bot in filteredBots"
        :key="bot.s_SteamID ?? bot.BotName ?? Math.random()"
        class="bot-card"
        :class="{ paused: bot.CardsFarmer?.Paused }"
      >
        <!-- 卡片头部 - 可点击打开详情 -->
        <div class="card-header" @click="handleShowDetail(bot)">
          <div class="bot-avatar">
            <img
              :src="`https://avatars.steamstatic.com/${bot.AvatarHash}_full.jpg`"
              :alt="bot.Nickname"
            />
          </div>

          <div class="bot-info">
            <div class="bot-nickname">{{ bot.Nickname }}</div>
            <div class="bot-name">{{ bot.BotName }}</div>
          </div>

          <div class="bot-status" :class="getStatusClass(bot?.Status ?? BotStatus.OFFLINE)">
            <el-icon><component :is="getStatusIcon(bot?.Status ?? BotStatus.OFFLINE)" /></el-icon>
          </div>
        </div>

        <!-- 卡片内容 - 可点击打开详情 -->
        <div class="card-body" @click="handleShowDetail(bot)">
          <!-- 挂卡进度 -->
          <div class="farming-progress">
            <div class="progress-info">
              <span class="label">挂卡进度</span>
              <span class="value">{{ getProgressText(bot) }}</span>
            </div>
            <el-progress
              :percentage="getProgress(bot)"
              :color="getStatusColor(bot?.Status ?? BotStatus.OFFLINE)"
              :show-text="false"
            />
          </div>

          <!-- 统计信息 -->
          <div class="bot-stats">
            <div class="stat">
              <span class="stat-icon"><Grid /></span>
              <span class="stat-value">{{ bot.GamesToRedeemInBackgroundCount }} BGR</span>
            </div>
            <div class="stat">
              <span class="stat-icon"><Timer /></span>
              <span class="stat-value">{{ bot.CardsFarmer?.TimeRemaining || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 卡片底部 - 快捷按钮（不可点击打开详情） -->
        <div class="card-footer">
          <el-button-group>
            <el-button
              v-for="btn in quickButtons"
              :key="btn.name"
              :type="btn.name === 'pause' && bot.CardsFarmer?.Paused ? 'success' : 'default'"
              :icon="btn.icon"
              size="small"
              @click="handleQuickAction(bot, btn.name)"
            >
              {{ btn.label }}
            </el-button>
            <el-button :icon="Edit" size="small" @click="handleRenameBot(bot)">
              重命名
            </el-button>
            <el-button
              :icon="Delete"
              type="danger"
              size="small"
              @click="handleDeleteBot(bot)"
            >
              删除
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="filteredBots.length === 0" description="没有找到 Bot">
      <el-button @click="handleClearFilter">清除筛选</el-button>
    </el-empty>

    <!-- Bot 详情弹窗 -->
    <BotDetailDialog
      v-model="showDetailDialog"
      :bot="selectedBot"
      @edit-config="handleEditConfig"
      @action="handleDetailAction"
    />

    <!-- 创建 Bot 弹窗 -->
    <CreateBotDialog v-model="showCreateDialog" @success="handleCreateSuccess" />

    <!-- Bot 配置弹窗 -->
    <BotConfigDialog
      v-model="showConfigDialog"
      :bot="configBot"
      @saved="handleConfigSaved"
    />

    <!-- Bot 2FA 弹窗 -->
    <Bot2FADialog
      v-model="show2FADialog"
      :bot="bot2FA"
    />

    <!-- BGR 后台兑换弹窗 -->
    <BGRDialog
      v-model="showBGRDialog"
      :bot="bgrBot"
    />

    <!-- Bot 复制弹窗 -->
    <BotCopyDialog
      v-model="showCopyDialog"
      :bot="copyBotSource"
      @success="handleCopySuccess"
    />

    <!-- 重命名 Bot 弹窗 -->
    <el-dialog v-model="showRenameDialog" title="重命名 Bot" width="400px">
      <el-form label-position="top">
        <el-form-item label="新名称">
          <el-input
            v-model="renameForm.newName"
            placeholder="输入新的 Bot 名称"
            clearable
            @keyup.enter="handleConfirmRename"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRenameDialog = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmRename"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useBotsStore } from '@/stores/bots'
import { useSettingsStore } from '@/stores/settings'
import { BotStatus } from '@/types/bot'
import type { Bot } from '@/types/bot'
import { ElMessage, ElMessageBox } from 'element-plus'
import { renameBot, deleteBot } from '@/api/Bot'
import {
  Plus,
  Grid,
  Timer,
  Lock,
  Key,
  Setting,
  VideoPlay,
  VideoPause,
  Warning,
  CircleCloseFilled,
  Connection,
  CircleCheck,
  Search,
  Delete,
  Edit,
} from '@element-plus/icons-vue'
import BotDetailDialog from '@/components/BotDetailDialog.vue'
import CreateBotDialog from '@/components/CreateBotDialog.vue'
import BotConfigDialog from '@/components/BotConfigDialog.vue'
import Bot2FADialog from '@/components/Bot2FADialog.vue'
import BGRDialog from '@/components/BGRDialog.vue'
import BotCopyDialog from '@/components/BotCopyDialog.vue'

const router = useRouter()
const botsStore = useBotsStore()
const settingsStore = useSettingsStore()

// Bot 详情弹窗
const showDetailDialog = ref(false)
const selectedBot = ref<Bot | null>(null)

// Bot 配置弹窗
const showConfigDialog = ref(false)
const configBot = ref<Bot | null>(null)


// Bot 2FA 弹窗
const show2FADialog = ref(false)
const bot2FA = ref<Bot | null>(null)

// BGR 后台兑换弹窗
const showBGRDialog = ref(false)
const bgrBot = ref<Bot | null>(null)

// Bot 复制弹窗
const showCopyDialog = ref(false)
const copyBotSource = ref<Bot | null>(null)

// 创建 Bot 弹窗
const showCreateDialog = ref(false)

// 重命名弹窗
const showRenameDialog = ref(false)
const botToRename = ref<Bot | null>(null)
const renameForm = reactive({
  newName: '',
})

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref<BotStatus | null>(null)

// 过滤后的 Bot 列表
const filteredBots = computed(() => {
  let bots = botsStore.botsList

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    bots = bots.filter((bot) => {
      const botName = bot.BotName ?? bot.s_SteamID ?? ''
      const nickname = bot.Nickname ?? ''
      return botName.toLowerCase().includes(query) || nickname.toLowerCase().includes(query)
    })
  }

  // 状态筛选
  if (filterStatus.value !== null) {
    bots = bots.filter((bot) => bot.Status === filterStatus.value)
  }

  return bots
})

// 快捷按钮配置
const quickButtons = computed(() => {
  const config = settingsStore.favButtonsConfig
  const buttons = [
    { name: '2fa', icon: Lock, label: '双重验证' },
    { name: 'bgr', icon: Key, label: '后台兑换' },
    { name: 'config', icon: Setting, label: '配置' },
    { name: 'pause', icon: VideoPause, label: '暂停' },
  ]
  return buttons.filter((btn) => {
    const cfg = config.find((c) => c.name === btn.name)
    return cfg?.enabled !== false
  })
})

// 获取状态样式
function getStatusClass(status: BotStatus) {
  switch (status) {
    case BotStatus.FARMING:
      return 'status-farming'
    case BotStatus.ONLINE:
      return 'status-online'
    case BotStatus.PAUSED:
      return 'status-paused'
    case BotStatus.OFFLINE:
      return 'status-offline'
    case BotStatus.DISABLED:
      return 'status-disabled'
    default:
      return ''
  }
}

// 获取状态图标
function getStatusIcon(status: BotStatus) {
  switch (status) {
    case BotStatus.FARMING:
      return VideoPlay
    case BotStatus.ONLINE:
      return CircleCheck
    case BotStatus.PAUSED:
      return VideoPause
    case BotStatus.OFFLINE:
      return Warning
    case BotStatus.DISABLED:
      return CircleCloseFilled
    default:
      return Connection
  }
}

// 获取状态颜色
function getStatusColor(status: BotStatus) {
  switch (status) {
    case BotStatus.FARMING:
      return '#67c23a'
    case BotStatus.ONLINE:
      return '#409eff'
    case BotStatus.PAUSED:
      return '#e6a23c'
    case BotStatus.OFFLINE:
      return 'var(--el-text-color-secondary)'
    case BotStatus.DISABLED:
      return '#f56c6c'
    default:
      return 'var(--el-text-color-regular)'
  }
}

// 获取进度文本
function getProgressText(bot: Bot) {
  const remaining =
    bot.CardsFarmer?.GamesToFarm?.reduce((sum, game) => {
      const cards = typeof game.CardsRemaining === 'string' ? parseInt(game.CardsRemaining) : game.CardsRemaining
      return sum + (cards || 0)
    }, 0) ?? 0
  return `${remaining} 卡片`
}

// 获取进度百分比
function getProgress(bot: Bot) {
  const remaining =
    bot.CardsFarmer?.GamesToFarm?.reduce((sum, game) => {
      const cards = typeof game.CardsRemaining === 'string' ? parseInt(game.CardsRemaining) : game.CardsRemaining
      return sum + (cards || 0)
    }, 0) ?? 0
  // 模拟进度（实际需要从 API 获取）
  return Math.min(remaining * 10, 100)
}

// 清除筛选
function handleClearFilter() {
  searchQuery.value = ''
  filterStatus.value = null
}

// 筛选变化
function handleFilterChange() {
  // 筛选时可以做一些操作
}

// 显示 Bot 详情
function handleShowDetail(bot: Bot) {
  selectedBot.value = bot
  showDetailDialog.value = true
}

// 编辑配置
function handleEditConfig(bot: Bot) {
  configBot.value = bot
  showConfigDialog.value = true
}

// 处理详情弹窗的操作
function handleDetailAction(bot: Bot, action: string) {
  const botName = bot.BotName ?? bot.s_SteamID ?? ''
  if (!botName) {
    ElMessage.error('Bot 名称无效')
    return
  }

  switch (action) {
    case 'config':
      handleEditConfig(bot)
      break
    case 'bgr':
      bgrBot.value = bot
      showBGRDialog.value = true
      break
    case '2fa':
      bot2FA.value = bot
      show2FADialog.value = true
      break
    case 'pause':
      botsStore.pauseBots([botName])
      break
    case 'resume':
      botsStore.resumeBots([botName])
      break
    case 'start':
      botsStore.startBots([botName])
      break
    case 'stop':
      botsStore.stopBots([botName])
      break
    case 'copy':
      copyBotSource.value = bot
      showCopyDialog.value = true
      break
    case 'delete':
      handleDeleteBot(bot)
      break
  }
}

// 配置保存成功回调
function handleConfigSaved(bot: Bot) {
  ElMessage.success(`Bot "${bot.BotName}" 配置已保存`)
  // 刷新 Bot 列表
  botsStore.fetchBots()
}

// 复制成功回调
function handleCopySuccess(botName: string) {
  ElMessage.success(`Bot "${botName}" 复制成功`)
}

// 创建 Bot
function handleCreateBot() {
  showCreateDialog.value = true
}

// 创建成功回调
function handleCreateSuccess(botConfig: any) {
  ElMessage.success(`Bot "${botConfig.BotName}" 创建成功`)
  showCreateDialog.value = false
  // TODO: 刷新 Bot 列表
}

// 重命名 Bot
function handleRenameBot(bot: Bot) {
  botToRename.value = bot
  renameForm.newName = bot.BotName ?? bot.s_SteamID ?? ''
  showRenameDialog.value = true
}

// 确认重命名
async function handleConfirmRename() {
  if (!renameForm.newName || !botToRename.value) return

  try {
    // 验证新名称
    const newName = renameForm.newName.trim()

    // 不能为 ASF
    if (newName === 'ASF') {
      ElMessage.error('Bot 名称不能为 ASF')
      return
    }

    // 检查名称格式
    if (!/^[a-zA-Z0-9_-]+$/.test(newName)) {
      ElMessage.error('名称只能包含字母、数字、下划线、短横线')
      return
    }

    // 检查名称是否已存在（排除当前 Bot）
    const exists = botsStore.botsList.some(
      (bot) => (bot.BotName || bot.s_SteamID) === newName && bot !== botToRename.value,
    )
    if (exists) {
      ElMessage.error(`Bot "${newName}" 已存在`)
      return
    }

    const oldName = botToRename.value.BotName ?? botToRename.value.s_SteamID ?? ''

    // 调用重命名 API
    const result = await renameBot(oldName, newName)

    if (result.Success) {
      // 刷新 Bot 列表
      await botsStore.fetchBots()

      ElMessage.success(`Bot 重命名为 "${newName}"`)
      showRenameDialog.value = false
      renameForm.newName = ''
    } else {
      ElMessage.error(result.Message || '重命名失败')
    }
  } catch (error) {
    console.error('Rename error:', error)
    ElMessage.error(error instanceof Error ? error.message : '重命名失败')
  }
}

// 删除 Bot
async function handleDeleteBot(bot: Bot) {
  try {
    await ElMessageBox.confirm(`确定要删除 Bot "${bot.BotName}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const botName = bot.BotName ?? bot.s_SteamID ?? ''

    // 调用删除 API
    const result = await deleteBot([botName])

    if (result.Success) {
      // 刷新 Bot 列表
      await botsStore.fetchBots()

      ElMessage.success(`Bot "${botName}" 已删除`)
    } else {
      ElMessage.error(result.Message || '删除失败')
    }
  } catch (error) {
    // 用户取消或错误
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error(error instanceof Error ? error.message : '删除失败')
    }
  }
}

// 快捷操作
async function handleQuickAction(bot: Bot, action: string) {
  const botName = bot.BotName ?? bot.s_SteamID ?? ''
  if (!botName) {
    ElMessage.error('Bot 名称无效')
    return
  }

  // 先关闭详情弹窗
  showDetailDialog.value = false

  switch (action) {
    case 'pause':
      if (bot.CardsFarmer?.Paused) {
        await botsStore.resumeBots([botName])
      } else {
        await botsStore.pauseBots([botName])
      }
      break
    case '2fa':
      // 打开 2FA 管理弹窗
      bot2FA.value = bot
      show2FADialog.value = true
      break
    case 'bgr':
      // 打开后台兑换弹窗
      bgrBot.value = bot
      showBGRDialog.value = true
      break
    case 'config':
      handleEditConfig(bot)
      break
  }
}
</script>

<style scoped lang="less">
.bots-page {
  // 批量操作栏
  .batch-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #409eff;
    animation: slideDown 0.3s ease;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }

  // 状态筛选栏
  .filter-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;

    :deep(.el-radio-button__inner) {
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color-light);
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-text-color-primary);
        background-color: var(--el-fill-color-lighter);
      }
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      background-color: #409eff;
      border-color: #409eff;
      color: #ffffff;
    }
  }

  // 页面标题 + 操作栏
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    transition: all 0.3s;

    &.shrink {
      margin-bottom: 12px;
      transform: scale(0.98);
    }

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

    .header-right {
      display: flex;
      align-items: center;
    }
  }
}

// 批量操作栏动画
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Bot 网格
.bots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

// Bot 卡片
.bot-card {
  background-color: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  overflow: hidden;
  position: relative;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: #409eff;
  }

  &.paused {
    border-color: #e6a23c;
  }

  &.selected {
    border-color: #409eff;
    background-color: rgba(64, 158, 255, 0.05);
  }
}

// 卡片复选框
.card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  :deep(.el-checkbox__inner) {
    background-color: var(--el-fill-color-light);
    border-color: var(--el-border-color-light);
  }

  :deep(.el-checkbox__input:checked .el-checkbox__inner) {
    background-color: #409eff;
    border-color: #409eff;
  }
}

// 卡片头部
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.bot-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.bot-info {
  flex: 1;
  min-width: 0;
}

.bot-nickname {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bot-name {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.bot-status {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.status-farming {
    background-color: #67c23a20;
    color: #67c23a;
  }

  &.status-online {
    background-color: #409eff20;
    color: #409eff;
  }

  &.status-paused {
    background-color: #e6a23c20;
    color: #e6a23c;
  }

  &.status-offline {
    background-color: var(--el-text-color-secondary) 20;
    color: var(--el-text-color-secondary);
  }

  &.status-disabled {
    background-color: #f56c6c20;
    color: #f56c6c;
  }
}

// 卡片内容
.card-body {
  padding: 16px;
}

// 挂卡进度
.farming-progress {
  margin-bottom: 16px;

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .label {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }

    .value {
      color: var(--el-text-color-primary);
      font-size: 12px;
      font-weight: 600;
    }
  }
}

// 统计信息
.bot-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--el-fill-color-light);
  padding: 8px 12px;
  border-radius: 6px;

  .stat-icon {
    color: var(--el-text-color-secondary);
  }

  .stat-value {
    color: var(--el-text-color-regular);
    font-size: 12px;
  }
}

// 卡片底部
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  justify-content: center;

  :deep(.el-button-group) {
    flex-wrap: wrap;
    gap: 4px;
  }

  :deep(.el-button) {
    flex-shrink: 0;
  }
}

// 响应式
@media (max-width: 768px) {
  .bots-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .header-right {
      width: 100%;
      flex-direction: column;
      gap: 12px;

      :deep(.el-input) {
        width: 100% !important;
      }

      .el-button {
        width: 100%;
      }
    }
  }

  .filter-bar {
    :deep(.el-radio-button__inner) {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  .batch-toolbar {
    flex-direction: column;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      width: 100%;
    }

    .toolbar-right {
      .el-button-group {
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .bots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
