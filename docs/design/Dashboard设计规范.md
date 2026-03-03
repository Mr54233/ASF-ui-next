# Dashboard 设计规范

> **项目**: ASF-ui-next
> **文档类型**: 设计规范
> **版本**: v1.0
> **创建日期**: 2026-03-03

---

## 一、设计原则

### 1.1 核心原则

| 原则 | 说明 | 应用场景 |
|------|------|----------|
| **一眼可见** | 关键状态无需滚动即可查看 | 首屏卡片 |
| **渐进信息** | 从概括到细节，按需展开 | 卡片→详情弹窗 |
| **数据为王** | 数据驱动决策，减少装饰 | 所有展示组件 |
| **响应优先** | 实时数据优于静态展示 | 活动流、状态卡片 |
| **可配置性** | 用户可自定义显示内容 | 布局、筛选、刷新频率 |

### 1.2 设计目标

```
┌─────────────────────────────────────────────────────────────┐
│  用户进入 Dashboard，3 秒内应该能够回答：                    │
│  ✓ ASF 是否正常运行？                                        │
│  ✓ 有多少 Bot 在工作？                                       │
│  ✓ 还有多少卡片没挂完？                                      │
│  ✓ 有没有异常需要处理？                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、卡片网格系统

### 2.1 布局类型

**采用自适应网格 (Adaptive Grid)**

```
基础单位: 1 列 (最小 240px)
列数规则:
- xs (<768px):  1 列
- sm (768-992px): 2 列
- md (992-1200px): 3 列
- lg (1200-1600px): 4 列
- xl (>1600px): 4 列，居中限制最大宽度
```

### 2.2 卡片尺寸规范

| 尺寸类型 | 占位 | 用途 | 高度 |
|----------|------|------|------|
| **1x1 小卡片** | 1列x1行 | 简单数据展示 | 100px |
| **1x2 高卡片** | 1列x2行 | 垂直列表、计数 | 200px |
| **2x1 宽卡片** | 2列x1行 | 时间线、进度条 | 100px |
| **2x2 大卡片** | 2列x2行 | 图表、复杂可视化 | 200px |
| **4x1 超宽卡** | 4列x1行 | 活动流、通知 | 100px |
| **4x2 通栏卡** | 4列x2行 | 重要数据面板 | 200px |

**响应式规则**:
```
lg 屏幕下的 2x2 卡片 → md 屏幕变为 1x2 或 4x1
lg 屏幕下的 4x1 卡片 → md 屏幕变为 2x1
移动端统一为 1xN 堆叠
```

### 2.3 间距与留白

```less
// 卡片间距
@gap-xs: 8px;   // 紧凑布局
@gap-sm: 12px;  // 默认间距
@gap-md: 16px;  // 舒适间距
@gap-lg: 24px;  // 宽松间距

// 卡片内边距
@padding-card: 16px;
@padding-card-compact: 12px;

// 圆角
@radius-sm: 8px;
@radius-md: 12px;
@radius-lg: 16px;
```

---

## 三、视觉规范

### 3.1 卡片样式层次

```typescript
// 卡片视觉层次
enum CardLevel {
  // 核心卡片 - 渐变背景 + 微妙阴影
  Primary = 'primary',

  // 普通卡片 - 纯色背景 + 边框
  Default = 'default',

  // 次要卡片 - 半透明背景
  Secondary = 'secondary',

  // 信息卡片 - 紧凑布局
  Compact = 'compact',
}
```

```less
.card {
  // 基础样式
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: @radius-md;
  padding: @padding-card;

  // 悬停效果
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }

  // 核心卡片强化
  &.card--primary {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    color: #fff;

    .card-value {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
    }
  }
}
```

### 3.2 数据展示规范

#### 大数字显示

```less
.stat-value {
  font-family: 'SF Mono', 'Roboto Mono', monospace;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;

  // 大数值简化显示
  &.large-number {
    font-variant-numeric: tabular-nums;
  }
}
```

#### 趋势指示器

```less
.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  &.trend-up {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.1);
  }

  &.trend-down {
    color: #f56c6c;
    background: rgba(245, 108, 108, 0.1);
  }

  &.trend-flat {
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
  }
}
```

### 3.3 颜色语义

```less
// 状态颜色
@color-farming: #67c23a;    // 挂卡中 - 绿色
@color-online: #409eff;     // 在线 - 蓝色
@color-paused: #e6a23c;     // 暂停 - 橙色
@color-offline: #909399;    // 离线 - 灰色
@color-disabled: #f56c6c;   // 禁用 - 红色
@color-error: #f56c6c;      // 错误 - 红色
@color-warning: #e6a23c;    // 警告 - 橙色
@color-success: #67c23a;    // 成功 - 绿色

// 数据类型颜色
@color-cards: #e6a23c;      // 卡片 - 橙色
@color-games: #409eff;      // 游戏 - 蓝色
@color-memory: #909399;     // 内存 - 灰色
@color-uptime: #67c23a;     // 运行时间 - 绿色
```

---

## 四、组件规范

### 4.1 数据卡片组件

```typescript
// BaseStatCard.vue
interface StatCardProps {
  // 卡片尺寸
  size?: 'small' | 'medium' | 'large';

  // 视觉层级
  level?: 'primary' | 'default' | 'secondary' | 'compact';

  // 数据内容
  title: string;
  value: string | number;
  unit?: string;
  trend?: number; // 正数上升，负数下降

  // 图标
  icon?: string;
  iconColor?: string;

  // 附加信息
  extra?: string;
  subtitle?: string;

  // 交互
  clickable?: boolean;
  loading?: boolean;
}
```

### 4.2 图表卡片组件

```typescript
// ChartCard.vue
interface ChartCardProps {
  title: string;
  type: 'pie' | 'line' | 'bar' | 'gauge' | 'timeline';
  data: any;
  options?: any;

  // 工具栏
  showRefresh?: boolean;
  showFullscreen?: boolean;
  showExport?: boolean;

  // 交互
  onChartClick?: (data: any) => void;
}
```

### 4.3 活动流组件

```typescript
// ActivityStream.vue
interface ActivityItem {
  id: string;
  type: 'login' | 'farming' | 'complete' | 'error' | 'warning';
  bot?: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityStreamProps {
  items: ActivityItem[];
  maxItems?: number; // 默认 20，用户可配置

  // 筛选
  filterTypes?: string[];
  filterBots?: string[];

  // 交互
  onLoadMore?: () => void;
  onItemClick?: (item: ActivityItem) => void;
}
```

---

## 五、交互规范

### 5.1 刷新策略

| 数据类型 | 刷新频率 | 说明 |
|----------|----------|------|
| **实时数据** | 2-5 秒 | Bot 状态、活动流 |
| **统计数据** | 10-15 秒 | 卡片数、游戏数 |
| **静态数据** | 手动刷新 | ASF 版本、配置 |
| **图表数据** | 30-60 秒 | 趋势图、历史数据 |

```typescript
// 刷新策略配置
const REFRESH_STRATEGY = {
  realtime: {
    interval: 2500,
    autoStart: true,
    pauseWhenHidden: true, // 页面不可见时暂停
  },
  statistics: {
    interval: 10000,
    autoStart: true,
  },
  static: {
    interval: 0,
    autoStart: false,
  },
};
```

### 5.2 加载状态

```less
// 骨架屏
.skeleton-card {
  background: linear-gradient(
    90deg,
    var(--el-fill-color-light) 25%,
    var(--el-fill-color) 50%,
    var(--el-fill-color-light) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 5.3 空状态

```typescript
// 空状态类型
enum EmptyStateType {
  NoData = 'no-data',           // 无数据
  Loading = 'loading',           // 加载中
  Error = 'error',               // 错误
  NoBots = 'no-bots',           // 无 Bot
  NotFarming = 'not-farming',   // 未挂卡
}

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    text: string;
    onClick: () => void;
  };
}
```

---

## 六、响应式规范

### 6.1 断点定义

```typescript
// 断点配置
const BREAKPOINTS = {
  xs: 0,      // 手机竖屏
  sm: 600,    // 手机横屏
  md: 960,    // 平板竖屏
  lg: 1264,   // 平板横屏 / 小笔记本
  xl: 1600,   // 桌面
  xxl: 1920,  // 大屏
};
```

### 6.2 响应式策略

```less
// 移动优先
.dashboard {
  // 默认（移动端）- 单列堆叠
  display: flex;
  flex-direction: column;
  gap: @gap-sm;

  // 平板 - 2 列
  @media (min-width: @breakpoint-md) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  // 桌面 - 4 列
  @media (min-width: @breakpoint-lg) {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1600px;
    margin: 0 auto;
  }

  // 大屏 - 保持 4 列但更宽松
  @media (min-width: @breakpoint-xxl) {
    gap: @gap-lg;
  }
}
```

---

## 七、可访问性

### 7.1 键盘导航

```typescript
// 快捷键绑定
const KEYBOARD_SHORTCUTS = {
  'r': 'refresh',           // 刷新数据
  'f': 'focus-search',      // 聚焦搜索
  'a': 'select-all',        // 全选 Bot
  'p': 'pause-all',         // 暂停所有
  's': 'start-all',         // 启动所有
  '?': 'show-shortcuts',    // 显示快捷键帮助
};
```

### 7.2 屏幕阅读器

```html
<!-- ARIA 标签示例 -->
<div
  class="stat-card"
  role="region"
  aria-label="Bot 状态统计"
  aria-live="polite"
>
  <div class="stat-value" aria-label="正在挂卡的 Bot 数量">5</div>
  <div class="stat-label">挂卡中</div>
</div>
```

---

## 八、性能规范

### 8.1 渲染优化

```typescript
// 虚拟滚动
const ACTIVITY_STREAM_CONFIG = {
  itemHeight: 48,
  bufferSize: 5,
  threshold: 100,
};

// 图表懒加载
const CHART_LAZY_LOAD = {
  rootMargin: '50px',
  threshold: 0.1,
};
```

### 8.2 数据缓存

```typescript
// 缓存策略
const CACHE_CONFIG = {
  botStatus: {
    ttl: 5000,      // 5 秒
    maxSize: 100,
  },
  asfInfo: {
    ttl: 60000,     // 1 分钟
    maxSize: 10,
  },
  activityLog: {
    ttl: 0,         // 不缓存
    maxSize: 0,
  },
};
```

---

## 九、设计资产

### 9.1 图标库

```typescript
// 使用的图标集
import {
  // 统计图标
  User,           // Bot 数量
  Timer,          // 挂卡时间
  Grid,           // 卡片数量
  VideoPlay,      // 游戏数量

  // 状态图标
  CircleCheck,    // 在线
  CircleClose,    // 离线
  Warning,        // 警告
  InfoFilled,     // 信息

  // 操作图标
  Refresh,        // 刷新
  Setting,        // 设置
  More,           // 更多
  FullScreen,     // 全屏

  // ASF 图标
  Cpu,            // 内存
  Clock,          // 运行时间
  Document,       // 版本
} from '@element-plus/icons-vue';
```

### 9.2 字体规范

```less
// 字体家族
@font-family-primary: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
@font-family-mono: 'SF Mono', 'Roboto Mono', 'Consolas', monospace;
@font-family-numbers: 'Inter', 'Roboto', sans-serif; // 用于数字

// 字号规范
@font-size-xs: 12px;
@font-size-sm: 13px;
@font-size-base: 14px;
@font-size-md: 16px;
@font-size-lg: 18px;
@font-size-xl: 20px;
@font-size-2xl: 24px;
@font-size-3xl: 32px;
@font-size-4xl: 40px;
```

---

## 十、文档维护

| 版本 | 日期 | 变更内容 | 维护者 |
|------|------|----------|--------|
| v1.0 | 2026-03-03 | 初始版本 | Claude |

---

**相关文档**:
- [Dashboard 设计方案](./dashboard-design-proposal.md)
- [组件规范](../components/README.md)
- [API 文档](../api/README.md)
