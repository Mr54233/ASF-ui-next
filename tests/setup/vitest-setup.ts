// Mock CSS imports
global.__VUE_OPTIONS_API__ = true
global.__VUE_PROD_DEVTOOLS__ = false

// Mock Element Plus styles
vi.mock('element-plus/theme-chalk/base.css', () => ({}))
