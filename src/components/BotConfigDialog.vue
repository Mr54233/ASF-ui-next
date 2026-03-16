<template>
  <el-dialog
    v-model="visible"
    :title="`编辑配置 - ${bot?.BotName || ''}`"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
    @open="handleOpen"
  >
    <div v-loading="loading" class="bot-config-dialog">
      <ConfigEditor
        v-if="bot && !loading"
        :config-type="configType"
        :bot-name="bot.BotName"
        :model-value="configModel"
        :delete-default-values="false"
        :extended-fields="extendedFields"
        @update:model-value="handleConfigChange"
        @loading="handleLoading"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false" :disabled="saving">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ConfigEditor, type ConfigCategory } from '@/components/ConfigEditor'
import { getBot, updateBot } from '@/api/Bot'
import type { Bot } from '@/types/bot'
import type { FieldType } from '@/utils/fetchConfigSchema'

interface Props {
  modelValue: boolean
  bot: Bot | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', bot: Bot): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 配置类型
const configType = 'ArchiSteamFarm.Steam.Storage.BotConfig'

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 配置数据模型
const configModel = ref<Record<string, any>>({})

// 扩展字段（用于敏感字段占位符）
const extendedFields: Record<string, Partial<FieldType>> = {
  SteamLogin: {
    placeholder: '保持不变',
    description: 'Steam 登录名（留空保持不变）',
  },
  SteamPassword: {
    placeholder: '保持不变',
    description: 'Steam 密码（留空保持不变）',
  },
  SteamParentalCode: {
    placeholder: '保持不变',
    description: 'Steam 家长控制代码（留空保持不变）',
  },
}

// 打开弹窗时加载配置
async function handleOpen() {
  if (!props.bot) return

  loading.value = true
  try {
    // 获取 Bot 完整配置
    const botData = await getBot(props.bot.BotName)

    // BotConfig 包含所有配置项
    if (botData.BotConfig) {
      configModel.value = { ...botData.BotConfig }
    } else {
      configModel.value = {}
    }
  } catch (error) {
    console.error('Failed to load bot config:', error)
    ElMessage.error(error instanceof Error ? error.message : '加载配置失败')
  } finally {
    loading.value = false
  }
}

// 配置变化
function handleConfigChange(value: Record<string, any>) {
  configModel.value = value
}

// ConfigEditor 加载状态
function handleLoading(isLoading: boolean) {
  loading.value = isLoading
}

// 保存配置
async function handleSave() {
  if (!props.bot) return

  // 过滤掉占位符值
  const configToSave = filterPlaceholderValues(configModel.value)

  // 验证至少有一些变化
  if (Object.keys(configToSave).length === 0) {
    ElMessage.warning('配置未修改')
    return
  }

  saving.value = true
  try {
    // 调用更新 API
    const result = await updateBot(props.bot.BotName, configToSave)

    // 检查结果
    const botResult = result[props.bot.BotName]
    if (botResult) {
      ElMessage.success(`Bot "${props.bot.BotName}" 配置已保存`)
      emit('saved', props.bot)
      visible.value = false
    } else {
      ElMessage.error('保存配置失败，请检查输入')
    }
  } catch (error) {
    console.error('Failed to save bot config:', error)
    ElMessage.error(error instanceof Error ? error.message : '保存配置失败')
  } finally {
    saving.value = false
  }
}

/**
 * 过滤掉占位符值
 * 敏感字段如果值为 "保持不变" 或空，则不包含在保存请求中
 */
function filterPlaceholderValues(config: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {}
  const sensitiveFields = ['SteamLogin', 'SteamPassword', 'SteamParentalCode']
  const placeholderValues = ['保持不变', '', null, undefined]

  for (const [key, value] of Object.entries(config)) {
    // 敏感字段：只有非占位符值才保存
    if (sensitiveFields.includes(key)) {
      if (!placeholderValues.includes(value)) {
        filtered[key] = value
      }
    } else {
      // 非敏感字段：全部保存
      filtered[key] = value
    }
  }

  return filtered
}
</script>

<style scoped lang="less">
.bot-config-dialog {
  min-height: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
