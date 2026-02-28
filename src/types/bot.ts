/**
 * Bot 状态枚举
 */
export enum BotStatus {
  DISABLED = 'disabled', // 已禁用
  OFFLINE = 'offline', // 离线
  ONLINE = 'online', // 在线
  FARMING = 'farming', // 挂卡中
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
   * 等待挂卡的游戏列表
   */
  GamesToFarm: GameToFarm[]

  /**
   * 当前正在挂卡的游戏列表
   */
  CurrentGamesFarming: GameToFarm[]

  /**
   * 剩余时间，格式：HH:MM:SS 或 D.HH:MM:SS
   */
  TimeRemaining: string
}

/**
 * 游戏挂卡信息
 */
export interface GameToFarm {
  /**
   * Steam 应用 ID
   */
  AppID: number

  /**
   * 游戏名称
   */
  GameName: string

  /**
   * 剩余卡片数
   */
  CardsRemaining: number

  /**
   * 游戏时长（小时）
   */
  Hours: number
}

/**
 * Bot 配置
 */
export interface BotConfig {
  /**
   * Bot 名称
   */
  BotName: string

  /**
   * Steam 登录配置
   */
  SteamLogin: string

  /**
   * Steam 密码配置
   */
  SteamPassword: string

  /**
   * 是否启用
   */
  Enabled: boolean

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
  BotName: string

  /**
   * 昵称
   */
  Nickname: string

  /**
   * Steam ID
   */
  s_SteamID: string

  /**
   * Steam 头像哈希
   */
  AvatarHash: string

  /**
   * BGR（后台兑换）游戏数量
   */
  GamesToRedeemInBackgroundCount: number

  /**
   * 钱包余额（分）
   */
  WalletBalance: number

  /**
   * 延迟到账的钱包余额（分）
   */
  WalletBalanceDelayed: number

  /**
   * 钱包货币代码
   */
  WalletCurrency: number

  /**
   * 是否有移动令牌
   */
  HasMobileAuthenticator: boolean

  /**
   * 需要的输入类型（2FA、密码等）
   */
  RequiredInput: number

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
  IsConnectedAndLoggedOn: boolean

  /**
   * 卡片挂卡信息
   */
  CardsFarmer: CardsFarmer

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
export interface BotActionResponse extends GenericResponse<boolean> {}

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
