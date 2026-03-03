import http from '@/axios'
import type {
  BotsResponse,
  BotActionResponse,
  CreateBotConfig,
  EUserInputType,
  BotConfig,
} from './types'
import type { Bot, Game } from '@/types/bot'
import type { GenericResponse, GenericResponseWithResult } from '@/types/common'

// === 请求类型定义 ===

/**
 * Bot 更新请求
 */
export interface BotUpdateRequest {
  BotConfig: BotConfig
}

/**
 * Bot 暂停请求
 */
export interface BotPauseRequest {
  /**
   * 是否永久暂停
   */
  Permanent?: boolean
  /**
   * 多少秒后自动恢复，0 表示禁用自动恢复
   */
  ResumeInSeconds?: number
}

/**
 * Bot 输入请求
 */
export interface BotInputRequest {
  /**
   * 输入类型
   */
  Type: EUserInputType
  /**
   * 输入值
   */
  Value: string
}

/**
 * Bot 重命名请求
 */
export interface BotRenameRequest {
  /**
   * 新名称，不能是 ASF 或已存在的 Bot 名称
   */
  NewName: string
}

/**
 * Bot 礼品卡兑换请求
 */
export interface BotRedeemRequest {
  /**
   * 游戏激活码列表
   */
  Keys: string[]
  /**
   * 激活码对应的 AppID（用于分发给指定 Bot）
   */
  AppIDs?: (number | string)[]
}

/**
 * Bot 礼品卡后台兑换请求
 */
export interface BotGamesToRedeemInBackgroundRequest {
  /**
   * 激活码列表
   */
  Keys: string[]
}

/**
 * Bot 添加许可证请求
 */
export interface BotAddLicenseRequest {
  /**
   * 免费许可证 AppID 列表
   */
  AppIDs: (number | string)[]
}

/**
 * Bot 移除许可证请求
 */
export interface BotRemoveLicenseRequest {
  /**
   * 许可证 AppID 列表
   */
  AppIDs: (number | string)[]
}

/**
 * 2FA 确认请求
 */
export interface TwoFactorAuthenticationConfirmationsRequest {
  /**
   * 是否接受所有确认
   */
  AcceptAll: boolean
  /**
   * 要处理的确认 ID 列表
   */
  ConfirmationIDs?: number[]
}

/**
 * Bot 库存响应
 */
export interface BotInventoryResponse {
  /**
   * 库存物品列表
   */
  Inventory?: Record<string, Game[]>
  /**
   * 游戏库存
   */
  Apps?: Record<number | string, Game[]>
}

// === API 函数 ===

/**
 * 获取所有 Bot 信息
 * @param botNames Bot 名称列表，不传或传空则获取所有
 * @returns Bot 列表响应
 */
export const getBots = (botNames?: string[]): Promise<GenericResponseWithResult<BotsResponse>> =>
  http.get(`/Bot/${botNames?.join(',') ?? 'asf'}`)

/**
 * 获取单个 Bot 信息
 * @param botName Bot 名称
 */
export const getBot = (botName: string): Promise<GenericResponseWithResult<Bot>> =>
  http.get(`/Bot/${botName}`)

/**
 * 更新 Bot 配置
 * @param botName Bot 名称
 * @param config Bot 配置
 */
export const updateBot = (
  botName: string,
  config: BotConfig,
): Promise<GenericResponseWithResult<Record<string, boolean>>> =>
  http.post(`/Bot/${botName}`, { BotConfig: config } as BotUpdateRequest)

/**
 * 删除 Bot
 * @param botNames Bot 名称列表
 */
export const deleteBot = (botNames: string[]): Promise<GenericResponse> =>
  http.delete(`/Bot/${botNames.join(',')}`)

/**
 * 启动 Bot
 * @param botNames Bot 名称列表
 */
export const startBot = (botNames: string[]): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Start`)

/**
 * 停止 Bot
 * @param botNames Bot 名称列表
 */
export const stopBot = (botNames: string[]): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Stop`)

/**
 * 暂停挂卡
 * @param botNames Bot 名称列表
 * @param options 暂停选项
 */
export const pauseBot = (
  botNames: string[],
  options?: BotPauseRequest,
): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Pause`, options ?? {})

/**
 * 恢复挂卡
 * @param botNames Bot 名称列表
 */
export const resumeBot = (botNames: string[]): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Resume`)

/**
 * 重命名 Bot
 * @param oldName 旧名称
 * @param newName 新名称
 */
export const renameBot = (oldName: string, newName: string): Promise<GenericResponse> =>
  http.post(`/Bot/${oldName}/Rename`, { NewName: newName } as BotRenameRequest)

/**
 * Bot 输入（密码、2FA、Steam Guard 等）
 * @param botNames Bot 名称列表
 * @param type 输入类型
 * @param value 输入值
 */
export const inputBot = (
  botNames: string[],
  type: EUserInputType,
  value: string,
): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Input`, { Type: type, Value: value } as BotInputRequest)

/**
 * Bot 2FA 令牌输入
 * @deprecated 使用 inputBot 代替
 */
export const input2FAToken = (botNames: string[], token: string): Promise<GenericResponse> =>
  inputBot(botNames, 5, token)

/**
 * Bot 密码输入
 * @deprecated 使用 inputBot 代替
 */
export const inputPassword = (botNames: string[], password: string): Promise<GenericResponse> =>
  inputBot(botNames, 2, password)

/**
 * Bot Steam Guard 输入
 * @deprecated 使用 inputBot 代替
 */
export const inputSteamGuard = (botNames: string[], code: string): Promise<GenericResponse> =>
  inputBot(botNames, 3, code)

/**
 * Bot SteamParentalCode 输入
 * @deprecated 使用 inputBot 代替
 */
export const inputSteamParentalCode = (botNames: string[], code: string): Promise<GenericResponse> =>
  inputBot(botNames, 4, code)

/**
 * 兑换游戏激活码
 * @param botNames Bot 名称列表
 * @param keys 激活码列表
 * @param appIDs 激活码对应的 AppID（可选）
 */
export const redeemKeys = (
  botNames: string[],
  keys: string[],
  appIDs?: (number | string)[],
): Promise<GenericResponseWithResult<Record<string, string>>> =>
  http.post(`/Bot/${botNames.join(',')}/Redeem`, { Keys: keys, AppIDs: appIDs } as BotRedeemRequest)

/**
 * 后台兑换游戏激活码
 * @param botNames Bot 名称列表
 * @param keys 激活码列表
 */
export const redeemKeysInBackground = (
  botNames: string[],
  keys: string[],
): Promise<GenericResponseWithResult<Record<string, boolean>>> =>
  http.post(`/Bot/${botNames.join(',')}/GamesToRedeemInBackground`, {
    Keys: keys,
  } as BotGamesToRedeemInBackgroundRequest)

/**
 * 添加免费许可证
 * @param botNames Bot 名称列表
 * @param appIDs AppID 列表
 */
export const addLicense = (
  botNames: string[],
  appIDs: (number | string)[],
): Promise<GenericResponseWithResult<Record<string, Bot>>> =>
  http.post(`/Bot/${botNames.join(',')}/AddLicense`, { AppIDs: appIDs } as BotAddLicenseRequest)

/**
 * 移除许可证
 * @param botNames Bot 名称列表
 * @param appIDs AppID 列表
 */
export const removeLicense = (
  botNames: string[],
  appIDs: (number | string)[],
): Promise<GenericResponseWithResult<Record<string, Bot>>> =>
  http.post(`/Bot/${botNames.join(',')}/RemoveLicense`, { AppIDs: appIDs } as BotRemoveLicenseRequest)

/**
 * 获取 Bot 库存
 * @param botNames Bot 名称列表
 */
export const getInventory = (
  botNames: string[],
): Promise<GenericResponseWithResult<Record<string, BotInventoryResponse>>> =>
  http.get(`/Bot/${botNames.join(',')}/Inventory`)

/**
 * 获取指定游戏的库存
 * @param botNames Bot 名称列表
 * @param appID 游戏 AppID
 * @param contextID 上下文 ID（默认为 6，社区物品）
 */
export const getGameInventory = (
  botNames: string[],
  appID: number | string,
  contextID: number | string = '6',
): Promise<GenericResponseWithResult<Record<string, Game[]>>> =>
  http.get(`/Bot/${botNames.join(',')}/Inventory/${appID}/${contextID}`)

/**
 * 兑换点数
 * @param botNames Bot 名称列表
 * @param definitionID 点数定义 ID
 */
export const redeemPoints = (
  botNames: string[],
  definitionID: number | string,
): Promise<GenericResponseWithResult<Record<string, string>>> =>
  http.post(`/Bot/${botNames.join(',')}/RedeemPoints/${definitionID}`)

/**
 * 获取 2FA 确认列表
 * @param botNames Bot 名称列表
 */
export const getTwoFactorConfirmations = (
  botNames: string[],
): Promise<GenericResponseWithResult<Record<string, number[]>>> =>
  http.get(`/Bot/${botNames.join(',')}/TwoFactorAuthentication`)

/**
 * 处理 2FA 确认
 * @param botNames Bot 名称列表
 * @param request 确认请求
 */
export const handleTwoFactorConfirmations = (
  botNames: string[],
  request: TwoFactorAuthenticationConfirmationsRequest,
): Promise<GenericResponseWithResult<Record<string, boolean>>> =>
  http.post(`/Bot/${botNames.join(',')}/TwoFactorAuthentication/Confirmations`, request)

/**
 * 取消 2FA 确认
 * @param botNames Bot 名称列表
 */
export const cancelTwoFactorConfirmations = (
  botNames: string[],
): Promise<GenericResponseWithResult<Record<string, boolean>>> =>
  http.post(`/Bot/${botNames.join(',')}/TwoFactorAuthentication`, {
    AcceptAll: false,
  } as TwoFactorAuthenticationConfirmationsRequest)

/**
 * 生成 2FA 令牌
 * @param botNames Bot 名称列表
 * @param token 令牌字符串
 */
export const generateTwoFactorToken = (
  botNames: string[],
  token: string,
): Promise<GenericResponseWithResult<Record<string, string>>> =>
  http.post(`/Bot/${botNames.join(',')}/TwoFactorAuthentication/Token`, { Token: token })

/**
 * 创建新 Bot
 * 注意：Swagger 文档中没有此 API，保留供兼容
 */
export const createBot = (config: CreateBotConfig): Promise<GenericResponse> =>
  http.post('/Bot/Bot', config)

/**
 * 复制 Bot
 * 注意：Swagger 文档中没有此 API，保留供兼容
 */
export const copyBot = (sourceBot: string, targetBot: string): Promise<GenericResponse> =>
  http.post(`/Bot/${sourceBot}/Copy`, { TargetBot: targetBot })
