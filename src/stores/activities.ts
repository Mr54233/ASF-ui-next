import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Bot } from '@/types/bot'
import { BotStatus } from '@/types/bot'

export type ActivityType = 'login' | 'farming' | 'complete' | 'error' | 'warning'

export interface ActivityItem {
  id: string
  type: ActivityType
  bot: string
  message: string
  timestamp: Date
  metadata?: {
    cardsGained?: number
    timeRemaining?: string
    gameName?: string
    error?: string
  }
}

interface ActivitiesState {
  activities: ActivityItem[]
  maxItems: number
}

// 用于追踪 Bot 上次状态的 Map
const previousBotStates = new Map<string, { status: BotStatus; gamesToFarm: string[] }>()

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<ActivityItem[]>([])
  const maxItems = ref(100) // 最多保留 100 条活动

  /**
   * 活动列表（按时间倒序）
   */
  const activitiesList = computed(() =>
    activities.value.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  )

  /**
   * 根据 Bot 状态变化生成活动记录
   */
  function detectActivities(currentBots: Record<string, Bot>) {
    const newActivities: ActivityItem[] = []

    for (const [botName, bot] of Object.entries(currentBots)) {
      const botNameDisplay = bot.BotName || bot.s_SteamID || botName
      const currentStatus = bot.Status
      const currentGames = bot.CardsFarmer?.GamesToFarm?.map((g) => g.GameName) || []

      // 获取上一次状态
      const previousState = previousBotStates.get(botName)

      // 如果是第一次记录，保存状态但不生成活动
      if (!previousState) {
        previousBotStates.set(botName, {
          status: currentStatus,
          gamesToFarm: currentGames,
        })
        continue
      }

      const { status: previousStatus, gamesToFarm: previousGames } = previousState

      // 检测状态变化
      if (previousStatus !== currentStatus) {
        // 从离线变在线 = 登录成功
        if (previousStatus === BotStatus.OFFLINE && currentStatus === BotStatus.ONLINE) {
          newActivities.push({
            id: `${Date.now()}-${botName}-login`,
            type: 'login',
            bot: botNameDisplay,
            message: '登录成功',
            timestamp: new Date(),
          })
        }
        // 从在线变挂卡中 = 开始挂卡
        else if (
          (previousStatus === BotStatus.ONLINE || previousStatus === BotStatus.PAUSED) &&
          currentStatus === BotStatus.FARMING
        ) {
          const farmingGames = bot.CardsFarmer?.CurrentGamesFarming || []
          const gameNames = farmingGames.map((g) => g.GameName).join(', ')
          newActivities.push({
            id: `${Date.now()}-${botName}-farming`,
            type: 'farming',
            bot: botNameDisplay,
            message: gameNames ? `开始挂卡: ${gameNames}` : '开始挂卡',
            timestamp: new Date(),
            metadata: {
              gameName: gameNames,
              timeRemaining: bot.CardsFarmer?.TimeRemaining || '',
            },
          })
        }
        // 从挂卡中变在线 = 挂卡完成
        else if (previousStatus === BotStatus.FARMING && currentStatus === BotStatus.ONLINE) {
          // 计算获得的卡片数（比较剩余卡片）
          const cardsBefore = bot.CardsFarmer?.CardsRemaining || 0
          newActivities.push({
            id: `${Date.now()}-${botName}-complete`,
            type: 'complete',
            bot: botNameDisplay,
            message: '完成挂卡',
            timestamp: new Date(),
            metadata: {
              cardsGained: 0, // TODO: 需要更精确的计算
            },
          })
        }
        // 从在线变离线 = 登出/掉线
        else if (previousStatus === BotStatus.ONLINE && currentStatus === BotStatus.OFFLINE) {
          newActivities.push({
            id: `${Date.now()}-${botName}-offline`,
            type: 'warning',
            bot: botNameDisplay,
            message: '连接断开',
            timestamp: new Date(),
          })
        }
        // 从挂卡中变离线 = 异常
        else if (previousStatus === BotStatus.FARMING && currentStatus === BotStatus.OFFLINE) {
          newActivities.push({
            id: `${Date.now()}-${botName}-error`,
            type: 'error',
            bot: botNameDisplay,
            message: '挂卡中断：连接断开',
            timestamp: new Date(),
          })
        }
      }

      // 检测游戏列表变化（完成某个游戏）
      const completedGames = previousGames.filter((g) => !currentGames.includes(g))
      if (completedGames.length > 0) {
        completedGames.forEach((gameName) => {
          newActivities.push({
            id: `${Date.now()}-${botName}-${gameName}-complete`,
            type: 'complete',
            bot: botNameDisplay,
            message: `完成: ${gameName}`,
            timestamp: new Date(),
          })
        })
      }

      // 更新状态记录
      previousBotStates.set(botName, {
        status: currentStatus,
        gamesToFarm: currentGames,
      })
    }

    // 添加新活动到列表
    if (newActivities.length > 0) {
      activities.value = [...activities.value, ...newActivities]

      // 限制数量
      if (activities.value.length > maxItems.value) {
        activities.value = activities.value.slice(-maxItems.value)
      }
    }
  }

  /**
   * 清空所有活动
   */
  function clearActivities() {
    activities.value = []
    previousBotStates.clear()
  }

  /**
   * 获取指定类型的活动
   */
  function getActivitiesByType(type: ActivityType): ActivityItem[] {
    return activitiesList.value.filter((a) => a.type === type)
  }

  return {
    activities,
    activitiesList,
    maxItems,
    detectActivities,
    clearActivities,
    getActivitiesByType,
  }
})
