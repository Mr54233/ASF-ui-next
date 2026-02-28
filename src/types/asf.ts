/**
 * ASF 版本信息
 */
export interface VersionInfo {
  /**
   * ASF 版本号
   */
  Version: string

  /**
   * 更新时间
   */
  Updated: string

  /**
   * 是否有新版本
   */
  NewVersion?: string

  /**
   * 下载链接
   */
  DownloadLink?: string
}

/**
 * ASF 内存使用信息
 */
export interface MemoryUsage {
  /**
   * 内存使用量（MB）
   */
  Used: number

  /**
   * 总内存量（MB）
   */
  Total: number
}

/**
 * ASF 构建信息
 */
export interface BuildInfo {
  /**
   * 构建时间
   */
  BuildDate: string

  /**
   * 构建版本
   */
  Version: string

  /**
   * 运行时信息
   */
  Runtime: string
}

/**
 * ASF 全局配置
 */
export interface ASFGlobalConfig {
  /**
   * IPC 密码
   */
  IPCPassword: string

  /**
   * IPC 地址绑定
   */
  IPCHostname: string

  /**
   * IPC 端口
   */
  IPCPort: number

  /**
   * 是否启用 Web 界面
   */
  WebLobbyEnabled: boolean

  /**
   * 其他配置项（动态）
   */
  [key: string]: unknown
}

/**
 * ASF 完整信息
 */
export interface ASFInfo {
  /**
   * Bot 数量
   */
  BotsCount: number

  /**
   * 版本信息
   */
  Version: VersionInfo

  /**
   * 内存使用
   */
  MemoryUsage: MemoryUsage

  /**
   * 构建信息
   */
  BuildInfo?: BuildInfo

  /**
   * 启动时间
   */
  StartedAt?: string

  /**
   * 运行时间（秒）
   */
  Uptime?: number
}

/**
 * BGR（后台兑换）游戏信息
 */
export interface BGRGame {
  /**
   * Steam 应用 ID
   */
  AppID: number

  /**
   * 游戏名称
   */
  GameName: string

  /**
   * 类型（App, Sub, License）
   */
  Type: 'App' | 'Sub' | 'License'
}

/**
 * BGR 状态
 */
export interface BGRStatus {
  /**
   * 等待兑换的 Key 数量
   */
  KeysToRedeem: number

  /**
   * 正在兑换的数量
   */
  RedeemingNow: number

  /**
   * 已完成兑换
   */
  Redeemed: number

  /**
   * 兑换失败
   */
  Failed: number

  /**
   * 跳过（已拥有）
   */
  Skipped: number
}

/**
 * BGR 添加 Key 响应
 */
export interface BGRAddResponse {
  /**
   * Key
   */
  Key: string

  /**
   * 添加状态
   */
  Status: 'Added' | 'Failed' | 'Skipped' | 'Duplicate'

  /**
   * 游戏信息（如果成功）
   */
  Game?: BGRGame

  /**
   * 错误信息
   */
  Message?: string
}
