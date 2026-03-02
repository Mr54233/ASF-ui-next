import http from '@/axios'
import type { BotsResponse, BotActionResponse, CreateBotConfig } from './types'
import type { Bot } from '@/types/bot'
import type { GenericResponse } from '@/types/common'

/**
 * 获取所有 Bot 信息
 * @param botNames Bot 名称列表，不传则获取所有
 */
export const getBots = (botNames?: string[]): Promise<BotsResponse> =>
  http.get(`/Bot/${botNames?.join(',') ?? 'asf'}`)

/**
 * 获取单个 Bot 信息
 */
export const getBot = (botName: string): Promise<Bot> => http.get(`/Bot/${botName}`)

/**
 * 更新 Bot 配置
 */
export const updateBot = (
  botName: string,
  config: Partial<Record<string, unknown>>,
): Promise<BotActionResponse> => http.post(`/Bot/${botName}`, config)

/**
 * 删除 Bot
 */
export const deleteBot = (botNames: string[]): Promise<BotActionResponse> =>
  http.delete(`/Bot/${botNames.join(',')}`)

/**
 * 启动 Bot
 */
export const startBot = (botNames: string[]): Promise<BotActionResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Start`)

/**
 * 停止 Bot
 */
export const stopBot = (botNames: string[]): Promise<BotActionResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Stop`)

/**
 * 暂停挂卡
 * @param botNames Bot 名称列表
 * @param options 暂停选项
 * @param options.permanent 是否永久暂停
 * @param options.resumeInSeconds 多少秒后恢复（0 表示永久）
 */
export const pauseBot = (
  botNames: string[],
  options?: { permanent?: boolean; resumeInSeconds?: number },
): Promise<BotActionResponse> => http.post(`/Bot/${botNames.join(',')}/Pause`, options)

/**
 * 恢复挂卡
 */
export const resumeBot = (botNames: string[]): Promise<BotActionResponse> =>
  http.post(`/Bot/${botNames.join(',')}/Resume`)

/**
 * 复制 Bot
 */
export const copyBot = (sourceBot: string, targetBot: string): Promise<GenericResponse<boolean>> =>
  http.post(`/Bot/${sourceBot}/Copy`, { TargetBot: targetBot })

/**
 * 重命名 Bot
 */
export const renameBot = (oldName: string, newName: string): Promise<BotActionResponse> =>
  http.post(`/Bot/${oldName}/Rename`, { NewBotName: newName })

/**
 * 创建新 Bot
 */
export const createBot = (config: CreateBotConfig): Promise<BotActionResponse> =>
  http.post('/Bot/Bot', config)

/**
 * Bot 2FA 令牌输入
 */
export const input2FAToken = (botName: string, token: string): Promise<BotActionResponse> =>
  http.post(`/Bot/${botName}/2FA`, { Token: token })

/**
 * Bot 密码输入
 */
export const inputPassword = (botName: string, password: string): Promise<BotActionResponse> =>
  http.post(`/Bot/${botName}/Password`, { Password: password })

/**
 * Bot Steam Guard 输入
 */
export const inputSteamGuard = (botName: string, code: string): Promise<BotActionResponse> =>
  http.post(`/Bot/${botName}/SteamGuard`, { Code: code })

/**
 * Bot DeviceID 输入
 */
export const inputDeviceID = (botName: string, deviceID: string): Promise<BotActionResponse> =>
  http.post(`/Bot/${botName}/DeviceID`, { DeviceID: deviceID })

/**
 * Bot SteamParentalCode 输入
 */
export const inputSteamParentalCode = (botName: string, code: string): Promise<BotActionResponse> =>
  http.post(`/Bot/${botName}/SteamParentalCode`, { Code: code })
