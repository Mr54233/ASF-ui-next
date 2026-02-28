import http from '@/axios'
import type { CommandResponse } from '@/types/common'

/**
 * 发送 ASF 命令
 * @param command 命令字符串
 * @returns 命令执行结果
 */
export const sendCommand = (command: string): Promise<CommandResponse> =>
  http.post('/Command', { Command: command })

/**
 * 获取可用命令列表（从缓存或 Wiki）
 */
export const getCommands = async (): Promise<
  Array<{ command: string; access: string; description: string }>
> => {
  try {
    // 从 localStorage 获取缓存
    const cached = localStorage.getItem('asf-commands')
    if (cached) {
      const { timestamp, commands } = JSON.parse(cached)
      // 缓存 6 小时
      if (Date.now() - timestamp < 6 * 60 * 60 * 1000) {
        return commands
      }
    }

    // 从 API 获取（如果 ASF 支持）
    const result = await sendCommand('help')
    if (result.Success && result.Result) {
      const commands = parseHelpCommand(result.Result)
      localStorage.setItem(
        'asf-commands',
        JSON.stringify({ timestamp: Date.now(), commands })
      )
      return commands
    }

    return []
  } catch (error) {
    console.error('Failed to fetch commands:', error)
    return []
  }
}

/**
 * 解析 help 命令的输出
 */
function parseHelpCommand(helpText: string): Array<{
  command: string
  access: string
  description: string
}> {
  const lines = helpText.split('\n')
  const commands: Array<{
    command: string
    access: string
    description: string
  }> = []

  for (const line of lines) {
    // 简单的解析逻辑，实际需要根据 ASF 输出格式调整
    const match = line.match(/^\s*([a-z]+)\s+([A-Z]+)\s+(.+)$/i)
    if (match) {
      commands.push({
        command: match[1],
        access: match[2],
        description: match[3],
      })
    }
  }

  return commands
}
