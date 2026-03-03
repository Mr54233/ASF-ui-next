import http from '@/axios'
import type { GenericResponseWithResult } from '@/types/common'

/**
 * 命令请求
 */
export interface CommandRequest {
  /**
   * 要执行的命令
   */
  Command: string
}

/**
 * 发送 ASF 命令
 * @param command 命令字符串
 * @returns 命令执行结果
 * @description
 * 此 API 端点应完全被 /Api/ASF/{action} 和 /Api/Bot/{bot}/{action} 中的 ASF 操作替代。
 * 使用此端点时应使用 "given bot" 命令，省略命令目标将导致命令在 DefaultBot 上执行。
 */
export const sendCommand = (command: string): Promise<GenericResponseWithResult<string>> =>
  http.post('/Command', { Command: command } as CommandRequest)

/**
 * 命令描述
 */
export interface CommandDescription {
  /**
   * 命令名称
   */
  command: string
  /**
   * 所需权限级别
   */
  access: string
  /**
   * 命令描述
   */
  description: string
}

/**
 * 命令缓存数据
 */
interface CommandsCache {
  timestamp: number
  commands: CommandDescription[]
}

/**
 * 获取可用命令列表（从缓存或 help 命令）
 * @returns 命令列表
 */
export const getCommands = async (): Promise<CommandDescription[]> => {
  try {
    // 从 localStorage 获取缓存
    const cached = localStorage.getItem('asf-commands')
    if (cached) {
      const { timestamp, commands } = JSON.parse(cached) as CommandsCache
      // 缓存 6 小时
      if (Date.now() - timestamp < 6 * 60 * 60 * 1000) {
        return commands
      }
    }

    // 从 API 获取（执行 help 命令）
    const result = await sendCommand('help')
    if (result.Success && result.Result) {
      const commands = parseHelpCommand(result.Result)
      localStorage.setItem(
        'asf-commands',
        JSON.stringify({ timestamp: Date.now(), commands } as CommandsCache),
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
 * @param helpText help 命令的输出文本
 * @returns 解析后的命令列表
 */
function parseHelpCommand(helpText: string): CommandDescription[] {
  const lines = helpText.split('\n')
  const commands: CommandDescription[] = []

  for (const line of lines) {
    // 简单的解析逻辑，实际需要根据 ASF 输出格式调整
    // ASF help 输出格式通常是:命令名 权限级别 描述
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
