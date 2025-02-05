import http from '@/axios'

// Fetches common info related to ASF as a whole
export function getASF() {
  return http.get('/Api/ASF')
}
