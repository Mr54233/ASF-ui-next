<template>
  <div class="config-page">
    <div class="config-header">
      <h2>ASF 配置</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Check" @click="handleSave" :loading="saving">
          保存
        </el-button>
        <el-button :icon="RefreshRight" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <el-card class="config-card" shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全局配置" name="global">
          <el-form :model="globalConfig" label-position="top">
            <el-form-item label="IPC 密码">
              <el-input v-model="globalConfig.IPCPassword" show-password />
            </el-form-item>

            <el-form-item label="绑定地址">
              <el-input v-model="globalConfig.IPCHostname" />
            </el-form-item>

            <el-form-item label="端口">
              <el-input-number v-model="globalConfig.IPCPort" :min="1" :max="65535" />
            </el-form-item>

            <el-form-item label="Web 界面">
              <el-switch v-model="globalConfig.WebLobbyEnabled" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Bot 配置" name="bot">
          <el-select v-model="selectedBot" placeholder="选择 Bot" style="width: 200px; margin-bottom: 16px;">
            <el-option
              v-for="bot in botsStore.botsList"
              :key="bot.BotName"
              :label="bot.Nickname"
              :value="bot.BotName"
            />
          </el-select>

          <el-form v-if="selectedBot" :model="botConfig" label-position="top">
            <el-form-item label="启用">
              <el-switch v-model="botConfig.Enabled" />
            </el-form-item>

            <el-form-item label="保持运行">
              <el-switch v-model="botConfig.KeepRunning" />
            </el-form-item>

            <el-form-item label="Steam 登录">
              <el-input v-model="botConfig.SteamLogin" />
            </el-form-item>

            <el-form-item label="Steam 密码">
              <el-input v-model="botConfig.SteamPassword" show-password />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="JSON 编辑" name="json">
          <el-input
            v-model="jsonConfig"
            type="textarea"
            :rows="20"
            style="font-family: monospace;"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useBotsStore } from '@/stores/bots'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, RefreshRight } from '@element-plus/icons-vue'

const botsStore = useBotsStore()

const activeTab = ref('global')
const saving = ref(false)
const selectedBot = ref('')

const globalConfig = reactive({
  IPCPassword: '',
  IPCHostname: '0.0.0.0',
  IPCPort: 1242,
  WebLobbyEnabled: true,
})

const botConfig = reactive({
  Enabled: true,
  KeepRunning: true,
  SteamLogin: '',
  SteamPassword: '',
})

const jsonConfig = ref('')

// 保存配置
async function handleSave() {
  saving.value = true

  try {
    // TODO: 调用保存 API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success('配置已保存')
  } catch (error) {
    console.error('Save config error:', error)
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

// 刷新配置
async function handleRefresh() {
  try {
    await ElMessageBox.confirm(
      '确定要重新加载配置吗？未保存的更改将丢失',
      '确认刷新',
      {
        confirmButtonText: '刷新',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    ElMessage.info('配置刷新功能开发中...')
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped lang="less">
.config-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    color: #e5eaf3;
    font-size: 24px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.config-card {
  background-color: #141414;
  border: 1px solid #2b2b2c;

  :deep(.el-tabs__nav) {
    background-color: #1d1e1f;
    border-bottom: 1px solid #2b2b2c;
  }

  :deep(.el-tabs__item) {
    color: #cfd3dc;

    &.is-active {
      color: #409eff;
    }

    &:hover {
      color: #e5eaf3;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: #409eff;
  }

  :deep(.el-tab-pane) {
    padding: 20px;
  }
}

:deep(.el-form-item__label) {
  color: #cfd3dc;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  background-color: #262727;
  border-color: #4c4d4f;
  color: #e5eaf3;
}

:deep(.el-input-number .el-input__inner) {
  width: 100%;
}

// 响应式
@media (max-width: 768px) {
  .config-page {
    padding: 16px;
  }

  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .header-actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }
  }

  :deep(.el-tabs__nav-wrap::after) {
    left: 0;
  }
}
</style>
