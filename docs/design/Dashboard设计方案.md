# Dashboard 设计方案

> **项目**: ASF-ui-next
> **文档类型**: 设计方案
> **版本**: v1.0
> **创建日期**: 2026-03-03
> **状态**: 待实现

---

## 一、设计决策总览

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 布局类型 | 自适应网格 | 根据屏幕自动调整列数 |
| 活动展示 | 实时活动流 | 显示 Bot 状态变化事件 |
| 刷新频率 | 实时 (2-5 秒) | 与 Bots 页面保持一致 |
| ASF 信息 | 信息卡片 | 紧凑展示所有 ASF 信息 |
| 操作按钮 | 可选展示 | 用户可自定义显示/隐藏 |

---

## 二、页面布局设计

### 2.1 整体结构

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard 页面结构                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  [工具栏]  刷新 | 设置 | 全屏 | [配置按钮开关]                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  【首屏核心区】 - 一眼可见所有关键状态                         │ │
│  │                                                                │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                  │ │
│  │  │  [2x2] Bot状态   │  │  [2x2] 剩余卡片  │                  │ │
│  │  │   环形图/饼图    │  │   大数字统计     │                  │ │
│  │  │                  │  │                  │                  │ │
│  │  │  🟢 挂卡 5       │  │    127 张        │                  │ │
│  │  │  🔵 在线 2       │  │    8 个游戏      │                  │ │
│  │  │  ⏸️ 暂停 1        │  │    预计 2h 30m  │                  │ │
│  │  │  ⚫ 离线 0       │  │                  │                  │ │
│  │  └──────────────────┘  └──────────────────┘                  │ │
│  │                                                                │ │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐              │ │
│  │  │[1x1]内存│  │[1x1]运行│  │[1x1]版本│  │[1x1]渠道│              │ │
│  │  │256 MB  │  │2d 5h  │  │5.5.3.22│  │Preview│              │ │
│  │  └────────┘  └────────┘  └────────┘  └────────┘              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  [4x1] 快捷操作条 (可选显示)                                   │ │
│  │  [全部启动] [全部暂停] [全部恢复] [配置...]                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  [4x2] 实时活动流                                              │ │
│  │  ┌─────────────────────────────────────────────────────────┐  │ │
│  │  │ [筛选] 全部 ▼ | [显示] 20 条 ▼          [刷新] [更多]  │  │ │
│  │  ├─────────────────────────────────────────────────────────┤  │ │
│  │  │ 🟢 [10:30] Bot1 开始挂卡: Dota 2                         │  │ │
│  │  │ 🟢 [10:28] Bot2 登录成功                                 │  │ │
│  │  │ ✅ [10:25] Bot3 完成挂卡: CS2 (获得 3 张卡)               │  │ │
│  │  │ ⚠️  [10:20] Bot4 连接超时，正在重试...                   │  │ │
│  │  │ 🟢 [10:15] Bot5 开始挂卡: Team Fortress 2                │  │ │
│  │  │ ...                                                      │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 响应式布局

**移动端 (< 768px)**
```
┌───────────────────┐
│  [工具栏折叠]     │
├───────────────────┤
│  [2x2] Bot状态    │
├───────────────────┤
│  [2x2] 剩余卡片   │
├───────────────────┤
│  [1x1] 内存       │
├───────────────────┤
│  [1x1] 运行时间   │
├───────────────────┤
│  [1x1] 版本       │
├───────────────────┤
│  [1x1] 渠道       │
├───────────────────┤
│  [4x1] 操作条     │
├───────────────────┤
│  [4x2] 活动流     │
└───────────────────┘
```

**平板 (768px - 1200px)**
```
┌─────────────────────┬─────────────────────┐
│  [2x2] Bot状态      │  [2x2] 剩余卡片     │
├─────────────────────┴─────────────────────┤
│  [4x1] 操作条                            │
├──────────┬──────────┬──────────┬──────────┤
│[1x1]内存 │[1x1]运行 │[1x1]版本 │[1x1]渠道 │
├──────────┴──────────┴──────────┴──────────┤
│  [4x2] 活动流                            │
└────────────────────────────────────────────┘
```

**桌面 (> 1200px)**
```
完整布局，见 2.1 节
```

---

## 三、核心组件设计

### 3.1 Bot 状态分布卡片 (2x2)

```typescript
// BotStatusCard.vue
interface BotStatusCardData {
  farming: number;   // 挂卡中
  online: number;    // 在线
  paused: number;    // 暂停
  offline: number;   // 离线
  disabled: number;  // 禁用
}

// 优先展示前 4 种状态，禁用状态可以点击查看详情
const displayOrder = ['farming', 'online', 'paused', 'offline'];
```

**视觉设计**:
- 使用环形图 (Donut Chart) 或 饼图
- 中心显示总 Bot 数量
- 悬停显示具体数量和百分比
- 点击某个状态可以跳转到 Bots 页面对应筛选

**颜色映射**:
```typescript
const STATUS_COLORS = {
  farming: '#67c23a',  // 绿色
  online: '#409eff',   // 蓝色
  paused: '#e6a23c',   // 橙色
  offline: '#909399',  // 灰色
  disabled: '#f56c6c', // 红色
};
```

### 3.2 剩余卡片统计卡片 (2x2)

```typescript
// CardsRemainingCard.vue
interface CardsRemainingData {
  cardsRemaining: number;      // 剩余卡片总数
  gamesRemaining: number;      // 剩余游戏总数
  timeRemaining: number;       // 预计剩余时间（秒）
  botsFarming: number;         // 正在挂卡的 Bot 数
}
```

**视觉设计**:
```
┌──────────────────────────────┐
│       剩余卡片统计            │
├──────────────────────────────┤
│                               │
│        127                    │
│      剩余卡片张数             │
│                               │
│   ━━━━━━━━━━━━━━━━━━        │
│   8 个游戏 · 预计 2h 30m     │
│   5 个 Bot 正在挂卡          │
│                               │
└──────────────────────────────┘
```

**时间格式化**:
```typescript
function formatTimeRemaining(seconds: number): string {
  if (seconds === 0) return '无挂卡任务';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);

  return parts.join(' ') || '即将完成';
}
```

### 3.3 ASF 信息卡片组 (4 x 1x1)

```typescript
// AsfInfoCard.vue
interface AsfInfoData {
  memoryUsage: number;        // MB
  uptime: number;             // 秒
  version: string;            // 版本号
  buildVariant: string;       // 构建类型
  updateChannel: number;      // 0=无 1=Stable 2=Prerelease
  steamOwnerID: string;       // Steam ID
  headless: boolean;          // 无头模式
  service: boolean;           // 服务模式
}
```

**视觉设计**:
```
┌──────────┬──────────┬──────────┬──────────┐
│  📊      │  ⏱️      │  🏷️      │  📢      │
│  256 MB  │ 2d 5h 30m│ 5.5.3.22 │ Preview  │
│  内存    │ 运行时间 │ 版本     │ 渠道     │
└──────────┴──────────┴──────────┴──────────┘
```

**每个小卡片包含**:
- 图标（24px）
- 主数值（大字号，等宽字体）
- 标签（小字号，次要色）

### 3.4 快捷操作条 (4x1，可选)

```typescript
// QuickActionsBar.vue
interface QuickAction {
  key: string;
  label: string;
  icon: string;
  type: 'success' | 'warning' | 'danger' | 'primary';
  confirm?: boolean;           // 是否需要确认
  shortcut?: string;           // 快捷键提示
}

const QUICK_ACTIONS: QuickAction[] = [
  { key: 'startAll', label: '全部启动', icon: 'VideoPlay', type: 'success', shortcut: 'S' },
  { key: 'pauseAll', label: '全部暂停', icon: 'VideoPause', type: 'warning', confirm: true, shortcut: 'P' },
  { key: 'resumeAll', label: '全部恢复', icon: 'RefreshRight', type: 'primary', shortcut: 'R' },
  { key: 'settings', label: '配置', icon: 'Setting', type: 'default' },
];
```

**视觉设计**:
```
┌─────────────────────────────────────────────────────────────┐
│  ▼ 快捷操作                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ ▶ 全部启动│ │ ⏸ 全部暂停│ │ ↻ 全部恢复│ │ ⚙ 配置  │       │
│  │   [S]    │ │   [P]    │ │   [R]    │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**折叠状态**:
```
┌─────────────────────────────────────────────────────────────┐
│  ▶ 快捷操作  [全部启动] [全部暂停] [全部恢复] [配置]         │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 实时活动流 (4x2)

```typescript
// ActivityStream.vue
interface ActivityItem {
  id: string;
  type: 'login' | 'farming' | 'complete' | 'error' | 'warning' | 'logout';
  bot: string;                 // Bot 名称
  game?: string;               // 相关游戏（如果有）
  message: string;             // 主要消息
  timestamp: Date;             // 时间戳
  metadata?: {
    cardsGained?: number;      // 获得的卡片数
    timeRemaining?: string;   // 剩余时间
    error?: string;            // 错误信息
  };
}

// 活动流配置
interface ActivityStreamConfig {
  maxItems: number;            // 最大显示条数（用户可配置 10/20/50）
  filterTypes: string[];       // 筛选的事件类型（用户可配置）
  filterBots: string[];        // 筛选的 Bot（用户可配置）
  autoScroll: boolean;         // 新事件时自动滚动到顶部
  showTimestamp: boolean;      // 显示时间戳
  groupByBot: boolean;         // 按 Bot 分组
}
```

**事件类型与图标**:
```typescript
const EVENT_TYPES = {
  login: {
    icon: 'CircleCheck',
    color: '#67c23a',
    label: '登录',
  },
  farming: {
    icon: 'VideoPlay',
    color: '#409eff',
    label: '开始挂卡',
  },
  complete: {
    icon: 'CircleCheckFilled',
    color: '#67c23a',
    label: '完成挂卡',
  },
  error: {
    icon: 'CircleCloseFilled',
    color: '#f56c6c',
    label: '错误',
  },
  warning: {
    icon: 'WarningFilled',
    color: '#e6a23c',
    label: '警告',
  },
  logout: {
    icon: 'SwitchButton',
    color: '#909399',
    label: '登出',
  },
};
```

**视觉设计**:
```
┌─────────────────────────────────────────────────────────────┐
│  📋 实时活动流                                    [刷新] [更多] │
├─────────────────────────────────────────────────────────────┤
│  [筛选: 全部 ▼]  [显示: 20 条 ▼]  [分组: Bot ▼]            │
├─────────────────────────────────────────────────────────────┤
│  🟢 [10:30:15] Bot1 开始挂卡: Dota 2                        │
│     预计剩余: 1h 30m                                          │
├─────────────────────────────────────────────────────────────┤
│  🟢 [10:28:42] Bot2 登录成功                                 │
├─────────────────────────────────────────────────────────────┤
│  ✅ [10:25:08] Bot3 完成挂卡: CS2                            │
│     获得了 3 张卡片 (2/3 已收集)                             │
├─────────────────────────────────────────────────────────────┤
│  ⚠️  [10:20:33] Bot4 连接超时，正在重试...                   │
├─────────────────────────────────────────────────────────────┤
│  🟢 [10:15:20] Bot5 开始挂卡: Team Fortress 2               │
├─────────────────────────────────────────────────────────────┤
│  ... 更多活动                                              │
└─────────────────────────────────────────────────────────────┘
```

**空状态**:
```
┌─────────────────────────────────────────────────────────────┐
│  📋 实时活动流                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                        💡                                   │
│                     暂无活动记录                             │
│               当 Bot 有活动时会显示在此处                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、数据流设计

### 4.1 数据获取流程

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard 数据获取流程                     │
└─────────────────────────────────────────────────────────────┘

用户进入页面
      │
      ▼
┌─────────────────┐
│ 检查登录状态    │ ──→ 未登录 → 跳转登录页
└─────────────────┘
      │ 已登录
      ▼
┌─────────────────┐
│ 并发请求:        │
│ • getASF()      │ ───→ ASF 信息卡片
│ • getBots()     │ ───→ Bot 状态卡片、剩余卡片
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 启动实时更新    │
│ • setInterval   │
│   2.5s 轮询      │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 对比数据差异    │
│ • 检测状态变化  │ ───→ 有变化 → 生成活动事件
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 更新 UI         │
│ • 更新卡片      │
│ • 添加活动流    │
└─────────────────┘
```

### 4.2 活动事件生成逻辑

```typescript
// ActivityGenerator.ts
class ActivityGenerator {
  private previousBotState: Map<string, Bot> = new Map();

  generateActivities(currentBots: Record<string, Bot>): ActivityItem[] {
    const activities: ActivityItem[] = [];

    for (const [botName, currentBot] of Object.entries(currentBots)) {
      const previousBot = this.previousBotState.get(botName);

      if (!previousBot) {
        // 新 Bot
        if (currentBot.IsConnectedAndLoggedOn) {
          activities.push(this.createLoginActivity(currentBot));
        }
        continue;
      }

      // 检测状态变化
      activities.push(...this.detectStatusChanges(previousBot, currentBot));

      // 检测挂卡完成
      activities.push(...this.detectFarmingCompletion(previousBot, currentBot));
    }

    // 更新缓存
    this.previousBotState = new Map(Object.entries(currentBots));

    return activities;
  }

  private detectStatusChanges(prev: Bot, curr: Bot): ActivityItem[] {
    const activities: ActivityItem[] = [];
    const prevStatus = calculateBotStatus(prev);
    const currStatus = calculateBotStatus(curr);

    if (prevStatus !== currStatus) {
      switch (currStatus) {
        case BotStatus.FARMING:
          activities.push({
            id: generateId(),
            type: 'farming',
            bot: curr.BotName,
            message: `开始挂卡: ${curr.CardsFarmer?.CurrentGamesFarming?.[0]?.GameName || '未知游戏'}`,
            timestamp: new Date(),
          });
          break;
        case BotStatus.OFFLINE:
          activities.push({
            id: generateId(),
            type: 'warning',
            bot: curr.BotName,
            message: '连接断开',
            timestamp: new Date(),
          });
          break;
        // ... 更多状态
      }
    }

    return activities;
  }

  private detectFarmingCompletion(prev: Bot, curr: Bot): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // 简化逻辑：如果之前有游戏在挂卡，现在没有了，说明完成了
    const prevGames = prev.CardsFarmer?.CurrentGamesFarming?.length ?? 0;
    const currGames = curr.CardsFarmer?.CurrentGamesFarming?.length ?? 0;

    if (prevGames > 0 && currGames === 0) {
      // 实际应该从日志获取更详细的信息
      activities.push({
        id: generateId(),
        type: 'complete',
        bot: curr.BotName,
        message: '完成挂卡',
        timestamp: new Date(),
      });
    }

    return activities;
  }
}
```

### 4.3 数据刷新策略

```typescript
// RefreshManager.ts
class DashboardRefreshManager {
  private asfRefreshInterval: number | null = null;
  private botsRefreshInterval: number | null = null;
  private isPaused = false;

  start() {
    // ASF 信息 - 低频刷新 (30 秒)
    this.asfRefreshInterval = window.setInterval(() => {
      if (!this.isPaused) {
        asfStore.fetchInfo();
      }
    }, 30000);

    // Bot 信息 - 高频刷新 (2.5 秒)
    this.botsRefreshInterval = window.setInterval(() => {
      if (!this.isPaused) {
        botsStore.fetchBots();
      }
    }, 2500);

    // 立即获取一次
    this.refreshNow();
  }

  stop() {
    if (this.asfRefreshInterval) clearInterval(this.asfRefreshInterval);
    if (this.botsRefreshInterval) clearInterval(this.botsRefreshInterval);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.refreshNow();
  }

  async refreshNow() {
    await Promise.all([
      asfStore.fetchInfo(),
      botsStore.fetchBots(),
    ]);
  }
}
```

---

## 五、用户设置

### 5.1 可配置项

```typescript
// DashboardSettings.ts
interface DashboardSettings {
  // 布局设置
  layout: {
    showQuickActions: boolean;      // 显示快捷操作
    compactMode: boolean;           // 紧凑模式
    maxColumns: 2 | 3 | 4;          // 最大列数
  };

  // 活动流设置
  activity: {
    maxItems: 10 | 20 | 50 | 100;   // 最大显示条数
    filterTypes: string[];          // 筛选的事件类型
    filterBots: string[];           // 筛选的 Bot
    autoScroll: boolean;            // 自动滚动
    showTimestamp: boolean;         // 显示时间戳
  };

  // 刷新设置
  refresh: {
    enabled: boolean;               // 启用自动刷新
    interval: number;               // 刷新间隔（毫秒）
    pauseWhenHidden: boolean;       // 页面不可见时暂停
  };

  // 卡片设置
  cards: {
    botStatus: { enabled: boolean; position: number };
    cardsRemaining: { enabled: boolean; position: number };
    asfInfo: { enabled: boolean; position: number };
    activityStream: { enabled: boolean; position: number };
  };
}
```

### 5.2 设置存储

```typescript
// 使用 Pinia + persist
export const useDashboardStore = defineStore('dashboard', () => {
  const settings = ref<DashboardSettings>(DEFAULT_SETTINGS);

  // 保存设置
  function saveSettings(newSettings: Partial<DashboardSettings>) {
    settings.value = { ...settings.value, ...newSettings };
  }

  // 重置为默认
  function resetSettings() {
    settings.value = DEFAULT_SETTINGS;
  }

  return {
    settings,
    saveSettings,
    resetSettings,
  };
}, {
  persist: true, // 持久化到 localStorage
});
```

---

## 六、实现计划

### 6.1 开发阶段

| 阶段 | 任务 | 工作量 | 优先级 |
|------|------|--------|--------|
| **P0** | 基础布局搭建 | 0.5 天 | 高 |
| **P0** | Bot 状态卡片 | 1 天 | 高 |
| **P0** | 剩余卡片统计卡片 | 0.5 天 | 高 |
| **P0** | ASF 信息卡片组 | 0.5 天 | 高 |
| **P1** | 实时刷新机制 | 1 天 | 高 |
| **P1** | 活动流组件 | 1.5 天 | 中 |
| **P1** | 快捷操作条 | 1 天 | 中 |
| **P2** | 用户设置面板 | 1 天 | 低 |
| **P2** | 活动流筛选 | 0.5 天 | 低 |
| **P2** | 响应式优化 | 0.5 天 | 低 |

**总计**: 约 8 天

### 6.2 文件结构

```
src/views/Dashboard.vue
src/components/dashboard/
├── BotStatusCard.vue           # Bot 状态卡片 (2x2)
├── CardsRemainingCard.vue      # 剩余卡片卡片 (2x2)
├── AsfInfoCard.vue             # ASF 信息卡片组 (4x1x1)
├── QuickActionsBar.vue         # 快捷操作条 (4x1)
├── ActivityStream.vue          # 实时活动流 (4x2)
├── DashboardToolbar.vue        # 页面工具栏
├── DashboardSettings.vue       # 设置面板
└── composables/
    ├── useDashboardRefresh.ts  # 刷新管理
    ├── useActivityGenerator.ts # 活动生成
    └── useCardSize.ts          # 卡片尺寸计算

src/stores/dashboard.ts         # Dashboard 设置 store
```

---

## 七、验收标准

### 7.1 功能验收

- [ ] 首屏能完整显示所有关键指标
- [ ] 数据每 2.5 秒自动刷新
- [ ] 活动流实时更新，显示最新事件
- [ ] 点击快捷操作按钮能正确执行操作
- [ ] 可以通过设置面板自定义显示内容
- [ ] 响应式布局在不同屏幕下正常工作

### 7.2 性能验收

- [ ] 首次加载时间 < 1 秒
- [ ] 刷新时不引起页面卡顿
- [ ] 活动流滚动流畅
- [ ] 内存占用 < 50 MB

### 7.3 视觉验收

- [ ] 卡片悬停效果流畅
- [ ] 数据变化有过渡动画
- [ ] 颜色符合语义规范
- [ ] 空状态设计美观

---

## 八、后续优化

### 8.1 Phase 2 功能

- [ ] 活动流导出（CSV/JSON）
- [ ] 活动流搜索
- [ ] 自定义卡片布局
- [ ] 卡片拖拽排序
- [ ] 数据对比（同比/环比）
- [ ] 告警通知

### 8.2 Phase 3 功能

- [ ] 历史趋势图表
- [ ] Bot 性能对比
- [ ] 自定义监控面板
- [ ] 数据看板分享
- [ ] 移动端原生应用

---

## 九、参考资源

### 9.1 设计参考

- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Stats](https://github.com/features/actions)
- [Google Analytics](https://analytics.google.com/)
- [DataDog Dashboard](https://www.datadoghq.com/)

### 9.2 技术文档

- [ECharts 文档](https://echarts.apache.org/zh/index.html)
- [Element Plus 组件](https://element-plus.org/zh-CN/)
- [VueUse](https://vueuse.org/)

---

## 十、文档维护

| 版本 | 日期 | 变更内容 | 维护者 |
|------|------|----------|--------|
| v1.0 | 2026-03-03 | 初始版本 | Claude |

---

**相关文档**:
- [Dashboard 设计规范](./dashboard-design-spec.md)
- [功能完成度清单](../功能完成度清单.md)
- [需求文档](../需求文档.md)
