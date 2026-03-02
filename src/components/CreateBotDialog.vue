<template>
  <el-dialog
    v-model="visible"
    title="创建 Bot"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <!-- Bot 名称 -->
      <el-form-item label="Bot 名称" prop="botName">
        <el-input v-model="form.botName" placeholder="输入 Bot 名称（例如：bot1）" clearable />
      </el-form-item>

      <!-- Steam 登录 -->
      <el-form-item label="Steam 登录" prop="steamLogin">
        <el-input v-model="form.steamLogin" placeholder="输入 Steam 登录名" clearable />
      </el-form-item>

      <!-- Steam 密码 -->
      <el-form-item label="Steam 密码" prop="steamPassword">
        <el-input
          v-model="form.steamPassword"
          type="password"
          placeholder="输入 Steam 密码"
          show-password
          clearable
        />
      </el-form-item>

      <!-- 启用 -->
      <el-form-item>
        <el-checkbox v-model="form.enabled"> 立即启动 Bot </el-checkbox>
      </el-form-item>

      <!-- 保持运行 -->
      <el-form-item>
        <el-checkbox v-model="form.keepRunning"> 保持运行（KeepRunning） </el-checkbox>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleCreate"> 创建 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { CreateBotConfig } from '@/types/bot'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', bot: CreateBotConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  botName: '',
  steamLogin: '',
  steamPassword: '',
  enabled: true,
  keepRunning: true,
})

// 表单验证规则
const rules: FormRules = {
  botName: [
    { required: true, message: '请输入 Bot 名称', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: '名称只能包含字母、数字、下划线、短横线',
      trigger: 'blur',
    },
  ],
  steamLogin: [{ required: true, message: '请输入 Steam 登录名', trigger: 'blur' }],
  steamPassword: [
    { required: true, message: '请输入 Steam 密码', trigger: 'blur' },
    {
      min: 6,
      message: '密码至少 6 个字符',
      trigger: 'blur',
    },
  ],
}

// 创建 Bot
async function handleCreate() {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    loading.value = true

    // TODO: 调用创建 API
    // const result = await createBot({
    //   BotName: form.botName,
    //   SteamLogin: form.steamLogin,
    //   SteamPassword: form.steamPassword,
    //   Enabled: form.enabled,
    //   KeepRunning: form.keepRunning,
    // })

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    emit('success', {
      BotName: form.botName,
      SteamLogin: form.steamLogin,
      SteamPassword: form.steamPassword,
      Enabled: form.enabled,
      KeepRunning: form.keepRunning,
    } as CreateBotConfig)

    ElMessage.success(`Bot "${form.botName}" 创建成功`)
    visible.value = false

    // 重置表单
    formRef.value?.resetFields()
  } catch (error) {
    console.error('Create bot error:', error)
    ElMessage.error('创建 Bot 失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  color: #cfd3dc;
}

:deep(.el-input__inner) {
  background-color: #262727;
  border-color: #4c4d4f;
  color: #e5eaf3;

  &::placeholder {
    color: #8d9095;
  }
}
</style>
