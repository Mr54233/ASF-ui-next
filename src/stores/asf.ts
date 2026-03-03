import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getASF, restartASF, exitASF, updateASF } from '@/api/ASF'
import { getBots } from '@/api/Bot'
import type { ASFResponse, GlobalConfig } from '@/api/ASF'
import type { Bot } from '@/types/bot'
import { useAuthStore } from './auth'
import { useBotsStore } from './bots'

interface ASFState {
  info: ASFResponse | null
  version: string
  memoryUsage: number | null
  uptime: number
  connected: boolean
  loading: boolean
  lastUpdate: number | null
}

export const useAsfStore = defineStore('asf', () => {
  const info = ref<ASFResponse | null>(null)
  const version = ref('')
  const memoryUsage = ref<number | null>(null)
  const uptime = ref(0)
  const connected = ref(false)
  const loading = ref(false)
  const lastUpdate = ref<number | null>(null)

  /**
   * 是否运行中
   */
  const isRunning = computed(() => connected.value && !!info.value)

  /**
   * Bot 数量
   */
  const botsCount = computed(() => {
    // 从 Bots store 获取
    const botsStore = useBotsStore()
    return botsStore.botsCount
  })

  /**
   * 全局配置
   */
  const globalConfig = computed(() => info.value?.GlobalConfig)

  /**
   * 获取 ASF 信息
   */
  async function fetchInfo() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    loading.value = true
    try {
      const data = await getASF()
      info.value = data
      version.value = data.Version
      // MemoryUsage 是 KB，转换为 MB
      const memKB = typeof data.MemoryUsage === 'string' ? parseInt(data.MemoryUsage) : data.MemoryUsage
      memoryUsage.value = memKB ? Math.round(memKB / 1024) : null
      // 计算运行时间（从 ProcessStartTime）
      if (data.ProcessStartTime) {
        const startTime = new Date(data.ProcessStartTime).getTime()
        uptime.value = Math.floor((Date.now() - startTime) / 1000)
      }
      connected.value = true
      lastUpdate.value = Date.now()
    } catch (error) {
      console.error('Failed to fetch ASF info:', error)
      connected.value = false
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取所有 Bot（快捷方式）
   */
  async function fetchAllBots(): Promise<Record<string, Bot>> {
    try {
      return await getBots()
    } catch (error) {
      console.error('Failed to fetch all bots:', error)
      return {}
    }
  }

  /**
   * 重启 ASF
   */
  async function restart() {
    try {
      await restartASF()
      return { success: true, message: 'ASF 正在重启...' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '重启失败',
      }
    }
  }

  /**
   * 关闭 ASF
   */
  async function shutdown() {
    try {
      await exitASF()
      return { success: true, message: 'ASF 正在关闭...' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '关闭失败',
      }
    }
  }

  /**
   * 更新 ASF
   */
  async function update() {
    try {
      const result = await updateASF()
      return { success: true, message: result || 'ASF 正在更新...' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '更新失败',
      }
    }
  }

  /**
   * 更新全局配置
   */
  async function updateConfig(config: GlobalConfig) {
    try {
      const { updateASFConfig } = await import('@/api/ASF')
      await updateASFConfig(config)
      await fetchInfo()
      return { success: true, message: '配置已更新' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '更新配置失败',
      }
    }
  }

  return {
    info,
    version,
    memoryUsage,
    uptime,
    connected,
    loading,
    lastUpdate,
    isRunning,
    botsCount,
    globalConfig,
    fetchInfo,
    fetchAllBots,
    restart,
    shutdown,
    update,
    updateConfig,
  }
})
