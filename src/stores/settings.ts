import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface SettingsState {
  // 布局
  sidebarCollapsed: boolean
  sidebarWidth: number

  // 字体大小
  fontSize: 'small' | 'medium' | 'large'

  // 语言
  language: string

  // Bot 列表
  selectedBots: string[] // 当前过滤的 Bot 状态
  orderBotsNumeric: boolean // 是否按数字排序
  orderDisabledBotsLast: boolean // 禁用 Bot 排最后

  // Bot 操作
  favButtons: number // 快捷操作按钮（bitmask）

  // 通用
  timestamps: boolean // 显示时间戳
  autoRefresh: boolean // 自动刷新
  notifications: boolean // 启用通知
}

export const useSettingsStore = defineStore(
  'settings',
  () => {
    // 布局
    const sidebarCollapsed = ref(false)
    const sidebarWidth = ref(240)

    // 字体大小
    const fontSize = ref<'small' | 'medium' | 'large'>('medium')

    // 语言
    const language = ref('zh-CN')

    // Bot 列表
    const selectedBots = ref<string[]>([])
    const orderBotsNumeric = ref(false)
    const orderDisabledBotsLast = ref(true)

    // Bot 操作
    const favButtons = ref(0b1111) // 4个按钮全部显示：2FA, BGR, config, pause

    // 通用
    const timestamps = ref(true)
    const autoRefresh = ref(true)
    const notifications = ref(true)

    /**
     * 快捷操作按钮配置
     */
    const favButtonsConfig = computed(() => {
      return [
        { name: '2fa', icon: 'Lock', enabled: !!(favButtons.value & 0b0001) },
        { name: 'bgr', icon: 'Key', enabled: !!(favButtons.value & 0b0010) },
        { name: 'config', icon: 'Wrench', enabled: !!(favButtons.value & 0b0100) },
        { name: 'pause', icon: 'Pause', enabled: !!(favButtons.value & 0b1000) },
      ]
    })

    /**
     * 切换侧边栏
     */
    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /**
     * 设置侧边栏宽度
     */
    function setSidebarWidth(width: number) {
      sidebarWidth.value = Math.max(180, Math.min(400, width))
    }

    /**
     * 设置 Bot 过滤
     */
    function setSelectedBots(statuses: string[]) {
      selectedBots.value = statuses
    }

    /**
     * 清空 Bot 过滤
     */
    function clearBotFilter() {
      selectedBots.value = []
    }

    /**
     * 切换快捷按钮
     */
    function toggleFavButton(index: number) {
      favButtons.value ^= 1 << index
    }

    /**
     * 重置所有设置
     */
    function resetSettings() {
      sidebarCollapsed.value = false
      sidebarWidth.value = 240
      fontSize.value = 'medium'
      language.value = 'zh-CN'
      selectedBots.value = []
      orderBotsNumeric.value = false
      orderDisabledBotsLast.value = true
      favButtons.value = 0b1111
      timestamps.value = true
      autoRefresh.value = true
      notifications.value = true
    }

    return {
      sidebarCollapsed,
      sidebarWidth,
      fontSize,
      language,
      selectedBots,
      orderBotsNumeric,
      orderDisabledBotsLast,
      favButtons,
      timestamps,
      autoRefresh,
      notifications,
      favButtonsConfig,
      toggleSidebar,
      setSidebarWidth,
      setSelectedBots,
      clearBotFilter,
      toggleFavButton,
      resetSettings,
    }
  },
  {
    persist: {
      key: 'asf-settings',
    },
  },
)
