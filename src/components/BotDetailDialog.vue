<template>
  <el-dialog
    v-model="visible"
    :title="bot?.Nickname || 'Bot 详情'"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div v-if="bot" class="bot-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3>基本信息</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Bot 名称</span>
            <span class="value">{{ bot.BotName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">昵称</span>
            <span class="value">{{ bot.Nickname }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Steam ID</span>
            <span class="value">{{ bot.s_SteamID }}</span>
          </div>
          <div class="detail-item">
            <span class="label">状态</span>
            <el-tag :type="getStatusType(bot?.Status ?? BotStatus.OFFLINE)">
              {{ getStatusText(bot?.Status ?? BotStatus.OFFLINE) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="label">已连接</span>
            <el-tag :type="bot.IsConnectedAndLoggedOn ? 'success' : 'danger'">
              {{ bot.IsConnectedAndLoggedOn ? '是' : '否' }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="label">移动令牌</span>
            <el-tag :type="bot.HasMobileAuthenticator ? 'success' : 'info'">
              {{ bot.HasMobileAuthenticator ? '已启用' : '未启用' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 挂卡信息 -->
      <div class="detail-section">
        <h3>挂卡信息</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">已暂停</span>
            <el-tag :type="bot.CardsFarmer?.Paused ? 'warning' : 'success'">
              {{ bot.CardsFarmer?.Paused ? '是' : '否' }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="label">剩余时间</span>
            <span class="value">{{ bot.CardsFarmer?.TimeRemaining || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">等待游戏</span>
            <span class="value">{{ bot.CardsFarmer?.GamesToFarm?.length || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="label">正在挂卡</span>
            <span class="value">{{ bot.CardsFarmer?.CurrentGamesFarming?.length || 0 }}</span>
          </div>
        </div>

        <!-- 等待挂卡的游戏列表 -->
        <div v-if="bot.CardsFarmer?.GamesToFarm?.length" class="games-list">
          <div v-for="game in bot.CardsFarmer.GamesToFarm" :key="game.AppID" class="game-item">
            <span class="game-name">{{ game.GameName }}</span>
            <span class="game-cards">{{ game.CardsRemaining }} 卡片</span>
            <span class="game-hours">{{ game.Hours }} 小时</span>
          </div>
        </div>
      </div>

      <!-- BGR 信息 -->
      <div class="detail-section">
        <h3>BGR 后台兑换</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">等待兑换</span>
            <span class="value">{{ bot.GamesToRedeemInBackgroundCount }}</span>
          </div>
        </div>
      </div>

      <!-- 配置信息 -->
      <div class="detail-section">
        <h3>配置</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">启用</span>
            <el-tag :type="bot.KeepRunning ? 'success' : 'info'">
              {{ bot.KeepRunning ? '是' : '否' }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="label">Steam 登录</span>
            <span class="value">{{ bot.BotConfig?.SteamLogin || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" :icon="Setting" @click="handleEditConfig"> 编辑配置 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { BotStatus } from '@/types/bot'
import type { Bot } from '@/types/bot'

interface Props {
  modelValue: boolean
  bot: Bot | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit-config', bot: Bot): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 获取状态类型
function getStatusType(status: BotStatus) {
  switch (status) {
    case BotStatus.FARMING:
      return 'success'
    case BotStatus.ONLINE:
      return 'primary'
    case BotStatus.PAUSED:
      return 'warning'
    case BotStatus.OFFLINE:
      return 'info'
    case BotStatus.DISABLED:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
function getStatusText(status: BotStatus) {
  switch (status) {
    case BotStatus.FARMING:
      return '挂卡中'
    case BotStatus.ONLINE:
      return '在线'
    case BotStatus.PAUSED:
      return '暂停'
    case BotStatus.OFFLINE:
      return '离线'
    case BotStatus.DISABLED:
      return '禁用'
    default:
      return '未知'
  }
}

// 编辑配置
function handleEditConfig() {
  if (!props.bot) return
  emit('edit-config', props.bot)
  visible.value = false
}
</script>

<style scoped lang="less">
.bot-detail {
  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    h3 {
      margin: 0 0 16px;
      color: #e5eaf3;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

// 详情网格
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    color: #8d9095;
    font-size: 13px;
  }

  .value {
    color: #e5eaf3;
    font-size: 14px;
    font-weight: 500;
  }
}

// 游戏列表
.games-list {
  margin-top: 16px;
  background-color: #262727;
  border-radius: 8px;
  padding: 12px;
}

.game-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #2b2b2c;

  &:last-child {
    border-bottom: none;
  }
}

.game-name {
  color: #cfd3dc;
  font-size: 14px;
}

.game-cards,
.game-hours {
  color: #8d9095;
  font-size: 13px;
  text-align: right;
}

// 底部按钮
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .game-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .game-cards,
  .game-hours {
    text-align: left;
  }
}
</style>
