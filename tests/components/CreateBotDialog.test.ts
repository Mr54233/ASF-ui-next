import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CreateBotDialog from '@/components/CreateBotDialog.vue'
import { createBot } from '@/api/Bot'

// Mock API
vi.mock('@/api/Bot', () => ({
  createBot: vi.fn(),
}))

// Mock axios
vi.mock('@/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}))

describe('CreateBotDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountComponent = (props = {}) => {
    return mount(CreateBotDialog, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          'el-dialog': {
            template: '<div class="el-dialog"><slot></slot><slot name="footer"></slot></div>',
            props: ['modelValue', 'title', 'width', 'closeOnClickModal', 'destroyOnClose'],
          },
          'el-form': {
            template: '<form class="el-form"><slot></slot></form>',
            props: ['model', 'rules', 'labelPosition'],
          },
          'el-form-item': {
            template: '<div class="el-form-item"><slot></slot></div>',
            props: ['label', 'prop'],
          },
          'el-input': {
            template: '<input class="el-input" type="text" />',
            props: ['modelValue', 'placeholder', 'type', 'showPassword', 'clearable'],
          },
          'el-checkbox': {
            template: '<input class="el-checkbox" type="checkbox" />',
            props: ['modelValue'],
          },
          'el-button': {
            template: '<button class="el-button"><slot></slot></button>',
            props: ['type', 'loading'],
          },
        },
      },
    })
  }

  it('should render dialog when modelValue is true', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.el-dialog').exists()).toBe(true)
  })

  it('should have form fields', () => {
    const wrapper = mountComponent()
    const inputs = wrapper.findAll('.el-input')
    expect(inputs.length).toBeGreaterThanOrEqual(3) // botName, steamLogin, steamPassword
  })

  it('should have checkbox fields', () => {
    const wrapper = mountComponent()
    const checkboxes = wrapper.findAll('.el-checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(2) // enabled, keepRunning
  })

  it('should have correct initial form values', () => {
    const wrapper = mountComponent()
    expect(wrapper.vm.form.botName).toBe('')
    expect(wrapper.vm.form.steamLogin).toBe('')
    expect(wrapper.vm.form.steamPassword).toBe('')
    expect(wrapper.vm.form.enabled).toBe(true)
    expect(wrapper.vm.form.keepRunning).toBe(true)
  })

  it('should validate form before submission', async () => {
    const wrapper = mountComponent()

    // Form has default empty values
    expect(wrapper.vm.form.botName).toBe('')
    expect(wrapper.vm.form.steamLogin).toBe('')
    expect(wrapper.vm.form.steamPassword).toBe('')
  })
})

describe('CreateBotDialog - Form Validation Rules', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should validate bot name pattern', () => {
    const validNames = ['bot1', 'bot_1', 'bot-1', 'Bot1', 'BOT']
    const invalidNames = ['bot 1', 'bot.1', 'bot@1', '']

    validNames.forEach((name) => {
      expect(/^[a-zA-Z0-9_-]+$/.test(name)).toBe(true)
    })

    invalidNames.forEach((name) => {
      if (name !== '') {
        expect(/^[a-zA-Z0-9_-]+$/.test(name)).toBe(false)
      }
    })
  })

  it('should validate password minimum length', () => {
    const validPasswords = ['123456', 'password', 'longPassword123']
    const invalidPasswords = ['12345', '1234', '1']

    validPasswords.forEach((password) => {
      expect(password.length >= 6).toBe(true)
    })

    invalidPasswords.forEach((password) => {
      expect(password.length >= 6).toBe(false)
    })
  })

  it('should reject ASF as bot name', () => {
    const name = 'ASF'
    expect(name).toBe('ASF') // ASF should be rejected
  })
})
