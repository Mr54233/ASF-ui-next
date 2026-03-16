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
    expect(settingsStore.fontSize).toBe('medium')
    expect(settingsStore.language).toBe('zh-CN')
  })

  it('should toggle sidebar', () => {
    const settingsStore = useSettingsStore()

    expect(settingsStore.sidebarCollapsed).toBe(false)

    settingsStore.toggleSidebar()
    expect(settingsStore.sidebarCollapsed).toBe(true)

    settingsStore.toggleSidebar()
    expect(settingsStore.sidebarCollapsed).toBe(false)
  })

  it('should set sidebar width', () => {
    const settingsStore = useSettingsStore()

    settingsStore.setSidebarWidth(300)
    expect(settingsStore.sidebarWidth).toBe(300)

    // Should clamp to min 180
    settingsStore.setSidebarWidth(100)
    expect(settingsStore.sidebarWidth).toBe(180)

    // Should clamp to max 400
    settingsStore.setSidebarWidth(500)
    expect(settingsStore.sidebarWidth).toBe(400)
  })

  it('should toggle favorite button', () => {
    const settingsStore = useSettingsStore()

    // Default all buttons on
    expect(settingsStore.favButtons).toBe(0b1111)

    // Toggle a button off (2fa is index 0)
    settingsStore.toggleFavButton(0) // 2fa is index 0
    expect(settingsStore.favButtons).toBe(0b1110)

    // Toggle it back on
    settingsStore.toggleFavButton(0)
    expect(settingsStore.favButtons).toBe(0b1111)
  })

  it('should reset settings', () => {
    const settingsStore = useSettingsStore()

    // Modify some values
    settingsStore.sidebarCollapsed = true
    settingsStore.language = 'en-US'
    settingsStore.timestamps = false

    // Reset
    settingsStore.resetSettings()

    expect(settingsStore.sidebarCollapsed).toBe(false)
    expect(settingsStore.language).toBe('zh-CN')
    expect(settingsStore.timestamps).toBe(true)
  })
})
