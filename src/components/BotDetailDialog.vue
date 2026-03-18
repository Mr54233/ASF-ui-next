<template>
  <el-dialog
    v-model="visible"
    :title="bot?.Nickname || 'Bot 详情'"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div v-if="bot" class="bot-detail">
      <!-- 头部：头像 + 基本信息 + 钱包 -->
      <div class="detail-header">
        <div class="bot-avatar">
          <img
            :src="`https://avatars.steamstatic.com/${bot.AvatarHash}_full.jpg`"
            :alt="bot.Nickname"
          />
        </div>
        <div class="bot-meta">
          <div class="bot-names">
            <span class="nickname">{{ bot.Nickname }}</span>
            <span class="botname">{{ bot.BotName }}</span>
          </div>
          <div class="bot-status-row">
            <el-tag :type="getStatusType(bot?.Status ?? BotStatus.OFFLINE)" size="small">
              {{ getStatusText(bot?.Status ?? BotStatus.OFFLINE) }}
            </el-tag>
            <el-tag v-if="walletInfo" type="warning" size="small">
              {{ walletInfo }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 快捷操作按钮 -->
      <div class="quick-actions">
        <el-button-group>
          <el-button :icon="Setting" @click="handleAction('config')">配置</el-button>
          <el-button :icon="Key" @click="handleAction('bgr')">BGR</el-button>
          <el-button :icon="Lock" @click="handleAction('2fa')">2FA</el-button>
          <el-button
            v-if="bot.CardsFarmer?.Paused"
            :icon="VideoPlay"
            type="success"
            @click="handleAction('resume')"
          >
            恢复
          </el-button>
          <el-button
            v-if="!bot.CardsFarmer?.Paused"
            :icon="VideoPause"
            @click="handleAction('pause')"
          >
            暂停
          </el-button>
          <el-button
            v-if="!bot.KeepRunning"
            :icon="CircleCheck"
            type="success"
            @click="handleAction('start')"
          >
            启动
          </el-button>
          <el-button
            v-if="bot.KeepRunning"
            :icon="CircleClose"
            type="danger"
            @click="handleAction('stop')"
          >
            停止
          </el-button>
          <el-button :icon="CopyDocument" @click="handleAction('copy')"> 复制 </el-button>
        </el-button-group>
      </div>

      <!-- 挂卡统计 -->
      <div class="farming-stats">
        <div class="stat-item">
          <el-icon><Timer /></el-icon>
          <span class="stat-value">{{ bot.CardsFarmer?.TimeRemaining || '-' }}</span>
          <span class="stat-label">剩余时间</span>
        </div>
        <div class="stat-item">
          <el-icon><Grid /></el-icon>
          <span class="stat-value">{{ bot.CardsFarmer?.GamesToFarm?.length || 0 }}</span>
          <span class="stat-label">等待游戏</span>
        </div>
        <div class="stat-item">
          <el-icon><Postcard /></el-icon>
          <span class="stat-value">{{ totalCardsRemaining }}</span>
          <span class="stat-label">剩余卡片</span>
        </div>
      </div>

      <!-- 详细信息 -->
      <el-collapse v-model="activeCollapse">
        <!-- 基本信息 -->
        <el-collapse-item title="基本信息" name="basic">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Steam ID</span>
              <span class="value">{{ bot.s_SteamID }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已连接</span>
              <el-tag :type="bot.IsConnectedAndLoggedOn ? 'success' : 'danger'" size="small">
                {{ bot.IsConnectedAndLoggedOn ? '是' : '否' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="label">移动令牌</span>
              <el-tag :type="bot.HasMobileAuthenticator ? 'success' : 'info'" size="small">
                {{ bot.HasMobileAuthenticator ? '已启用' : '未启用' }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="label">启用状态</span>
              <el-tag :type="bot.KeepRunning ? 'success' : 'info'" size="small">
                {{ bot.KeepRunning ? '已启用' : '已禁用' }}
              </el-tag>
            </div>
          </div>
        </el-collapse-item>

        <!-- 游戏列表 -->
        <el-collapse-item title="挂卡游戏列表" name="games">
          <div v-if="bot.CardsFarmer?.GamesToFarm?.length" class="games-list">
            <div v-for="game in bot.CardsFarmer.GamesToFarm" :key="game.AppID" class="game-item">
              <img
                :src="`https://steamcdn-a.akamaihd.net/steam/apps/${game.AppID}/capsule_64x64.jpg`"
                :alt="game.GameName"
                class="game-icon"
              />
              <div class="game-info">
                <span class="game-name">{{ game.GameName }}</span>
                <div class="game-meta">
                  <span>{{ game.CardsRemaining }} 卡片</span>
                  <span>{{ game.HoursPlayed }}h</span>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无等待挂卡的游戏" :image-size="60" />
        </el-collapse-item>

        <!-- BGR 信息 -->
        <el-collapse-item title="BGR 后台兑换" name="bgr">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">等待兑换</span>
              <span class="value">{{ bot.GamesToRedeemInBackgroundCount || 0 }} 个游戏</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button type="danger" :icon="Delete" @click="handleAction('delete')"> 删除 </el-button>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Setting,
  Key,
  Lock,
  VideoPlay,
  VideoPause,
  CircleCheck,
  CircleClose,
  Delete,
  Timer,
  Grid,
  Postcard,
  CopyDocument,
} from '@element-plus/icons-vue'
import { BotStatus, ECurrencyCode } from '@/types/bot'
import type { Bot } from '@/types/bot'

interface Props {
  modelValue: boolean
  bot: Bot | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit-config', bot: Bot): void
  (e: 'action', bot: Bot, action: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 折叠面板激活项
const activeCollapse = ref<string[]>(['games'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 钱包信息格式化
const walletInfo = computed(() => {
  if (!props.bot) return null
  const balance = Number(props.bot.WalletBalance) || 0
  const delayed = Number(props.bot.WalletBalanceDelayed) || 0
  if (balance === 0 && delayed === 0) return null

  const currencyCode = props.bot.WalletCurrency ?? ECurrencyCode.Invalid
  const currencySymbol = getCurrencySymbol(currencyCode)

  let info = `${currencySymbol}${(balance / 100).toFixed(2)}`
  if (delayed > 0) {
    info += ` (+${currencySymbol}${(delayed / 100).toFixed(2)} 延迟)`
  }
  return info
})

// 剩余卡片总数
const totalCardsRemaining = computed(() => {
  if (!props.bot?.CardsFarmer?.GamesToFarm) return 0
  return props.bot.CardsFarmer.GamesToFarm.reduce((sum, game) => {
    const cards = typeof game.CardsRemaining === 'string' ? parseInt(game.CardsRemaining) : game.CardsRemaining
    return sum + (cards || 0)
  }, 0)
})

// 获取货币符号
function getCurrencySymbol(code: ECurrencyCode): string {
  const symbols: Record<number, string> = {
    [ECurrencyCode.USD]: '$',
    [ECurrencyCode.EUR]: '€',
    [ECurrencyCode.GBP]: '£',
    [ECurrencyCode.RUB]: '₽',
    [ECurrencyCode.CNY]: '¥',
    [ECurrencyCode.JPY]: '¥',
    [ECurrencyCode.KRW]: '₩',
    [ECurrencyCode.HKD]: 'HK$',
    [ECurrencyCode.TWD]: 'NT$',
  }
  return symbols[code] || ''
}

// 获取状态类型
function getStatusType(status: BotStatus) {
  switch (status) {
    case BotStatus.FARMING:
      return 'success'
    case BotStatus.ONLINE:
      return 'primary'
    case BotStatus.PAUSED:
      return 'warning'
    case BotStatus.OFFLINE:
      return 'info'
    case BotStatus.DISABLED:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
function getStatusText(status: BotStatus) {
  switch (status) {
    case BotStatus.FARMING:
      return '挂卡中'
    case BotStatus.ONLINE:
      return '在线'
    case BotStatus.PAUSED:
      return '暂停'
    case BotStatus.OFFLINE:
      return '离线'
    case BotStatus.DISABLED:
      return '禁用'
    default:
      return '未知'
  }
}

// 处理操作
function handleAction(action: string) {
  if (!props.bot) return
  emit('action', props.bot, action)
  visible.value = false
}
</script>

<style scoped lang="less">
.bot-detail {
  // 头部信息
  .detail-header {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color);
  }

  .bot-avatar {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .bot-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }

  .bot-names {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .nickname {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .botname {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .bot-status-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  // 快捷操作
  .quick-actions {
    margin-bottom: 20px;

    :deep(.el-button-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  // 挂卡统计
  .farming-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;

    .el-icon {
      font-size: 20px;
      color: var(--el-text-color-secondary);
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .stat-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  // 折叠面板
  :deep(.el-collapse) {
    border: none;
  }

  :deep(.el-collapse-item__header) {
    background-color: transparent;
    border-bottom: 1px solid var(--el-border-color-light);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.el-collapse-item__wrap) {
    background-color: transparent;
    border-bottom: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 16px 0;
  }
}

// 详情网格
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .value {
    color: var(--el-text-color-primary);
    font-size: 14px;
    font-weight: 500;
  }
}

// 游戏列表
.games-list {
  max-height: 300px;
  overflow-y: auto;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  margin-bottom: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.game-icon {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  flex-shrink: 0;
}

.game-info {
  flex: 1;
  min-width: 0;

  .game-name {
    display: block;
    color: var(--el-text-color-primary);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .game-meta {
    display: flex;
    gap: 12px;
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

// 底部按钮
.dialog-footer {
  display: flex;
  justify-content: space-between;
}

// 响应式
@media (max-width: 768px) {
  .bot-detail {
    .farming-stats {
      grid-template-columns: 1fr;
    }
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
