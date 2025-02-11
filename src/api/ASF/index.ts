import http from '@/axios'
import type { EncryptResponse } from './types'

// Encrypts data with ASF encryption mechanisms using provided details.
export const EncryptASF = (data: string): Promise<EncryptResponse> =>
  http.post('/ASF/Encrypt', { data })

// Fetches common info related to ASF as a whole
export const getASF = () => http.get('/ASF')

// Updates ASF's global config
export const updateASFConfig = () => http.post('/ASF')

// Hashes data with ASF hashing mechanisms using provided details
export const hashASF = () => http.post('/ASF/Hash')

// Makes ASF shutdown itself
export const shutdownASF = () => http.post('/ASF/Exit')

// Makes ASF restart itself
export const restartASF = () => http.post('/ASF/Restart')

// Makes ASF update itself
export const updateASF = () => http.post('/ASF/Update')
