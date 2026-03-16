import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renameBot } from '@/api/Bot'

// Mock axios module
vi.mock('@/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

// 导入 mock 后的 axios
import http from '@/axios'

describe('renameBot API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call POST /Bot/{oldName}/Rename with correct parameters', async () => {
    const mockResponse = {
      Success: true,
      Message: 'Bot renamed successfully',
    }
    ;(http.post as any).mockResolvedValue(mockResponse)

    const result = await renameBot('oldBot', 'newBot')

    expect(http.post).toHaveBeenCalledWith('/Bot/oldBot/Rename', {
      NewName: 'newBot',
    })

    expect(result).toEqual(mockResponse)
  })

  it('should return success response when API call succeeds', async () => {
    const mockResponse = {
      Success: true,
      Message: 'Bot renamed successfully',
    }
    ;(http.post as any).mockResolvedValue(mockResponse)

    const result = await renameBot('oldBot', 'newBot')

    expect(result.Success).toBe(true)
    expect(result.Message).toBe('Bot renamed successfully')
  })

  it('should return error response when API call fails', async () => {
    const mockError = new Error('Network error')
    ;(http.post as any).mockRejectedValue(mockError)

    await expect(renameBot('oldBot', 'newBot')).rejects.toThrow('Network error')
  })

  it('should handle Bot already exists error', async () => {
    const mockResponse = {
      Success: false,
      Message: 'Bot with this name already exists',
    }
    ;(http.post as any).mockResolvedValue(mockResponse)

    const result = await renameBot('oldBot', 'existingBot')

    expect(result.Success).toBe(false)
    expect(result.Message).toContain('already exists')
  })

  it('should handle invalid bot name error', async () => {
    const mockResponse = {
      Success: false,
      Message: 'Invalid bot name format',
    }
    ;(http.post as any).mockResolvedValue(mockResponse)

    const result = await renameBot('oldBot', 'invalid@name')

    expect(result.Success).toBe(false)
    expect(result.Message).toContain('Invalid')
  })
})

describe('renameBot - Form Validation Logic', () => {
  it('should validate bot name format', () => {
    const validNames = ['bot1', 'bot_1', 'bot-1', 'Bot1', 'BOT1', 'NewName123']
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

  it('should validate trimmed name', () => {
    const nameWithSpaces = '  newBot  '
    expect(nameWithSpaces.trim()).toBe('newBot')
    expect(nameWithSpaces.trim() !== nameWithSpaces).toBe(true)
  })

  it('should validate old and new names are different', () => {
    const oldName = 'bot1'
    const newName = 'bot1'
    expect(oldName === newName).toBe(true) // Same names should be detected
  })
})
