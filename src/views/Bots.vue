<template>
  <div class="bots-page">
    <!-- 页面标题 + 操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>Bot 管理</h2>
        <el-tag type="info" size="large">{{ botsStore.botsCount }} 个 Bot</el-tag>
      </div>

      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreateBot">
          创建 Bot
        </el-button>
      </div>
    </div>

    <!-- Bot 列表 -->
    <div class="bots-grid">
      <div
        v-for="bot in botsStore.botsList"
        :key="bot.BotName"
        class="bot-card"
        :class="{ 'paused': bot.CardsFarmer?.Paused }"
        @click="handleShowDetail(bot)"
      >
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

          <div class="bot-status" :class="getStatusClass(bot.Status)">
            <el-icon><component :is="getStatusIcon(bot.Status)" /></el-icon>
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
              :color="getStatusColor(bot.Status)"
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
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="botsStore.botsList.length === 0" description="暂无 Bot">
      <el-button type="primary" @click="handleCreateBot">创建 Bot</el-button>
    </el-empty>

    <!-- Bot 详情弹窗 -->
    <BotDetailDialog
      v-model="showDetailDialog"
      :bot="selectedBot"
      @edit-config="handleEditConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
} from '@element-plus/icons-vue'

const router = useRouter()
const botsStore = useBotsStore()
const settingsStore = useSettingsStore()

// Bot 详情弹窗
const showDetailDialog = ref(false)
const selectedBot = ref<Bot | null>(null)

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
  const total =
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

// 创建 Bot
async function handleCreateBot() {
  ElMessage.info('创建 Bot 功能开发中...')
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
</script>

<style scoped lang="less">
.bots-page {
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
        color: #e5eaf3;
        font-size: 24px;
      }
    }
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
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: #409eff;
  }

  &.paused {
    border-color: #e6a23c;
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
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .bots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
