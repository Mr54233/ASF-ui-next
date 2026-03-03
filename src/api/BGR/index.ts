import http from '@/axios'
import type { BGRStatus, BGRAddResponse } from '@/types/asf'
import type { GenericResponse, GenericResponseWithResult } from '@/types/common'

/**
 * 获取 BGR 状态
 * @param botNames Bot 名称列表
 */
export const getBGRStatus = (botNames: string[]): Promise<BGRStatus> =>
  http.get(`/Bot/${botNames.join(',')}/BGR`)

/**
 * 添加兑换 Key
 * @param botNames Bot 名称列表
 * @param keys Key 列表或单个 Key
 * @param options 额外选项
 */
export const addKeysToBGR = (
  botNames: string[],
  keys: string | string[],
  options?: { botName?: string; type?: string },
): Promise<BGRAddResponse[]> =>
  http.post(`/Bot/${botNames.join(',')}/BGR/Add`, {
    Keys: Array.isArray(keys) ? keys : [keys],
    ...options,
  })

/**
 * 清空 BGR 队列
 * @param botNames Bot 名称列表
 */
export const clearBGRQueue = (botNames: string[]): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/BGR/Clear`)

/**
 * 删除 BGR 中的 Key
 * @param botNames Bot 名称列表
 * @param keys Key 列表
 */
export const deleteKeysFromBGR = (
  botNames: string[],
  keys: string[],
): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/BGR/Delete`, { Keys: keys })

/**
 * 重置 BGR 状态
 * @param botNames Bot 名称列表
 */
export const resetBGRStatus = (botNames: string[]): Promise<GenericResponse> =>
  http.post(`/Bot/${botNames.join(',')}/BGR/Reset`)
