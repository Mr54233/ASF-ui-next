import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Bot } from '@/types/bot'

// Mock @/api/Bot
vi.mock('@/api/Bot', () => ({
  getBot: vi.fn(),
  updateBot: vi.fn(),
}))

// Mock ConfigEditor
vi.mock('@/components/ConfigEditor', () => ({
  ConfigEditor: {
    name: 'ConfigEditor',
    template: '<div>Mock</div>',
  },
}))

// Import after mocks
import { getBot, updateBot } from '@/api/Bot'

describe('BotConfigDialog - 单元测试', () => {
  const mockBot: Bot = {
    BotName: 'testBot',
    Nickname: 'Test Bot',
    s_SteamID: '76561198xxxxxxxxxx',
    Status: 0,
    IsConnectedAndLoggedOn: true,
    HasMobileAuthenticator: false,
    KeepRunning: true,
    CardsFarmer: {
      Paused: false,
      GamesToFarm: [],
      CurrentGamesFarming: [],
    },
    GamesToRedeemInBackgroundCount: 0,
    BotConfig: {
      Name: 'testBot',
      SteamLogin: 'testlogin',
      Enabled: true,
      KeepRunning: true,
    },
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('占位符过滤逻辑', () => {
    // 模拟 filterPlaceholderValues 函数
    function filterPlaceholderValues(config: Record<string, any>): Record<string, any> {
      const filtered: Record<string, any> = {}
      const sensitiveFields = ['SteamLogin', 'SteamPassword', 'SteamParentalCode']
      const placeholderValues = ['保持不变', '', null, undefined]

      for (const [key, value] of Object.entries(config)) {
        if (sensitiveFields.includes(key)) {
          if (!placeholderValues.includes(value)) {
            filtered[key] = value
          }
        } else {
          filtered[key] = value
        }
      }

      return filtered
    }

    it('应该过滤掉 "保持不变" 占位符', () => {
      const config = {
        Name: 'testBot',
        SteamLogin: '保持不变',
        Enabled: true,
      }

      const result = filterPlaceholderValues(config)

      expect(result.Name).toBe('testBot')
      expect(result.Enabled).toBe(true)
      expect(result).not.toHaveProperty('SteamLogin')
    })

    it('应该过滤掉空字符串占位符', () => {
      const config = {
        Name: 'testBot',
        SteamPassword: '',
        Enabled: true,
      }

      const result = filterPlaceholderValues(config)

      expect(result.Name).toBe('testBot')
      expect(result).not.toHaveProperty('SteamPassword')
    })

    it('应该过滤掉 null 占位符', () => {
      const config = {
        Name: 'testBot',
        SteamParentalCode: null,
        Enabled: true,
      }

      const result = filterPlaceholderValues(config)

      expect(result.Name).toBe('testBot')
      expect(result).not.toHaveProperty('SteamParentalCode')
    })

    it('应该保留有效的敏感字段值', () => {
      const config = {
        Name: 'testBot',
        SteamLogin: 'newLogin',
        SteamPassword: 'newPassword',
        Enabled: true,
      }

      const result = filterPlaceholderValues(config)

      expect(result.Name).toBe('testBot')
      expect(result.SteamLogin).toBe('newLogin')
      expect(result.SteamPassword).toBe('newPassword')
    })

    it('应该保留所有非敏感字段', () => {
      const config = {
        Name: 'testBot',
        Enabled: false,
        KeepRunning: true,
        MaxGamesPlayedConcurrently: 5,
        SteamLogin: '保持不变', // 这个应该被过滤
      }

      const result = filterPlaceholderValues(config)

      expect(result.Name).toBe('testBot')
      expect(result.Enabled).toBe(false)
      expect(result.KeepRunning).toBe(true)
      expect(result.MaxGamesPlayedConcurrently).toBe(5)
      expect(result).not.toHaveProperty('SteamLogin')
    })
  })

  describe('API 调用', () => {
    it('getBot 应该被正确调用', async () => {
      ;(getBot as any).mockResolvedValue(mockBot)

      const result = await getBot('testBot')

      expect(getBot).toHaveBeenCalledWith('testBot')
      expect(result).toEqual(mockBot)
    })

    it('updateBot 应该被正确调用', async () => {
      ;(updateBot as any).mockResolvedValue({ testBot: true })

      const config = { Name: 'testBot', Enabled: true }
      const result = await updateBot('testBot', config)

      expect(updateBot).toHaveBeenCalledWith('testBot', config)
      expect(result).toEqual({ testBot: true })
    })

    it('getBot 失败时应该抛出错误', async () => {
      const error = new Error('加载失败')
      ;(getBot as any).mockRejectedValue(error)

      await expect(getBot('testBot')).rejects.toThrow('加载失败')
    })

    it('updateBot 失败时应该抛出错误', async () => {
      const error = new Error('保存失败')
      ;(updateBot as any).mockRejectedValue(error)

      await expect(updateBot('testBot', {})).rejects.toThrow('保存失败')
    })
  })
})
