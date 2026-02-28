import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/Api/Command',
    method: 'post',
    response: ({ body }) => {
      console.log('Mock sendCommand:', body)
      const command = (body as { Command: string }).Command

      // 模拟命令响应
      const responses: Record<string, string> = {
        status: `ASF v6.0.5.1 - 3 bot(s) - Uptime: 01:00:00\n\nBot status:\n- bot1: Farming (Game 1)\n- bot2: Paused\n- bot3: Offline`,
        owns: 'ASF: No games found',
        'help <Command>': 'Usage: help <Command>\nAvailable commands: status, owns, r, r^, sa, oa',
        clear: 'Terminal cleared',
        clearhistory: 'Command history cleared',
      }

      return {
        Success: true,
        Message: '命令执行成功',
        Result: responses[command] || `Command "${command}" executed successfully`,
      }
    },
  },
] as MockMethod[]
