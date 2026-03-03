import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 Axios 实例
const http: AxiosInstance = axios.create({
  // baseURL: BASE_URL,
  baseURL: '/Api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 pinia persist 的存储中读取 token
    const authData = localStorage.getItem('asf-auth')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        const token = parsed.token
        if (token) {
          config.headers.Authentication = token
        }
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data
    // ASF API 返回 GenericResponse<T> 格式：{ Success, Message, Result }
    // 自动解包 Result 属性
    if (data && typeof data === 'object' && 'Success' in data) {
      // 如果有 Result 属性，返回 Result；否则返回整个对象
      if ('Result' in data) {
        return data.Result ?? data
      }
      // 没有 Result 的操作（如删除、更新），返回整个对象
      return data
    }
    return data
  },
  (error) => Promise.reject(error),
)

export default http
