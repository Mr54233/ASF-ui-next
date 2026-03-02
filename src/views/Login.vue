<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">ASF</div>
        <div class="version">ArchiSteamFarm UI</div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <!-- ASF 地址 -->
        <el-form-item label="ASF 地址" prop="host">
          <el-input
            v-model="form.host"
            placeholder="localhost"
            :prefix-icon="Connection"
            clearable
          />
        </el-form-item>

        <!-- 端口 -->
        <el-form-item label="端口" prop="port">
          <el-input-number
            v-model="form.port"
            :min="1"
            :max="65535"
            controls-position="right"
            class="full-width"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="IPC 密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="输入 IPC 密码"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 记住我 -->
        <el-form-item>
          <el-checkbox v-model="form.remember"> 记住登录信息 </el-checkbox>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-btn">
            登录
          </el-button>
        </el-form-item>

        <!-- 测试连接 -->
        <el-form-item>
          <el-button :loading="testing" @click="handleTestConnection" link> 测试连接 </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部提示 -->
      <div class="login-footer">
        <el-text size="small" type="info"> 首次使用？请确保 ASF IPC 接口已启用 </el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Connection, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const testing = ref(false)

const form = reactive({
  host: 'localhost',
  port: 1242,
  password: '',
  remember: true,
})

// 表单验证规则
const rules: FormRules = {
  host: [
    { required: true, message: '请输入 ASF 地址', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9.-]+$/,
      message: '地址格式不正确',
      trigger: 'blur',
    },
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      max: 65535,
      message: '端口范围 1-65535',
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: '请输入 IPC 密码', trigger: 'blur' }],
}

// 登录
async function handleLogin() {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    loading.value = true
    const result = await authStore.login(form.host, form.port, form.password)

    if (result.success) {
      ElMessage.success('登录成功')
      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

// 测试连接
async function handleTestConnection() {
  testing.value = true
  try {
    const result = await authStore.testConnection(form.host, form.port)
    if (result.Success) {
      ElMessage.success('连接成功')
    } else {
      ElMessage.error(result.Message || '连接失败')
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
    console.error('Test connection error:', error)
  } finally {
    testing.value = false
  }
}

// 组件挂载时，如果有已保存的登录信息，自动填充
if (authStore.authenticated && authStore.ipcHost) {
  form.host = authStore.ipcHost
  form.port = authStore.ipcPort
}
</script>

<style scoped lang="less">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #141414 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: #1d1e1f;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid #2b2b2c;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #409eff, #79bbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.version {
  color: #8d9095;
  font-size: 14px;
}

// 表单
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

  &:hover {
    border-color: #666;
  }

  &:focus {
    border-color: #409eff;
  }
}

:deep(.el-input-number) {
  width: 100%;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #2b2b2c;
}

// 响应式
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }

  .logo {
    font-size: 40px;
  }

  .login-btn {
    height: 44px;
  }
}
</style>
