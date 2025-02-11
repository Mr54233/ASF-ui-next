/**
 * ArchiSteamFarm.IPC.Responses.GenericResponse`1[System.String]
 */
export interface EncryptResponse {
  /**
   * A message that describes what happened with the request, if available. This property will
   * provide exact reason for majority of expected failures
   */
  Message?: null | string
  /**
   * The actual result of the request, if available. The type of the result depends on the API
   * endpoint that you've called
   */
  Result?: null | string
  /**
   * Boolean type that specifies if the request has succeeded
   */
  Success: boolean
}
