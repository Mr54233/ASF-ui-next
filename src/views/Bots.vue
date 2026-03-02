<template>
  <div class="bots-page">
    <!-- 批量操作栏 -->
    <div v-if="selectedBots.length > 0" class="batch-toolbar">
      <div class="toolbar-left">
        <el-checkbox
          :indeterminate="isIndeterminate"
          :model-value="isAllSelected"
          @change="handleSelectAll"
        >
          已选 {{ selectedBots.length }} 个
        </el-checkbox>
      </div>

      <div class="toolbar-right">
        <el-button-group>
          <el-button :icon="VideoPlay" @click="handleBatchStart">
            启动
          </el-button>
          <el-button :icon="VideoPause" @click="handleBatchPause">
            暂停
          </el-button>
          <el-button :icon="CircleCloseFilled" @click="handleBatchStop">
            停止
          </el-button>
          <el-button :icon="Delete" type="danger" @click="handleBatchDelete">
            删除
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 页面标题 + 操作栏 -->
    <div class="page-header" :class="{ 'shrink': selectedBots.length > 0 }">
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
          style="width: 200px; margin-right: 12px;"
        />

        <el-button type="primary" :icon="Plus" @click="handleCreateBot">
          创建 Bot
        </el-button>
      </div>
    </div>

    <!-- 状态筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="filterStatus" @change="handleFilterChange">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button :label="BotStatus.FARMING">
          挂卡中
        </el-radio-button>
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
        :key="bot.BotName"
        class="bot-card"
        :class="{ 'paused': bot.CardsFarmer?.Paused, 'selected': isSelected(bot) }"
      >
        <!-- 复选框 -->
        <div class="card-checkbox" @click.stop>
          <el-checkbox :model-value="isSelected(bot)" @change="(val: boolean) => handleSelect(bot, val)" />
        </div>

        <!-- 卡片内容 -->
        <div @click="handleShowDetail(bot)">
          <!-- 卡片头部 -->
          <div class="card-header">
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

          <!-- 卡片内容 -->
          <div class="card-body">
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

          <!-- 卡片底部 - 快捷按钮 -->
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
              <el-button :icon="Edit" size="small" @click.stop="handleRenameBot(bot)">
                重命名
              </el-button>
              <el-button :icon="Delete" type="danger" size="small" @click.stop="handleDeleteBot(bot)">
                删除
              </el-button>
            </el-button-group>
          </div>
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
    />

    <!-- 创建 Bot 弹窗 -->
    <CreateBotDialog
      v-model="showCreateDialog"
      @success="handleCreateSuccess"
    />

    <!-- 重命名 Bot 弹窗 -->
    <el-dialog
      v-model="showRenameDialog"
      title="重命名 Bot"
      width="400px"
    >
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
          <el-button type="primary" @click="handleConfirmRename">
            确认
          </el-button>
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

const router = useRouter()
const botsStore = useBotsStore()
const settingsStore = useSettingsStore()

// Bot 详情弹窗
const showDetailDialog = ref(false)
const selectedBot = ref<Bot | null>(null)

// 创建 Bot 弹窗
const showCreateDialog = ref(false)

// 重命名弹窗
const showRenameDialog = ref(false)
const renameBot = ref<Bot | null>(null)
const renameForm = reactive({
  newName: '',
})

// 批量选择
const selectedBots = ref<Bot[]>([])

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref<BotStatus | null>(null)

// 是否全选
const isAllSelected = computed(() => {
  return (
    filteredBots.value.length > 0 &&
    selectedBots.value.length === filteredBots.value.length
  )
})

// 是否半选
const isIndeterminate = computed(() => {
  return (
    selectedBots.value.length > 0 &&
    selectedBots.value.length < filteredBots.value.length
  )
})

// 过滤后的 Bot 列表
const filteredBots = computed(() => {
  let bots = botsStore.botsList

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    bots = bots.filter((bot) => {
      return (
        bot.BotName.toLowerCase().includes(query) ||
        bot.Nickname.toLowerCase().includes(query)
      )
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
    { name: '2fa', icon: Lock, label: '2FA' },
    { name: 'bgr', icon: Key, label: 'BGR' },
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
      return '#909399'
    case BotStatus.DISABLED:
      return '#f56c6c'
    default:
      return '#cfd3dc'
  }
}

// 获取进度文本
function getProgressText(bot: Bot) {
  const remaining =
    bot.CardsFarmer?.GamesToFarm?.reduce(
      (sum, game) => sum + game.CardsRemaining,
      0
    ) ?? 0
  return `${remaining} 卡片`
}

// 获取进度百分比
function getProgress(bot: Bot) {
  const remaining =
    bot.CardsFarmer?.GamesToFarm?.reduce(
      (sum, game) => sum + game.CardsRemaining,
      0
    ) ?? 0
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
  // 筛选时清空选中
  selectedBots.value = []
}

// 检查是否选中
function isSelected(bot: Bot): boolean {
  return selectedBots.value.some((b) => b.BotName === bot.BotName)
}

// 选择/取消选择 Bot
function handleSelect(bot: Bot, checked: boolean): void {
  if (checked) {
    if (!isSelected(bot)) {
      selectedBots.value.push(bot)
    }
  } else {
    selectedBots.value = selectedBots.value.filter(
      (b) => b.BotName !== bot.BotName
    )
  }
}

// 全选/取消全选
function handleSelectAll(checked: boolean): void {
  if (checked) {
    selectedBots.value = [...filteredBots.value]
  } else {
    selectedBots.value = []
  }
}

// 批量启动
async function handleBatchStart() {
  const botNames = selectedBots.value.map((b) => b.BotName)
  const result = await botsStore.startBots(botNames)
  if (result.success) {
    selectedBots.value = []
  }
}

// 批量暂停
async function handleBatchPause() {
  const botNames = selectedBots.value.map((b) => b.BotName)
  const result = await botsStore.pauseBots(botNames)
  if (result.success) {
    selectedBots.value = []
  }
}

// 批量停止
async function handleBatchStop() {
  const botNames = selectedBots.value.map((b) => b.BotName)
  const result = await botsStore.stopBots(botNames)
  if (result.success) {
    selectedBots.value = []
  }
}

// 显示 Bot 详情
function handleShowDetail(bot: Bot) {
  selectedBot.value = bot
  showDetailDialog.value = true
}

// 编辑配置
function handleEditConfig(bot: Bot) {
  ElMessage.info('编辑配置功能开发中...')
  // TODO: 打开配置编辑器
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
  renameBot.value = bot
  renameForm.newName = bot.BotName
  showRenameDialog.value = true
}

// 确认重命名
async function handleConfirmRename() {
  if (!renameForm.newName || !renameBot.value) return

  try {
    // TODO: 调用重命名 API
    // await renameBot(renameBot.value.BotName, renameForm.newName)
    await new Promise((resolve) => setTimeout(resolve, 500))

    ElMessage.success(`Bot 重命名为 "${renameForm.newName}"`)
    showRenameDialog.value = false
    // TODO: 刷新 Bot 列表
  } catch (error) {
    console.error('Rename error:', error)
    ElMessage.error('重命名失败')
  }
}

// 删除 Bot
async function handleDeleteBot(bot: Bot) {
  try {
    await ElMessageBox.confirm(
      `确定要删除 Bot "${bot.BotName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // TODO: 调用删除 API
    // await deleteBot([bot.BotName])
    await new Promise((resolve) => setTimeout(resolve, 500))

    ElMessage.success(`Bot "${bot.BotName}" 已删除`)
    // TODO: 刷新 Bot 列表
  } catch (error) {
    // 用户取消
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedBots.value.length === 0) return

  const names = selectedBots.value.map((b) => b.BotName).join(', ')
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedBots.value.length} 个 Bot 吗？\n${names}`,
      '确认批量删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // TODO: 调用批量删除 API
    // const botNames = selectedBots.value.map((b) => b.BotName)
    // await deleteBot(botNames)
    await new Promise((resolve) => setTimeout(resolve, 500))

    ElMessage.success(`已删除 ${selectedBots.value.length} 个 Bot`)
    selectedBots.value = []
    // TODO: 刷新 Bot 列表
  } catch (error) {
    // 用户取消
  }
}

// 快捷操作
async function handleQuickAction(bot: Bot, action: string) {
  switch (action) {
    case 'pause':
      if (bot.CardsFarmer?.Paused) {
        await botsStore.resumeBots([bot.BotName])
      } else {
        await botsStore.pauseBots([bot.BotName])
      }
      break
    case '2fa':
      ElMessage.info('2FA 功能开发中...')
      break
    case 'bgr':
      ElMessage.info('BGR 功能开发中...')
      break
    case 'config':
      ElMessage.info('配置功能开发中...')
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
    background-color: #262727;
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
      background-color: #262727;
      border-color: #4c4d4f;
      color: #cfd3dc;

      &:hover {
        color: #e5eaf3;
        background-color: #363738;
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
        color: #e5eaf3;
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
  background-color: #141414;
  border-radius: 12px;
  border: 1px solid #2b2b2c;
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
  background-color: #141414;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  :deep(.el-checkbox__inner) {
    background-color: #262727;
    border-color: #4c4d4f;
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
  border-bottom: 1px solid #2b2b2c;
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
  color: #e5eaf3;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bot-name {
  color: #8d9095;
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
    background-color: #90939920;
    color: #909399;
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
      color: #8d9095;
      font-size: 12px;
    }

    .value {
      color: #e5eaf3;
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
  background-color: #262727;
  padding: 8px 12px;
  border-radius: 6px;

  .stat-icon {
    color: #a3a6ad;
  }

  .stat-value {
    color: #cfd3dc;
    font-size: 12px;
  }
}

// 卡片底部
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #2b2b2c;
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
