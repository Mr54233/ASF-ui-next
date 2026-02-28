import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/Api/Bot/:botNames/BGR',
    method: 'get',
    response: ({ query }) => {
      console.log('Mock getBGRStatus:', query.botNames)
      return {
        KeysToRedeem: 5,
        RedeemingNow: 1,
        Redeemed: 10,
        Failed: 2,
        Skipped: 3,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/BGR/Add',
    method: 'post',
    response: ({ query, body }) => {
      console.log('Mock addKeysToBGR:', query.botNames, body)
      const data = body as { Keys: string[] }
      const keys = data.Keys || []

      const results = keys.map((key) => ({
        Key: key,
        Status: 'Added',
        Game: {
          AppID: Math.floor(Math.random() * 1000000),
          GameName: 'Test Game',
          Type: 'App',
        },
      }))

      return {
        Success: true,
        Message: `已添加 ${keys.length} 个 Key`,
        Result: results,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/BGR/Clear',
    method: 'post',
    response: ({ query }) => {
      console.log('Mock clearBGRQueue:', query.botNames)
      return {
        Success: true,
        Message: 'BGR 队列已清空',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/BGR/Delete',
    method: 'post',
    response: ({ query, body }) => {
      console.log('Mock deleteKeysFromBGR:', query.botNames, body)
      return {
        Success: true,
        Message: 'Key 已删除',
        Result: true,
      }
    },
  },
  {
    url: '/Api/Bot/:botNames/BGR/Reset',
    method: 'post',
    response: ({ query }) => {
      console.log('Mock resetBGRStatus:', query.botNames)
      return {
        Success: true,
        Message: 'BGR 状态已重置',
        Result: true,
      }
    },
  },
] as MockMethod[]
