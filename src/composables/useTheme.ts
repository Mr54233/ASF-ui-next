import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const THEME_KEY = 'asf-theme-mode'

// 全局单例状态
const globalThemeMode = ref<ThemeMode>(
  (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light'
)

export function useTheme() {
  // 获取系统主题偏好
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // 计算当前应该使用的主题
  const isDark = () => {
    if (globalThemeMode.value === 'auto') {
      return getSystemTheme() === 'dark'
    }
    return globalThemeMode.value === 'dark'
  }

  // 应用主题
  const applyTheme = () => {
    const html = document.documentElement
    if (isDark()) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // 切换主题
  const setTheme = (mode: ThemeMode) => {
    globalThemeMode.value = mode
    localStorage.setItem(THEME_KEY, mode)
    applyTheme()
  }

  // 监听系统主题变化
  let mediaQuery: MediaQueryList | null = null
  const watchSystemTheme = () => {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme()
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery?.removeEventListener('change', handler)
  }

  // 初始化
  applyTheme()
  const stopWatch = watchSystemTheme()

  // 监听主题模式变化
  watch(globalThemeMode, applyTheme)

  return {
    themeMode: globalThemeMode,
    isDark,
    setTheme,
    stopWatch,
  }
}
