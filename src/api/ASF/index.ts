import http from '@/axios'
import type { GenericResponse, GenericResponseWithResult } from '@/types/common'

// === 枚举类型定义 ===

/**
 * 加密方法枚举
 */
export enum ECryptoMethod {
  PlainText = 0,
  AES = 1,
  ProtectedDataForCurrentUser = 2,
  EnvironmentVariable = 3,
  File = 4,
}

/**
 * 哈希方法枚举
 */
export enum EHashingMethod {
  PlainText = 0,
  SCrypt = 1,
  Pbkdf2 = 2,
}

/**
 * 更新通道枚举
 */
export enum EUpdateChannel {
  None = 0,
  Stable = 1,
  PreRelease = 2,
}

/**
 * 优化模式枚举
 */
export enum EOptimizationMode {
  MaxPerformance = 0,
  MinMemoryUsage = 1,
}

/**
 * 插件更新模式枚举
 */
export enum EPluginsUpdateMode {
  Whitelist = 0,
  Blacklist = 1,
}

/**
 * 协议类型枚举
 */
export enum EProtocolTypes {
  None = 0,
  WebSocket = 1,
  WebRTC = 2,
}

/**
 * 协议类型标志
 */
export type ProtocolTypes = EProtocolTypes | EProtocolTypes[]

// === 类型定义 ===

/**
 * ASF 响应信息
 */
export interface ASFResponse {
  /**
   * ASF 构建版本
   */
  BuildVariant: string
  /**
   * 是否可以更新
   */
  CanUpdate: boolean
  /**
   * 全局配置
   */
  GlobalConfig: GlobalConfig
  /**
   * 内存使用量（KB）
   */
  MemoryUsage: number | string
  /**
   * 进程启动时间
   */
  ProcessStartTime: string
  /**
   * 是否以服务模式运行
   */
  Service: boolean
  /**
   * ASF 版本
   */
  Version: string
}

/**
 * ASF 全局配置
 */
export interface GlobalConfig {
  /**
   * 自动重启
   */
  AutoRestart?: boolean
  /**
   * 黑名单 AppID 列表
   */
  Blacklist?: (number | string)[]
  /**
   * 命令前缀
   */
  CommandPrefix?: string | null
  /**
   * 确认限制延迟（秒）
   */
  ConfirmationsLimiterDelay?: number | string
  /**
   * 连接超时（秒）
   */
  ConnectionTimeout?: number | string
  /**
   * 当前文化
   */
  CurrentCulture?: string | null
  /**
   * 调试模式
   */
  Debug?: boolean
  /**
   * 默认 Bot
   */
  DefaultBot?: string | null
  /**
   * 挂卡延迟（秒）
   */
  FarmingDelay?: number | string
  /**
   * 过滤坏 Bot
   */
  FilterBadBots?: boolean
  /**
   * 礼品限制延迟（秒）
   */
  GiftsLimiterDelay?: number | string
  /**
   * 无头模式
   */
  Headless?: boolean
  /**
   * 空闲挂卡周期（秒）
   */
  IdleFarmingPeriod?: number | string
  /**
   * 库存限制延迟（秒）
   */
  InventoryLimiterDelay?: number | string
  /**
   * 是否启用 IPC
   */
  IPC?: boolean
  /**
   * IPC 密码
   */
  IPCPassword?: string | null
  /**
   * IPC 密码格式
   */
  IPCPasswordFormat?: EHashingMethod
  /**
   * 登录限制延迟（秒）
   */
  LoginLimiterDelay?: number | string
  /**
   * 最大挂卡时间（小时）
   */
  MaxFarmingTime?: number | string
  /**
   * 最大交易等待时间（天）
   */
  MaxTradeHoldDuration?: number | string
  /**
   * 被阻止后最小挂卡延迟（秒）
   */
  MinFarmingDelayAfterBlock?: number | string
  /**
   * 优化模式
   */
  OptimizationMode?: EOptimizationMode
  /**
   * 插件更新列表
   */
  PluginsUpdateList?: string[]
  /**
   * 插件更新模式
   */
  PluginsUpdateMode?: EPluginsUpdateMode
  /**
   * 如果可能则关闭
   */
  ShutdownIfPossible?: boolean
  /**
   * Steam 消息前缀
   */
  SteamMessagePrefix?: string | null
  /**
   * Steam 所有者 ID
   */
  SteamOwnerID?: number | string
  /**
   * Steam 协议
   */
  SteamProtocols?: ProtocolTypes
  /**
   * 更新通道
   */
  UpdateChannel?: EUpdateChannel
  /**
   * 更新周期（小时）
   */
  UpdatePeriod?: number | string
  /**
   * Web 限制延迟（毫秒）
   */
  WebLimiterDelay?: number | string
  /**
   * 网络代理
   */
  WebProxy?: string | null
  /**
   * 网络代理用户名
   */
  WebProxyUsername?: string | null
  /**
   * 网络代理密码
   */
  WebProxyPassword?: string | null
}

// === 请求类型 ===

/**
 * ASF 加密请求
 */
export interface ASFEncryptRequest {
  /**
   * 加密方法
   */
  CryptoMethod: ECryptoMethod
  /**
   * 要加密的字符串
   */
  StringToEncrypt: string
}

/**
 * ASF 哈希请求
 */
export interface ASFHashRequest {
  /**
   * 哈希方法
   */
  HashingMethod: EHashingMethod
  /**
   * 要哈希的字符串
   */
  StringToHash: string
}

/**
 * ASF 更新请求
 */
export interface UpdateRequest {
  /**
   * 目标更新通道（可选，默认使用 GlobalConfig 中的 UpdateChannel）
   */
  Channel?: EUpdateChannel | null
  /**
   * 强制更新（允许降级）
   */
  Forced?: boolean
}

/**
 * ASF 配置更新请求
 */
export interface ASFUpdateConfigRequest {
  /**
   * 全局配置
   */
  GlobalConfig: GlobalConfig
}

// === API 函数 ===

/**
 * 获取 ASF 信息
 * @returns ASF 响应信息
 */
export const getASF = (): Promise<GenericResponseWithResult<ASFResponse>> =>
  http.get('/ASF')

/**
 * 更新 ASF 全局配置
 * @param config 全局配置
 */
export const updateASFConfig = (config: GlobalConfig): Promise<GenericResponse> =>
  http.post('/ASF', { GlobalConfig: config } as ASFUpdateConfigRequest)

/**
 * 加密数据
 * @param data 要加密的数据
 * @param method 加密方法
 */
export const encryptASF = (
  data: string,
  method: ECryptoMethod = ECryptoMethod.AES,
): Promise<GenericResponseWithResult<string>> =>
  http.post('/ASF/Encrypt', { CryptoMethod: method, StringToEncrypt: data } as ASFEncryptRequest)

/**
 * 哈希数据
 * @param data 要哈希的数据
 * @param method 哈希方法
 */
export const hashASF = (
  data: string,
  method: EHashingMethod = EHashingMethod.Pbkdf2,
): Promise<GenericResponseWithResult<string>> =>
  http.post('/ASF/Hash', { HashingMethod: method, StringToHash: data } as ASFHashRequest)

/**
 * 重启 ASF
 */
export const restartASF = (): Promise<GenericResponse> =>
  http.post('/ASF/Restart')

/**
 * 退出/关闭 ASF
 */
export const exitASF = (): Promise<GenericResponse> =>
  http.post('/ASF/Exit')

/**
 * 更新 ASF
 * @param options 更新选项
 */
export const updateASF = (options?: UpdateRequest): Promise<GenericResponseWithResult<string>> =>
  http.post('/ASF/Update', options ?? {})

// === 兼容性别名 ===

/**
 * @deprecated 使用 exitASF 代替
 */
export const shutdownASF = exitASF
