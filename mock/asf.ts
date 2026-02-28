import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/Api/ASF',
    method: 'get',
    response: () => {
      return {
        BotsCount: 3,
        Version: {
          Version: '6.0.5.1',
          Updated: '2026-02-28T00:00:00Z',
          NewVersion: '6.0.6.0',
          DownloadLink: 'https://github.com/JustArchiNET/ArchiSteamFarm/releases',
        },
        MemoryUsage: {
          Used: 256,
          Total: 1024,
        },
        BuildInfo: {
          BuildDate: '2026-02-28T00:00:00Z',
          Version: '6.0.5.1',
          Runtime: '.NET 8.0.0',
        },
        StartedAt: '2026-02-28T07:00:00Z',
        Uptime: 3600,
      }
    },
  },
  {
    url: '/Api/ASF/Version',
    method: 'get',
    response: () => {
      return {
        Version: '6.0.5.1',
        Updated: '2026-02-28T00:00:00Z',
      }
    },
  },
  {
    url: '/Api/ASF/Encrypt',
    method: 'post',
    response: ({ body }) => {
      console.log('Mock encryptASF:', body)
      return {
        Success: true,
        Message: '加密成功',
        Result: 'encrypted_' + btoa(JSON.stringify(body)),
      }
    },
  },
  {
    url: '/Api/ASF/Hash',
    method: 'post',
    response: ({ body }) => {
      console.log('Mock hashASF:', body)
      return {
        Success: true,
        Message: '哈希成功',
        Result: 'hashed_' + btoa(JSON.stringify(body)),
      }
    },
  },
  {
    url: '/Api/ASF/Restart',
    method: 'post',
    response: () => {
      return {
        Success: true,
        Message: 'ASF 正在重启...',
        Result: true,
      }
    },
  },
  {
    url: '/Api/ASF/Exit',
    method: 'post',
    response: () => {
      return {
        Success: true,
        Message: 'ASF 正在关闭...',
        Result: true,
      }
    },
  },
  {
    url: '/Api/ASF/Update',
    method: 'post',
    response: () => {
      return {
        Success: true,
        Message: 'ASF 正在更新到最新版本...',
        Result: true,
      }
    },
  },
] as MockMethod[]
