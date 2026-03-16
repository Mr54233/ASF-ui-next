import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['./tests/setup/vitest-setup.ts'],
      // 关键配置：将 element-plus 内联处理，避免 CSS 导入错误
      server: {
        deps: {
          inline: ['element-plus', '@element-plus/icons-vue'],
        },
      },
    },
  }),
)
