import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const authStore = useAuthStore()

    expect(authStore.token).toBe(null)
    expect(authStore.ipcHost).toBe('localhost')
    expect(authStore.ipcPort).toBe(1242)
    expect(authStore.authenticated).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('should login successfully', async () => {
    const authStore = useAuthStore()

    const result = await authStore.login('localhost', 1242, 'password')

    expect(result.success).toBe(true)
    expect(result.message).toBe('登录成功')
    expect(authStore.token).toBeTruthy()
    expect(authStore.ipcHost).toBe('localhost')
    expect(authStore.ipcPort).toBe(1242)
    expect(authStore.authenticated).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('should logout', () => {
    const authStore = useAuthStore()

    // 先登录
    authStore.token = 'test-token'
    authStore.authenticated = true

    // 登出
    authStore.logout()

    expect(authStore.token).toBe(null)
    expect(authStore.authenticated).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('should test connection', async () => {
    const authStore = useAuthStore()

    const result = await authStore.testConnection('localhost', 1242)

    expect(result.Success).toBe(true)
    expect(result.Message).toBe('连接成功')
  })
})
