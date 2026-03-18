import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BotCopyDialog from '@/components/BotCopyDialog.vue'
import { useBotsStore } from '@/stores/bots'
import { BotStatus } from '@/types/bot'
import type { Bot } from '@/types/bot'

// Mock Element Plus
vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('element-plus')>()
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  }
})

// 创建 mock Bot 数据
function createMockBot(overrides: Partial<Bot> = {}): Bot {
  return {
    BotName: 'TestBot',
    Nickname: 'Test Bot',
    s_SteamID: '76561198000000001',
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
    BotConfig: {},
    ...overrides,
  }
}

describe('BotCopyDialog.vue', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('应该正确渲染源 Bot 名称', () => {
    const botsStore = useBotsStore()
    botsStore.bots = { TestBot: createMockBot() }

    const wrapper = mount(BotCopyDialog, {
      props: {
        modelValue: true,
        bot: createMockBot(),
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': {
            template: '<div class="el-dialog"><slot /></div>',
          },
          'el-form': {
            template: '<form><slot /></form>',
          },
          'el-form-item': {
            template: '<div class="el-form-item"><slot /></div>',
          },
          'el-input': {
            template: '<input class="el-input" />',
          },
          'el-alert': {
            template: '<div class="el-alert"><slot /></div>',
          },
          'el-button': {
            template: '<button class="el-button"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('TestBot')
    expect(wrapper.text()).toContain('复制')
  })

  it('form.targetName 初始值为空', () => {
    const wrapper = mount(BotCopyDialog, {
      props: {
        modelValue: true,
        bot: createMockBot(),
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-alert': true,
          'el-button': true,
        },
      },
    })

    expect(wrapper.vm.form.targetName).toBe('')
  })

  it('visible 属性应该正确绑定 modelValue', async () => {
    const wrapper = mount(BotCopyDialog, {
      props: {
        modelValue: true,
        bot: createMockBot(),
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-alert': true,
          'el-button': true,
        },
      },
    })

    expect(wrapper.vm.visible).toBe(true)
  })

  it('sourceBot 属性应该正确返回 bot prop', () => {
    const mockBot = createMockBot()
    const wrapper = mount(BotCopyDialog, {
      props: {
        modelValue: true,
        bot: mockBot,
      },
      global: {
        plugins: [pinia],
        stubs: {
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-alert': true,
          'el-button': true,
        },
      },
    })

    expect(wrapper.vm.sourceBot).toEqual(mockBot)
  })
})
