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
    // if (response.data.code !== 200) {
    //   return Promise.reject(response.data.message)
    // }
    console.log('response', response.data)
    return response.data
  },
  (error) => Promise.reject(error),
)

export default http
