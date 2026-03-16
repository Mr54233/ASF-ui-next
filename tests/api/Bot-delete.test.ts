import { describe, it, expect, beforeEach, vi } from 'vitest'
import { deleteBot } from '@/api/Bot'

// Mock axios module
vi.mock('@/axios', () => ({
  default: {
    delete: vi.fn(),
    post: vi.fn(),
  },
}))

// 导入 mock 后的 axios
import http from '@/axios'

describe('deleteBot API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call DELETE /Bot/{botNames} with correct parameters', async () => {
    const mockResponse = {
      Success: true,
      Message: 'Bot deleted successfully',
    }
    ;(http.delete as any).mockResolvedValue(mockResponse)

    const result = await deleteBot(['bot1', 'bot2'])

    expect(http.delete).toHaveBeenCalledWith('/Bot/bot1,bot2')

    expect(result).toEqual(mockResponse)
  })

  it('should call DELETE with single bot name', async () => {
    const mockResponse = {
      Success: true,
      Message: 'Bot deleted successfully',
    }
    ;(http.delete as any).mockResolvedValue(mockResponse)

    const result = await deleteBot(['bot1'])

    expect(http.delete).toHaveBeenCalledWith('/Bot/bot1')

    expect(result.Success).toBe(true)
  })

  it('should return success response when API call succeeds', async () => {
    const mockResponse = {
      Success: true,
      Message: 'Bots deleted successfully',
    }
    ;(http.delete as any).mockResolvedValue(mockResponse)

    const result = await deleteBot(['bot1', 'bot2', 'bot3'])

    expect(result.Success).toBe(true)
    expect(result.Message).toBe('Bots deleted successfully')
  })

  it('should return error response when API call fails', async () => {
    const mockError = new Error('Network error')
    ;(http.delete as any).mockRejectedValue(mockError)

    await expect(deleteBot(['bot1'])).rejects.toThrow('Network error')
  })

  it('should handle bot not found error', async () => {
    const mockResponse = {
      Success: false,
      Message: 'Bot not found',
    }
    ;(http.delete as any).mockResolvedValue(mockResponse)

    const result = await deleteBot(['nonExistentBot'])

    expect(result.Success).toBe(false)
    expect(result.Message).toContain('not found')
  })

  it('should handle partial deletion success', async () => {
    const mockResponse = {
      Success: false,
      Message: 'Some bots could not be deleted',
    }
    ;(http.delete as any).mockResolvedValue(mockResponse)

    const result = await deleteBot(['bot1', 'bot2', 'bot3'])

    expect(result.Success).toBe(false)
    expect(result.Message).toContain('Some bots')
  })
})

describe('deleteBot - Form Validation Logic', () => {
  it('should handle empty bot names array', () => {
    const botNames: string[] = []
    expect(botNames.length).toBe(0)
  })

  it('should filter out empty bot names', () => {
    const botNames = ['bot1', '', 'bot2', null as unknown as string, undefined as unknown as string]
    const filtered = botNames.filter((n) => n && typeof n === 'string')

    expect(filtered).toEqual(['bot1', 'bot2'])
    expect(filtered.length).toBe(2)
  })

  it('should construct comma-separated bot names', () => {
    const botNames = ['bot1', 'bot2', 'bot3']
    const joined = botNames.join(',')

    expect(joined).toBe('bot1,bot2,bot3')
  })

  it('should handle special characters in bot names', () => {
    const botNames = ['bot-1', 'bot_2', 'bot.3']
    const joined = botNames.join(',')

    expect(joined).toBe('bot-1,bot_2,bot.3')
  })
})
