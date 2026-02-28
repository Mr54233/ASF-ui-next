import http from '@/axios'
import type {
  EncryptResponse,
  HashResponse,
  GenericResponse,
  ASFInfo,
  ASFGlobalConfig,
} from './types'
import type { Bot } from '@/types/bot'

/**
 * 加密数据（使用 ASF 加密机制）
 */
export const encryptASF = (data: string): Promise<EncryptResponse> =>
  http.post('/ASF/Encrypt', { data })

/**
 * 哈希数据（使用 ASF 哈希机制）
 */
export const hashASF = (data: string): Promise<HashResponse> =>
  http.post('/ASF/Hash', { data })

/**
 * 获取 ASF 全局信息
 */
export const getASF = (): Promise<ASFInfo> => http.get('/ASF')

/**
 * 更新 ASF 全局配置
 */
export const updateASFConfig = (
  config: Partial<ASFGlobalConfig>
): Promise<GenericResponse<boolean>> => http.post('/ASF', config)

/**
 * 重启 ASF
 */
export const restartASF = (): Promise<GenericResponse<boolean>> =>
  http.post('/ASF/Restart')

/**
 * 关闭 ASF
 */
export const shutdownASF = (): Promise<GenericResponse<boolean>> =>
  http.post('/ASF/Exit')

/**
 * 更新 ASF 到最新版本
 */
export const updateASF = (): Promise<GenericResponse<boolean>> =>
  http.post('/ASF/Update')

/**
 * 获取所有 Bot（快捷方式）
 */
export const getAllBots = (): Promise<Record<string, Bot>> => http.get('/Bot/asf')

/**
 * 获取 ASF 版本信息
 */
export const getASFVersion = (): Promise<{ Version: string; Updated: string }> =>
  http.get('/ASF/Version')
