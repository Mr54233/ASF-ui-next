import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Bots from '@/views/Bots.vue'
import { useBotsStore } from '@/stores/bots'
import { BotStatus } from '@/types/bot'
import type { Bot } from '@/types/bot'

// Mock API
vi.mock('@/api/Bot', () => ({
  renameBot: vi.fn(),
  deleteBot: vi.fn(),
}))

// Mock Element Plus - 只 mock 特定方法
vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('element-plus')>()
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
    ElMessageBox: {
      confirm: vi.fn(),
    },
  }
})

// 创建 mock Bot 数据
function createMockBot(overrides: Partial<Bot> = {}): Bot {
  return {
    BotName: 'TestBot',
    Nickname: 'Test Bot',
    s_SteamID: '76561198000000001',
    AvatarHash: '0000000000000000000000000000000000000000',
    Status: BotStatus.ONLINE,
    IsConnectedAndLoggedOn: true,
    HasMobileAuthenticator: true,
    KeepRunning: true,
    WalletBalance: 0,
    WalletBalanceDelayed: 0,
    GamesToRedeemInBackgroundCount: 0,
    CardsFarmer: {
      Paused: false,
      NowFarming: false,
      TimeRemaining: '00:00:00',
      GamesToFarm: [],
      CurrentGamesFarming: [],
    },
    BotConfig: {
      SteamLogin: 'testuser',
    },
    ...overrides,
  }
}

describe('Bots.vue', () => {
  let router: ReturnType<typeof createRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/bots', component: Bots },
      ],
    })

    vi.clearAllMocks()
  })

  it('应该渲染 Bot 列表', async () => {
    const botsStore = useBotsStore()

    // 设置 mock 数据
    botsStore.bots = {
      TestBot1: createMockBot({ BotName: 'TestBot1', Nickname: 'Bot 1' }),
      TestBot2: createMockBot({ BotName: 'TestBot2', Nickname: 'Bot 2' }),
    }

    const wrapper = mount(Bots, {
      global: {
        plugins: [pinia, router],
        stubs: {
          BotDetailDialog: true,
          CreateBotDialog: true,
          BotConfigDialog: true,
          Bot2FADialog: true,
          BGRDialog: true,
        },
      },
    })

    // 检查是否渲染了两个 Bot 卡片
    const cards = wrapper.findAll('.bot-card')
    expect(cards.length).toBe(2)
  })

  it('应该显示 Bot 数量统计', async () => {
    const botsStore = useBotsStore()

    botsStore.bots = {
      TestBot1: createMockBot({ BotName: 'TestBot1' }),
      TestBot2: createMockBot({ BotName: 'TestBot2' }),
      TestBot3: createMockBot({ BotName: 'TestBot3' }),
    }

    const wrapper = mount(Bots, {
      global: {
        plugins: [pinia, router],
        stubs: {
          BotDetailDialog: true,
          CreateBotDialog: true,
          BotConfigDialog: true,
          Bot2FADialog: true,
          BGRDialog: true,
        },
      },
    })

    expect(wrapper.text()).toContain('3 个 Bot')
  })

  it('应该显示空状态', async () => {
    const botsStore = useBotsStore()

    botsStore.bots = {}

    const wrapper = mount(Bots, {
      global: {
        plugins: [pinia, router],
        stubs: {
          BotDetailDialog: true,
          CreateBotDialog: true,
          BotConfigDialog: true,
          Bot2FADialog: true,
          BGRDialog: true,
          ElEmpty: true,
        },
      },
    })

    expect(wrapper.findComponent({ name: 'ElEmpty' }).exists()).toBe(true)
  })

  it('快捷按钮应该有中文标签', async () => {
    const botsStore = useBotsStore()

    botsStore.bots = {
      TestBot1: createMockBot({ BotName: 'TestBot1' }),
    }

    const wrapper = mount(Bots, {
      global: {
        plugins: [pinia, router],
        stubs: {
          BotDetailDialog: true,
          CreateBotDialog: true,
          BotConfigDialog: true,
          Bot2FADialog: true,
          BGRDialog: true,
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('双重验证')
    expect(text).toContain('后台兑换')
    expect(text).toContain('配置')
    expect(text).toContain('暂停')
  })

  it('filteredBots 应该正确过滤', async () => {
    const botsStore = useBotsStore()

    botsStore.bots = {
      TestBot1: createMockBot({ BotName: 'TestBot1', Nickname: 'Alpha Bot' }),
      TestBot2: createMockBot({ BotName: 'TestBot2', Nickname: 'Beta Bot' }),
    }

    const wrapper = mount(Bots, {
      global: {
        plugins: [pinia, router],
        stubs: {
          BotDetailDialog: true,
          CreateBotDialog: true,
          BotConfigDialog: true,
          Bot2FADialog: true,
          BGRDialog: true,
        },
      },
    })

    // 初始应该显示两个卡片
    expect(wrapper.vm.filteredBots.length).toBe(2)

    // 设置搜索关键词
    wrapper.vm.searchQuery = 'Alpha'
    await wrapper.vm.$nextTick()

    // 应该只显示一个
    expect(wrapper.vm.filteredBots.length).toBe(1)
    expect(wrapper.vm.filteredBots[0].BotName).toBe('TestBot1')
  })

  it('filteredBots 应该支持状态筛选', async () => {
    const botsStore = useBotsStore()

    botsStore.bots = {
      TestBot1: createMockBot({ BotName: 'TestBot1', Status: BotStatus.ONLINE }),
      TestBot2: createMockBot({ BotName: 'TestBot2', Status: BotStatus.OFFLINE }),
    }

    const wrapper = mount(Bots, {
      global: {
        plugins: [pinia, router],
        stubs: {
          BotDetailDialog: true,
          CreateBotDialog: true,
          BotConfigDialog: true,
          Bot2FADialog: true,
          BGRDialog: true,
        },
      },
    })

    // 初始应该显示两个
    expect(wrapper.vm.filteredBots.length).toBe(2)

    // 设置状态筛选
    wrapper.vm.filterStatus = BotStatus.OFFLINE
    await wrapper.vm.$nextTick()

    // 应该只显示一个
    expect(wrapper.vm.filteredBots.length).toBe(1)
    expect(wrapper.vm.filteredBots[0].BotName).toBe('TestBot2')
  })

  it('点击卡片区域应该打开详情弹窗', async () => {
    const botsStore = useBotsStore()

    const mockBot = createMockBot({ BotName: 'TestBot1' })
    botsStore.bots = { TestBot1: mockBot }

    const wrapper = mount(Bots, {
      global: {
        plugins: [pinia, router],
        stubs: {
          BotDetailDialog: true,
          CreateBotDialog: true,
          BotConfigDialog: true,
          Bot2FADialog: true,
          BGRDialog: true,
        },
      },
    })

    // 点击卡片内容区域
    const cardContent = wrapper.find('.bot-card > div')
    await cardContent.trigger('click')

    // 应该设置 selectedBot 并显示弹窗
    expect(wrapper.vm.selectedBot).toEqual(mockBot)
    expect(wrapper.vm.showDetailDialog).toBe(true)
  })
})
