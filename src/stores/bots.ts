import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getBots, startBot, stopBot, pauseBot, resumeBot } from '@/api/Bot'
import type { Bot } from '@/types/bot'
import { BotStatus } from '@/types/bot'
import { useAuthStore } from './auth'
import { useAsfStore } from './asf'
import { useActivitiesStore } from './activities'

interface BotsState {
  bots: Record<string, Bot>
  lastUpdate: number | null
  updateInterval: number | null
  loading: boolean
}

export const useBotsStore = defineStore('bots', () => {
  const bots = ref<Record<string, Bot>>({})
  const lastUpdate = ref<number | null>(null)
  const updateInterval = ref<number | null>(null)
  const loading = ref(false)

  /**
   * Bot 列表（按名称排序）
   */
  const botsList = computed(() =>
    Object.values(bots.value).sort((a, b) => {
      const aName = a.BotName ?? a.s_SteamID ?? ''
      const bName = b.BotName ?? b.s_SteamID ?? ''
      return aName.localeCompare(bName)
    }),
  )

  /**
   * 按状态过滤 Bot
   */
  const botsByStatus = computed(
    () => (status: BotStatus) => botsList.value.filter((bot) => bot.Status === status),
  )

  /**
   * 挂卡中的 Bot 数量
   */
  const farmingCount = computed(() => botsByStatus.value(BotStatus.FARMING).length)
  const botsCount = computed(() => Object.keys(bots.value).length)

  /**
   * 在线的 Bot 数量
   */
  const onlineCount = computed(() => botsByStatus.value(BotStatus.ONLINE).length)

  /**
   * 暂停的 Bot 数量
   */
  const pausedCount = computed(() => botsByStatus.value(BotStatus.PAUSED).length)

  /**
   * 离线的 Bot 数量
   */
  const offlineCount = computed(() => botsByStatus.value(BotStatus.OFFLINE).length)

  /**
   * 禁用的 Bot 数量
   */
  const disabledCount = computed(() => botsByStatus.value(BotStatus.DISABLED).length)

  /**
   * 剩余游戏卡片总数
   */
  const gamesRemaining = computed(() =>
    botsList.value.reduce((total, bot) => {
      return total + (bot.CardsFarmer?.GamesToFarm?.length ?? 0)
    }, 0),
  )

  /**
   * 剩余卡片总数
   */
  const cardsRemaining = computed(() =>
    botsList.value.reduce((total, bot) => {
      return (
        total +
        (bot.CardsFarmer?.GamesToFarm?.reduce((sum, game) => {
          const cards = typeof game.CardsRemaining === 'string' ? parseInt(game.CardsRemaining) : game.CardsRemaining
          return sum + (cards || 0)
        }, 0) ?? 0)
      )
    }, 0),
  )

  /**
   * 预计完成时间（秒）
   */
  const timeRemaining = computed(() => {
    let maxTime = 0
    for (const bot of botsList.value) {
      const timeStr = bot.CardsFarmer?.TimeRemaining ?? ''
      if (timeStr && timeStr !== '00:00:00') {
        const parts = timeStr.split('.')
        let time = 0
        const hms = parts[0] || ''
        const [days, hours, minutes, seconds] = hms.includes('.')
          ? parts[0].split('.')
          : ['', ...hms.split(':')]
        if (days) time += parseInt(days) * 24 * 60 * 60
        if (hours) time += parseInt(hours) * 60 * 60
        if (minutes) time += parseInt(minutes) * 60
        if (seconds) time += parseInt(seconds)
        maxTime = Math.max(maxTime, time)
      }
    }
    return maxTime
  })

  /**
   * 获取 Bot 信息
   */
  async function fetchBots() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    loading.value = true
    try {
      const data = await getBots()
      // 为每个 Bot 计算状态
      for (const key in data) {
        data[key].Status = calculateBotStatus(data[key])
      }
      bots.value = data
      lastUpdate.value = Date.now()

      // 触发活动检测
      const activitiesStore = useActivitiesStore()
      activitiesStore.detectActivities(data)
    } catch (error) {
      console.error('Failed to fetch bots:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 启动自动更新（2.5秒轮询）
   */
  function startAutoUpdate() {
    if (updateInterval.value) return

    // 立即获取一次
    fetchBots()

    // 启动定时器
    updateInterval.value = window.setInterval(() => {
      fetchBots()
    }, 2500)
  }

  /**
   * 停止自动更新
   */
  function stopAutoUpdate() {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }

  /**
   * 启动 Bot
   */
  async function startBots(botNames: string[]) {
    try {
      await startBot(botNames)
      await fetchBots()
      return { success: true, message: 'Bot 已启动' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '启动失败',
      }
    }
  }

  /**
   * 停止 Bot
   */
  async function stopBots(botNames: string[]) {
    try {
      await stopBot(botNames)
      await fetchBots()
      return { success: true, message: 'Bot 已停止' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '停止失败',
      }
    }
  }

  /**
   * 暂停挂卡
   */
  async function pauseBots(
    botNames: string[],
    options?: { permanent?: boolean; resumeInSeconds?: number },
  ) {
    try {
      // 转换参数格式
      const pauseOptions = options ? {
        Permanent: options.permanent,
        ResumeInSeconds: options.resumeInSeconds,
      } : undefined
      await pauseBot(botNames, pauseOptions)
      await fetchBots()
      return { success: true, message: '已暂停挂卡' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '暂停失败',
      }
    }
  }

  /**
   * 恢复挂卡
   */
  async function resumeBots(botNames: string[]) {
    try {
      await resumeBot(botNames)
      await fetchBots()
      return { success: true, message: '已恢复挂卡' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '恢复失败',
      }
    }
  }

  /**
   * 计算 Bot 状态
   */
  function calculateBotStatus(bot: Bot): BotStatus {
    if (!bot.KeepRunning) return BotStatus.DISABLED
    if (!bot.IsConnectedAndLoggedOn) return BotStatus.OFFLINE
    if (bot.CardsFarmer?.Paused) return BotStatus.ONLINE
    // 检查是否有游戏在挂卡
    const gamesFarming = bot.CardsFarmer?.CurrentGamesFarming?.length ?? 0
    if (gamesFarming === 0) return BotStatus.ONLINE
    return BotStatus.FARMING
  }

  return {
    bots,
    lastUpdate,
    loading,
    botsList,
    botsCount,
    botsByStatus,
    farmingCount,
    onlineCount,
    pausedCount,
    offlineCount,
    disabledCount,
    gamesRemaining,
    cardsRemaining,
    timeRemaining,
    fetchBots,
    startAutoUpdate,
    stopAutoUpdate,
    startBots,
    stopBots,
    pauseBots,
    resumeBots,
    calculateBotStatus,
  }
})
