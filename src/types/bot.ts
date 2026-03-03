import type { GenericResponse, GenericResponseWithResult } from './common'

/**
 * Bot 状态枚举（前端计算属性，非 API 返回）
 */
export enum BotStatus {
  DISABLED = 'disabled', // 已禁用
  OFFLINE = 'offline', // 离线
  ONLINE = 'online', // 在线
  FARMING = 'farming', // 挂卡中
  PAUSED = 'paused', // 暂停
}

/**
 * 用户输入类型枚举
 */
export enum EUserInputType {
  None = 0,
  Login = 1,
  Password = 2,
  SteamGuard = 3,
  SteamParentalCode = 4,
  TwoFactorAuthentication = 5,
  Cryptkey = 6,
  DeviceConfirmation = 7,
}

/**
 * 账户标志枚举（Flags）
 */
export enum EAccountFlags {
  NormalUser = 0,
  PersonaNameSet = 1,
  Unbannable = 2,
  PasswordSet = 4,
  Support = 8,
  Admin = 16,
  Supervisor = 32,
  AppEditor = 64,
  HWIDSet = 128,
  PersonalQASet = 256,
  VacBeta = 512,
  Debug = 1024,
  Disabled = 2048,
  LimitedUser = 4096,
  LimitedUserForce = 8192,
  EmailValidated = 16384,
  ValveEmail = 32768,
  OGGInviteOptOut = 65536,
  ForcePasswordChange = 131072,
  ForceEmailVerification = 262144,
  LogonExtraSecurity = 524288,
  LogonExtraSecurityDisabled = 1048576,
  Steam2MigrationComplete = 2097152,
  NeedLogs = 4194304,
  Lockdown = 8388608,
  MasterAppEditor = 16777216,
  BannedFromWebAPI = 33554432,
  PartnerMember = 67108864,
  GlobalModerator = 134217728,
  ParentalSettings = 268435456,
  ThirdPartySupport = 536870912,
  NeedsSSANextSteamLogon = 1073741824,
}

/**
 * 货币代码枚举
 */
export enum ECurrencyCode {
  Invalid = 0,
  USD = 1,
  GBP = 2,
  EUR = 3,
  CHF = 4,
  RUB = 5,
  PLN = 6,
  BRL = 7,
  JPY = 8,
  NOK = 9,
  IDR = 10,
  MYR = 11,
  PHP = 12,
  SGD = 13,
  THB = 14,
  VND = 15,
  KRW = 16,
  TRY = 17,
  UAH = 18,
  MXN = 19,
  CAD = 20,
  AUD = 21,
  NZD = 22,
  CNY = 23,
  INR = 24,
  CLP = 25,
  PEN = 26,
  COP = 27,
  ZAR = 28,
  HKD = 29,
  TWD = 30,
  SAR = 31,
  AED = 32,
  ARS = 34,
  ILS = 35,
  BYN = 36,
  KZT = 37,
  KWD = 38,
  QAR = 39,
  CRC = 40,
  UYU = 41,
  BGN = 42,
  HRK = 43,
  CZK = 44,
  DKK = 45,
  HUF = 46,
  RON = 47,
}

/**
 * 卡片挂卡信息
 */
export interface CardsFarmer {
  /**
   * 卡片挂卡是否暂停
   */
  Paused: boolean

  /**
   * 是否正在挂卡
   */
  NowFarming: boolean

  /**
   * 等待挂卡的游戏列表
   */
  GamesToFarm?: Game[]

  /**
   * 当前正在挂卡的游戏列表
   */
  CurrentGamesFarming?: Game[]

  /**
   * 剩余时间，格式：HH:MM:SS 或 D.HH:MM:SS
   */
  TimeRemaining: string
}

/**
 * 游戏挂卡信息
 */
export interface Game {
  /**
   * Steam 应用 ID
   */
  AppID: number | string

  /**
   * 游戏名称
   */
  GameName?: string | null

  /**
   * 剩余卡片数
   */
  CardsRemaining: number | string

  /**
   * 游戏时长（小时）
   */
  HoursPlayed: number | string
}

/**
 * Bot 配置（简化版，完整配置包含很多可选字段）
 */
export interface BotConfig {
  /**
   * Bot 名称
   */
  BotName?: string

  /**
   * Steam 登录配置
   */
  SteamLogin?: string | null

  /**
   * Steam 密码配置
   */
  SteamPassword?: string | null

  /**
   * 是否启用
   */
  Enabled?: boolean

  /**
   * 是否保持运行
   */
  KeepRunning?: boolean

  /**
   * SteamParentalCode
   */
  SteamParentalCode?: string | null

  /**
   * SteamTradeToken
   */
  SteamTradeToken?: string | null

  /**
   * 自定义挂卡时显示的游戏
   */
  CustomGamePlayedWhileFarming?: string | null

  /**
   * 自定义空闲时显示的游戏
   */
  CustomGamePlayedWhileIdle?: string | null

  /**
   * 机器名称
   */
  MachineName?: string | null

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

  /**
   * 其他配置项（动态）
   */
  [key: string]: unknown
}

/**
 * Bot 完整信息
 */
export interface Bot {
  /**
   * Bot 名称
   */
  BotName?: string | null

  /**
   * 昵称（前端可能用到，非 API 返回）
   */
  Nickname?: string

  /**
   * Steam ID（字符串格式）
   */
  s_SteamID?: string | null

  /**
   * Steam ID（数字格式）
   */
  SteamID?: number | string

  /**
   * Steam 头像哈希
   */
  AvatarHash?: string | null

  /**
   * BGR（后台兑换）游戏数量
   */
  GamesToRedeemInBackgroundCount?: number | string

  /**
   * 钱包余额（分）
   */
  WalletBalance: number | string

  /**
   * 延迟到账的钱包余额（分）
   */
  WalletBalanceDelayed: number | string

  /**
   * 钱包货币代码
   */
  WalletCurrency?: ECurrencyCode

  /**
   * 是否有移动令牌
   */
  HasMobileAuthenticator?: boolean

  /**
   * 需要的输入类型（2FA、密码等）
   */
  RequiredInput?: EUserInputType

  /**
   * 是否保持运行
   */
  KeepRunning: boolean

  /**
   * Bot 配置
   */
  BotConfig: BotConfig

  /**
   * 是否已连接并登录
   */
  IsConnectedAndLoggedOn?: boolean

  /**
   * 是否可以玩游戏
   */
  IsPlayingPossible?: boolean

  /**
   * 公网 IP
   */
  PublicIP?: string | null

  /**
   * 账户标志
   */
  AccountFlags?: EAccountFlags

  /**
   * 卡片挂卡信息
   */
  CardsFarmer?: CardsFarmer

  /**
   * Bot 状态（计算属性）
   */
  Status?: BotStatus
}

/**
 * Bot 列表响应
 */
export type BotsResponse = Record<string, Bot>

/**
 * Bot 操作响应
 */
export type BotActionResponse = GenericResponse

/**
 * Bot 操作响应（带布尔结果）
 */
export type BotActionResponseWithResult = GenericResponseWithResult<Record<string, boolean>>

/**
 * Bot 创建配置
 */
export interface CreateBotConfig {
  /**
   * Bot 名称
   */
  BotName: string

  /**
   * Steam 登录名
   */
  SteamLogin: string

  /**
   * Steam 密码
   */
  SteamPassword: string

  /**
   * 是否启用
   */
  Enabled?: boolean

  /**
   * 是否保持运行
   */
  KeepRunning?: boolean
}

// 保持向后兼容：旧的类型名
export { Game as GameToFarm }
