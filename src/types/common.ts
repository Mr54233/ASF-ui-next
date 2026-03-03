/**
 * ASF IPC 通用响应类型（无 Result）
 * 用于不需要返回数据的操作（如删除、更新等）
 */
export interface GenericResponse {
  /**
   * A message that describes what happened with the request, if available.
   * This property will provide exact reason for majority of expected failures
   */
  Message?: string | null

  /**
   * Boolean type that specifies if the request has succeeded
   */
  Success: boolean
}

/**
 * ASF IPC 带结果响应类型
 * 用于需要返回数据的操作
 */
export interface GenericResponseWithResult<T> {
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
export type EncryptResponse = GenericResponseWithResult<string>

/**
 * 哈希响应
 */
export type HashResponse = GenericResponseWithResult<string>

/**
 * 命令响应
 */
export type CommandResponse = GenericResponseWithResult<string>

/**
 * 字符串结果响应
 */
export type StringResponse = GenericResponseWithResult<string>

/**
 * @deprecated 使用 GenericResponse 代替
 */
export type EmptyResponse = GenericResponse
