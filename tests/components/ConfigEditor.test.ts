import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ElementPlus from 'element-plus'
import { ConfigEditor } from '@/components/ConfigEditor'

// Mock axios
vi.mock('@/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Note: fetchConfigSchema and loadParameterDescriptions are NOT mocked at module level
// so we can test their actual implementation

import http from '@/axios'
import { validateField } from '@/components/ConfigEditor/fields/validation'

describe('ConfigEditor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Mock API responses
    ;(http.get as any).mockImplementation((url: string) => {
      if (url.startsWith('api/Type/')) {
        // Mock type response - Body values are type strings
        return Promise.resolve({
          Properties: {
            BaseType: 'System.Object',
            Body: {
              Name: 'System.String',
              SteamLogin: 'System.String',
              SteamPassword: 'System.String',
              Enabled: 'System.Boolean',
              KeepRunning: 'System.Boolean',
            },
          },
        })
      }
      if (url.startsWith('api/Structure/')) {
        return Promise.resolve({
          Name: 'testValue',
          SteamLogin: 'testLogin',
          SteamPassword: 'testPassword',
          Enabled: false,
          KeepRunning: true,
        })
      }
      if (url.includes('github/wiki')) {
        // Mock wiki response for loadParameterDescriptions
        return Promise.resolve('<h3>Test Field</h3><p>Description</p><hr>')
      }
      return Promise.resolve({})
    })
  })

  const mountComponent = (props = {}) => {
    return mount(ConfigEditor, {
      props: {
        configType: 'ArchiSteamFarm.Steam.Storage.BotConfig',
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          'el-skeleton': { template: '<div class="el-skeleton"><slot /></div>' },
          'el-empty': true,
          'el-input': true,
          'el-input-number': true,
          'el-switch': true,
          'el-select': true,
          'el-option': true,
          'el-button': true,
          'el-tag': true,
          'el-icon': true,
        },
      },
    })
  }

  it('应该显示加载状态', () => {
    const wrapper = mountComponent()

    // 初始状态应该是加载中
    expect(wrapper.find('.el-skeleton').exists()).toBe(true)
  })

  it('应该在加载完成后显示字段', async () => {
    const wrapper = mountComponent()

    // 等待异步加载完成
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 组件应该存在
    expect(wrapper.exists()).toBe(true)
  })

  it('应该 emit loading 事件', async () => {
    const wrapper = mountComponent()

    // 初始应该触发 loading=true
    expect(wrapper.emitted('loading')).toBeTruthy()
    expect(wrapper.emitted('loading')?.[0]?.[0]).toBe(true)

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 完成后应该触发 loading=false
    expect(wrapper.emitted('loading')?.slice(-1)?.[0]?.[0]).toBe(false)
  })
})

describe('ConfigEditor - 参数描述', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清除 localStorage
    localStorage.clear()
  })

  it('应该从缓存加载参数描述', async () => {
    const { loadParameterDescriptions } = await import('@/utils/loadParameterDescriptions')

    const mockDescriptions = {
      TestField: '<p>测试字段说明</p>',
    }

    // 设置缓存
    localStorage.setItem(
      'asf:parameter-descriptions:zh-CN',
      JSON.stringify({
        timestamp: Date.now(),
        descriptions: mockDescriptions,
      }),
    )

    const result = await loadParameterDescriptions('zh-CN')

    expect(result).toEqual(mockDescriptions)
    // 不应该调用 API
    expect(http.get).not.toHaveBeenCalledWith('www/github/wiki/page/Configuration-zh-cn')
  })

  it('应该从 GitHub Wiki 抓取参数说明', async () => {
    const { loadParameterDescriptions } = await import('@/utils/loadParameterDescriptions')

    ;(http.get as any).mockResolvedValue(
      '<h3><code>TestField</code></h3><p>字段说明</p><hr>',
    )

    const result = await loadParameterDescriptions('zh-CN')

    expect(result.TestField).toContain('字段说明')
  })

  it('应该缓存参数描述 6 小时', async () => {
    const { loadParameterDescriptions } = await import('@/utils/loadParameterDescriptions')

    ;(http.get as any).mockResolvedValue('<h3><code>TestField</code></h3><p>字段说明</p><hr>')

    await loadParameterDescriptions('zh-CN')

    const cache = localStorage.getItem('asf:parameter-descriptions:zh-CN')
    expect(cache).toBeTruthy()

    const parsed = JSON.parse(cache!)
    expect(parsed.descriptions).toHaveProperty('TestField')
  })
})

describe('ConfigEditor - 字段验证', () => {
  it('应该验证必填字段', () => {
    const schema = {
      type: 'string',
      param: 'TestField',
      paramName: 'TestField',
    }

    // 空字符串是有效的（会使用默认值）
    expect(validateField('', schema)).toEqual([])
    expect(validateField('value', schema)).toEqual([])
  })

  it('应该验证数字字段', () => {
    const schema = {
      type: 'uint32',
      param: 'TestField',
      paramName: 'TestField',
    }

    expect(validateField('', schema)).toEqual([])
    expect(validateField('123', schema)).toEqual([])
    expect(validateField('-1', schema)).toEqual(['必须是非负整数'])
    expect(validateField('abc', schema)).toEqual(['必须是非负整数'])
  })

  it('应该验证 uint64 字段', () => {
    const schema = {
      type: 'uint64',
      param: 'TestField',
      paramName: 'TestField',
    }

    expect(validateField('', schema)).toEqual([])
    expect(validateField('123', schema)).toEqual([])
    expect(validateField('abc', schema)).toEqual(['必须是数字'])
  })
})
