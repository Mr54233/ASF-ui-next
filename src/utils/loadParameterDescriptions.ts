import http from '@/axios'

// 缓存时长：6小时
const CACHE_DURATION = 6 * 60 * 60 * 1000

interface DescriptionCache {
  timestamp: number
  descriptions: Record<string, string>
}

const cacheKey = (locale: string) => `asf:parameter-descriptions:${locale}`

/**
 * 从本地存储获取缓存
 */
function getCache(locale: string): Record<string, string> | null {
  try {
    const cacheStr = localStorage.getItem(cacheKey(locale))
    if (!cacheStr) return null

    const cache: DescriptionCache = JSON.parse(cacheStr)
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey(locale))
      return null
    }

    return cache.descriptions
  } catch {
    return null
  }
}

/**
 * 保存到本地存储
 */
function setCache(locale: string, descriptions: Record<string, string>): void {
  try {
    const cache: DescriptionCache = {
      timestamp: Date.now(),
      descriptions,
    }
    localStorage.setItem(cacheKey(locale), JSON.stringify(cache))
  } catch {
    // 忽略存储错误
  }
}

/**
 * 获取 Wiki 语言后缀
 */
function getWikiLocale(locale: string): string {
  if (locale === 'en') return ''
  if (locale === 'zh-CN') return '-zh-cn'
  return `-${locale}`
}

/**
 * 获取 Wiki 端点
 */
async function getWikiEndpoint(
  page: string,
  version: string | undefined,
  locale: string,
): Promise<string> {
  const wikiLocale = getWikiLocale(locale)
  const defaultEndpoint = `www/github/wiki/page/${page}${wikiLocale}`

  if (!version) return defaultEndpoint

  try {
    // 获取当前版本
    const currentRelease = await http.get<any>('www/github/release')
    if (version >= currentRelease.Version) return defaultEndpoint

    // 获取历史版本
    const oldRelease = await http.get<any>(`www/github/release/${version}`)
    const nextReleaseTime = new Date(oldRelease.ReleasedAt)
    const wikiHistory = await http.get<Record<string, string>>(
      `www/github/wiki/history/${page}${wikiLocale}`,
    )

    const wikiRevisions = Object.entries(wikiHistory).map(([id, releaseTime]) => ({
      id,
      releaseTime: new Date(releaseTime),
    }))

    wikiRevisions.sort((a, b) => b.releaseTime.getTime() - a.releaseTime.getTime())

    const latestWikiRevision = wikiRevisions.find(
      ({ releaseTime }) => releaseTime < nextReleaseTime,
    )

    return latestWikiRevision
      ? `${defaultEndpoint}?revision=${latestWikiRevision.id}`
      : defaultEndpoint
  } catch {
    // 如果获取版本信息失败，返回默认端点
    return defaultEndpoint
  }
}

/**
 * 简单的 HTML 解析器（从 Wiki 内容提取参数说明）
 */
function parseParameterDescriptions(html: string): Record<string, string> {
  const descriptions: Record<string, string> = {}

  // 简化版解析：查找 h3 中的 code 标签（参数名）
  // 然后取后续内容直到下一个 hr 或 h3
  const h3Regex = /<h3[^>]*>\s*<code[^>]*>([\w.]+)<\/code>/g
  const matches = Array.from(html.matchAll(h3Regex))

  for (let i = 0; i < matches.length; i++) {
    const paramName = matches[i][1]
    const startPos = matches[i].index! + matches[i][0].length

    // 找到下一个 h3 或 hr
    const nextMatch = matches[i + 1]
    const endPos = nextMatch
      ? html.indexOf('<h3', nextMatch.index)
      : html.indexOf('<hr', startPos)

    if (endPos === -1) continue

    // 提取内容
    let content = html.slice(startPos, endPos).trim()

    // 修复链接
    content = content.replace(
      /<a\s+href="([^"]*)"/g,
      '<a href="$1" target="_blank" rel="noreferrer noopener"',
    )

    descriptions[paramName] = content
  }

  return descriptions
}

/**
 * 加载参数描述
 * @param locale 语言代码，如 'zh-CN'
 * @returns 参数说明字典
 */
export async function loadParameterDescriptions(
  locale: string,
): Promise<Record<string, string>> {
  // 检查缓存
  const cached = getCache(locale)
  if (cached) {
    return cached
  }

  try {
    // 获取 Wiki 内容
    const endpoint = await getWikiEndpoint('Configuration', undefined, locale)
    const wikiHtml = await http.get<string>(endpoint)

    // 解析参数说明
    const descriptions = parseParameterDescriptions(wikiHtml)

    // 保存缓存
    setCache(locale, descriptions)

    return descriptions
  } catch (error) {
    console.error('Failed to load parameter descriptions:', error)
    return {}
  }
}
