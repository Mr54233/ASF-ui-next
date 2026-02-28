import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/health',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'ok',
        data: 'Mock server is running',
      }
    },
  },
] as MockMethod[]
