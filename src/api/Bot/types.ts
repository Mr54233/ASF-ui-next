/**
 * API 层 Bot 类型导出
 * 统一使用 @/types/bot 和 @/types/common 中的类型定义
 */

// 从 @/types/bot 重新导出所有类型
export * from '@/types/bot'

// 从 @/types/common 重新导出通用类型
export * from '@/types/common'

// API 层特有的请求类型
export type {
  BotUpdateRequest,
  BotPauseRequest,
  BotInputRequest,
  BotRenameRequest,
  BotRedeemRequest,
  BotGamesToRedeemInBackgroundRequest,
  BotAddLicenseRequest,
  BotRemoveLicenseRequest,
  TwoFactorAuthenticationConfirmationsRequest,
  BotInventoryResponse,
} from './index'
