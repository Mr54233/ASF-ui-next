import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const settingsStore = useSettingsStore()

    expect(settingsStore.sidebarCollapsed).toBe(false)
    expect(settingsStore.sidebarWidth).toBe(240)
    expect(settingsStore.theme).toBe('dark')
    expect(settingsStore.fontSize).toBe('medium')
    expect(settingsStore.language).toBe('zh-CN')
    expect(settingsStore.favButtons).toBe(0b1111)
    expect(settingsStore.timestamps).toBe(true)
    expect(settingsStore.autoRefresh).toBe(true)
  })

  it('should toggle sidebar', () => {
    const settingsStore = useSettingsStore()

    settingsStore.toggleSidebar()
    expect(settingsStore.sidebarCollapsed).toBe(true)

    settingsStore.toggleSidebar()
    expect(settingsStore.sidebarCollapsed).toBe(false)
  })

  it('should set sidebar width', () => {
    const settingsStore = useSettingsStore()

    settingsStore.setSidebarWidth(300)
    expect(settingsStore.sidebarWidth).toBe(300)

    // 测试最小值限制
    settingsStore.setSidebarWidth(100)
    expect(settingsStore.sidebarWidth).toBe(180)

    // 测试最大值限制
    settingsStore.setSidebarWidth(500)
    expect(settingsStore.sidebarWidth).toBe(400)
  })

  it('should set theme', () => {
    const settingsStore = useSettingsStore()

    settingsStore.setTheme('light')
    expect(settingsStore.theme).toBe('light')

    settingsStore.setTheme('dark')
    expect(settingsStore.theme).toBe('dark')
  })

  it('should toggle favorite button', () => {
    const settingsStore = useSettingsStore()

    settingsStore.toggleFavButton(0)
    expect(settingsStore.favButtons).toBe(0b1110)

    settingsStore.toggleFavButton(2)
    expect(settingsStore.favButtons).toBe(0b1010)
  })

  it('should reset settings', () => {
    const settingsStore = useSettingsStore()

    // 修改一些值
    settingsStore.sidebarCollapsed = true
    settingsStore.theme = 'light'
    settingsStore.language = 'en-US'

    // 重置
    settingsStore.resetSettings()

    expect(settingsStore.sidebarCollapsed).toBe(false)
    expect(settingsStore.theme).toBe('dark')
    expect(settingsStore.language).toBe('zh-CN')
  })
})
