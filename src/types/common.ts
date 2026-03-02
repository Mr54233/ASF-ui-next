/**
 * ASF IPC 通用响应类型
 */
export interface GenericResponse<T = unknown> {
  /**
   * A message that describes what happened with the request, if available.
   * This property will provide exact reason for majority of expected failures
   */
  Message?: string | null

  /**
   * The actual result of the request, if available.
   * The type of the result depends on the API endpoint that you've called
   */
  Result?: T | null

  /**
   * Boolean type that specifies if the request has succeeded
   */
  Success: boolean
}

/**
 * 加密响应
 */
export type EncryptResponse = GenericResponse<string>

/**
 * 哈希响应
 */
export type HashResponse = GenericResponse<string>

/**
 * 命令响应
 */
export type CommandResponse = GenericResponse<string>
