import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getASF, getAllBots } from '@/api'
import type { ASFInfo } from '@/types/asf'
import type { Bot } from '@/types/bot'
import { useAuthStore } from './auth'

interface ASFState {
  info: ASFInfo | null
  version: string
  memoryUsage: { Used: number; Total: number } | null
  uptime: number
  connected: boolean
  loading: boolean
  lastUpdate: number | null
}

export const useAsfStore = defineStore('asf', () => {
  const info = ref<ASFInfo | null>(null)
  const version = ref('')
  const memoryUsage = ref<{ Used: number; Total: number } | null>(null)
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
  const botsCount = computed(() => info.value?.BotsCount ?? 0)

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
      version.value = data.Version?.Version ?? ''
      memoryUsage.value = data.MemoryUsage
      uptime.value = data.Uptime ?? 0
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
      return await getAllBots()
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
      // TODO: 调用重启 API
      await new Promise((resolve) => setTimeout(resolve, 500))
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
      // TODO: 调用关闭 API
      await new Promise((resolve) => setTimeout(resolve, 500))
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
      // TODO: 调用更新 API
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true, message: 'ASF 正在更新...' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '更新失败',
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
    fetchInfo,
    fetchAllBots,
    restart,
    shutdown,
    update,
  }
})
