import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { GenericResponse } from '@/types/common'

interface AuthState {
  token: string | null
  ipcHost: string
  ipcPort: number
  authenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null)
    const ipcHost = ref('localhost')
    const ipcPort = ref(1242)
    const authenticated = ref(false)
    const loading = ref(false)

    /**
     * 是否已认证
     */
    const isAuthenticated = computed(() => authenticated.value && !!token.value)

    /**
     * 登录
     */
    async function login(host: string, port: number, password: string) {
      loading.value = true
      try {
        // TODO: 调用登录 API
        // 这里需要根据实际的 IPC 认证方式实现
        // 暂时模拟登录成功
        await new Promise((resolve) => setTimeout(resolve, 500))

        token.value = password // IPC 密码直接作为 token
        ipcHost.value = host
        ipcPort.value = port
        authenticated.value = true

        return { success: true, message: '登录成功' }
      } catch (error) {
        console.error('Login failed:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : '登录失败',
        }
      } finally {
        loading.value = false
      }
    }

    /**
     * 登出
     */
    function logout() {
      token.value = null
      authenticated.value = false
    }

    /**
     * 测试连接
     */
    async function testConnection(host: string, port: number): Promise<GenericResponse> {
      try {
        // TODO: 调用 API 测试连接
        await new Promise((resolve) => setTimeout(resolve, 300))
        return { Success: true, Message: '连接成功' }
      } catch (error) {
        return {
          Success: false,
          Message: error instanceof Error ? error.message : '连接失败',
        }
      }
    }

    return {
      token,
      ipcHost,
      ipcPort,
      authenticated,
      loading,
      isAuthenticated,
      login,
      logout,
      testConnection,
    }
  },
  {
    persist: {
      key: 'asf-auth',
      paths: ['token', 'ipcHost', 'ipcPort', 'authenticated'],
    },
  },
)
