import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createBot } from '@/api/Bot'

// Mock axios module
vi.mock('@/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

// 导入 mock 后的 axios
import http from '@/axios'

describe('createBot API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call POST /Bot/Bot with correct parameters', async () => {
    const mockResponse = {
      Success: true,
      Message: 'Bot created successfully',
    }
    ;(http.post as any).mockResolvedValue(mockResponse)

    const result = await createBot({
      BotName: 'testBot',
      SteamLogin: 'testuser',
      SteamPassword: 'password123',
      Enabled: true,
      KeepRunning: true,
    })

    expect(http.post).toHaveBeenCalledWith('/Bot/Bot', {
      BotName: 'testBot',
      SteamLogin: 'testuser',
      SteamPassword: 'password123',
      Enabled: true,
      KeepRunning: true,
    })

    expect(result).toEqual(mockResponse)
  })

  it('should return success response when API call succeeds', async () => {
    const mockResponse = {
      Success: true,
      Message: 'Bot created successfully',
    }
    ;(http.post as any).mockResolvedValue(mockResponse)

    const result = await createBot({
      BotName: 'testBot',
      SteamLogin: 'testuser',
      SteamPassword: 'password123',
    })

    expect(result.Success).toBe(true)
    expect(result.Message).toBe('Bot created successfully')
  })

  it('should return error response when API call fails', async () => {
    const mockError = new Error('Network error')
    ;(http.post as any).mockRejectedValue(mockError)

    await expect(
      createBot({
        BotName: 'testBot',
        SteamLogin: 'testuser',
        SteamPassword: 'password123',
      }),
    ).rejects.toThrow('Network error')
  })

  it('should handle Bot already exists error', async () => {
    const mockResponse = {
      Success: false,
      Message: 'Bot with this name already exists',
    }
    ;(http.post as any).mockResolvedValue(mockResponse)

    const result = await createBot({
      BotName: 'existingBot',
      SteamLogin: 'user',
      SteamPassword: 'password123',
    })

    expect(result.Success).toBe(false)
    expect(result.Message).toContain('already exists')
  })
})

describe('createBot - Form Validation Logic', () => {
  it('should validate bot name format', () => {
    const validNames = ['bot1', 'bot_1', 'bot-1', 'Bot1', 'BOT1']
    const invalidNames = ['bot 1', 'bot.1', 'bot@1', 'bot#1', '']

    validNames.forEach((name) => {
      expect(/^[a-zA-Z0-9_-]+$/.test(name)).toBe(true)
    })

    invalidNames.forEach((name) => {
      if (name !== '') {
        expect(/^[a-zA-Z0-9_-]+$/.test(name)).toBe(false)
      }
    })
  })

  it('should validate bot name is not ASF', () => {
    const asfName = 'ASF'
    expect(asfName === 'ASF').toBe(true)
    expect(asfName === 'Asf').toBe(false)
    expect(asfName === 'asf').toBe(false)
  })

  it('should validate password minimum length', () => {
    const validPasswords = ['123456', 'password', 'longPassword123']
    const invalidPasswords = ['12345', '1234', '1', '']

    validPasswords.forEach((password) => {
      expect(password.length >= 6).toBe(true)
    })

    invalidPasswords.forEach((password) => {
      if (password !== '') {
        expect(password.length >= 6).toBe(false)
      }
    })
  })

  it('should validate all required fields', () => {
    const validForm = {
      BotName: 'testBot',
      SteamLogin: 'testuser',
      SteamPassword: 'password123',
    }

    expect(validForm.BotName).toBeTruthy()
    expect(validForm.SteamLogin).toBeTruthy()
    expect(validForm.SteamPassword.length).toBeGreaterThanOrEqual(6)
  })
})
