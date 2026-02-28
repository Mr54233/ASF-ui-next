<template>
  <div class="log-page">
    <div class="log-header">
      <h2>日志</h2>
      <div class="header-actions">
        <el-button :icon="RefreshRight" @click="handleRefresh">
          刷新
        </el-button>
        <el-button :icon="Download" @click="handleDownload">
          导出
        </el-button>
        <el-button type="danger" :icon="Delete" @click="handleClear">
          清空
        </el-button>
      </div>
    </div>

    <el-card class="log-card" shadow="never">
      <div class="log-content">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-entry"
          :class="log.level"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-level">{{ log.level }}</span>
          <span class="log-source" v-if="log.source">[{{ log.source }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>

        <el-empty v-if="logs.length === 0" description="暂无日志" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Download, Delete } from '@element-plus/icons-vue'

// 日志数据
const logs = ref<Array<{
  time: string
  level: string
  source?: string
  message: string
}>>([])

// 刷新日志
function handleRefresh() {
  ElMessage.info('日志刷新功能开发中...')
}

// 导出日志
function handleDownload() {
  ElMessage.info('日志导出功能开发中...')
}

// 清空日志
async function handleClear() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？',
      '确认清空',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    logs.value = []
    ElMessage.success('已清空日志')
  } catch (error) {
    // 用户取消
  }
}

// 组件挂载
onMounted(() => {
  // 模拟加载一些日志
  logs.value = [
    {
      time: new Date().toLocaleTimeString(),
      level: 'INFO',
      source: 'ASF',
      message: 'ASF 启动成功',
    },
    {
      time: new Date(Date.now() - 1000).toLocaleTimeString(),
      level: 'INFO',
      source: 'Bot1',
      message: 'Bot1 已连接并登录',
    },
    {
      time: new Date(Date.now() - 2000).toLocaleTimeString(),
      level: 'WARN',
      source: 'Bot2',
      message: 'Bot2 连接超时，正在重试...',
    },
  ]
})
</script>

<style scoped lang="less">
.log-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.log-header {
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

.log-card {
  background-color: #141414;
  border: 1px solid #2b2b2c;

  :deep(.el-card__body) {
    padding: 0;
  }
}

.log-content {
  max-height: 600px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 16px;
}

.log-entry {
  padding: 8px 0;
  border-bottom: 1px solid #262727;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  &:last-child {
    border-bottom: none;
  }

  &.INFO {
    color: #cfd3dc;
  }

  &.WARN {
    color: #e6a23c;
    background-color: rgba(230, 162, 60, 0.05);
  }

  &.ERROR {
    color: #f56c6c;
    background-color: rgba(245, 108, 108, 0.05);
  }

  &.DEBUG {
    color: #8d9095;
  }
}

.log-time {
  color: #8d9095;
  font-size: 12px;
  min-width: 80px;
}

.log-level {
  font-weight: 600;
  min-width: 60px;
}

.log-source {
  color: #409eff;
  font-weight: 500;
}

.log-message {
  color: #e5eaf3;
  flex: 1;
  min-width: 0;
}

// 响应式
@media (max-width: 768px) {
  .log-page {
    padding: 16px;
  }

  .log-header {
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

  .log-entry {
    flex-direction: column;
    gap: 4px;
  }

  .log-time,
  .log-level,
  .log-source {
    min-width: auto;
  }
}
</style>
