<template>
  <el-dialog
    v-model="visible"
    title="复制 Bot"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div v-if="sourceBot" class="bot-copy-form">
      <p class="copy-description">
        将 <strong>{{ sourceBot.BotName }}</strong> 的配置复制到新 Bot
      </p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="新 Bot 名称" prop="targetName">
          <el-input
            v-model="form.targetName"
            placeholder="输入新 Bot 的名称"
            clearable
            @keyup.enter="handleCopy"
          />
        </el-form-item>
      </el-form>

      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>
          新 Bot 将继承源 Bot 的所有配置（Steam 登录名和密码需要重新设置）
        </template>
      </el-alert>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="copying" @click="handleCopy">
          复制
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { copyBot } from '@/api/Bot'
import { useBotsStore } from '@/stores/bots'
import type { Bot } from '@/types/bot'

interface Props {
  modelValue: boolean
  bot: Bot | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', botName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const botsStore = useBotsStore()

const formRef = ref<FormInstance>()
const copying = ref(false)

const form = reactive({
  targetName: '',
})

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const sourceBot = computed(() => props.bot)

// 验证规则
const rules: FormRules = {
  targetName: [
    { required: true, message: '请输入新 Bot 名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度应在 1-50 个字符之间', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === 'ASF') {
          callback(new Error('Bot 名称不能为 ASF'))
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          callback(new Error('名称只能包含字母、数字、下划线、短横线'))
        } else if (botsStore.botsList.some(bot => bot.BotName === value)) {
          callback(new Error(`Bot "${value}" 已存在`))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 重置表单
watch(visible, (val) => {
  if (val) {
    form.targetName = ''
    formRef.value?.clearValidate()
  }
})

// 处理复制
async function handleCopy() {
  if (!formRef.value || !sourceBot.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const sourceName = sourceBot.value.BotName ?? sourceBot.value.s_SteamID ?? ''
  const targetName = form.targetName.trim()

  if (!sourceName) {
    ElMessage.error('源 Bot 名称无效')
    return
  }

  copying.value = true

  try {
    const result = await copyBot(sourceName, targetName)

    if (result.Success) {
      ElMessage.success(`Bot "${targetName}" 复制成功`)
      // 刷新 Bot 列表
      await botsStore.fetchBots()
      emit('success', targetName)
      visible.value = false
    } else {
      ElMessage.error(result.Message || '复制失败')
    }
  } catch (error) {
    console.error('Copy bot error:', error)
    ElMessage.error(error instanceof Error ? error.message : '复制失败')
  } finally {
    copying.value = false
  }
}
</script>

<style scoped lang="less">
.bot-copy-form {
  .copy-description {
    text-align: center;
    margin-bottom: 20px;
    color: var(--el-text-color-regular);

    strong {
      color: var(--el-color-primary);
    }
  }

  :deep(.el-alert) {
    margin-top: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
