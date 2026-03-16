# Bots 页面完整需求清单（基于老版本复刻）

> **创建日期**: 2026-03-16
> **最后更新**: 2026-03-16
> **参考来源**: `D:\_workstation\ASF-ui\src\views\modals\`
> **目标**: 完整复刻老版本所有 Bot 相关功能

---

## ✅ 已完成

### CONF-001: ConfigEditor 动态配置编辑器

**状态**: ✅ 完成
**完成日期**: 2026-03-16
**实际工时**: 4h

**实现内容**:

1. **Schema 解析工具** ✅
   - `src/utils/fetchConfigSchema.ts`
   - 递归解析 C# 类型定义
   - 支持 10+ 种字段类型
   - 本地缓存优化性能

2. **参数描述加载** ✅
   - `src/utils/loadParameterDescriptions.ts`
   - 从 GitHub Wiki 抓取配置说明
   - 6小时本地缓存

3. **字段类型组件** ✅
   - `ConfigField.vue` - 基础字段容器
   - `StringField.vue` - 字符串输入
   - `BooleanField.vue` - 布尔开关
   - `NumberField.vue` - 数字输入
   - `EnumField.vue` - 枚举选择
   - `FlagField.vue` - 标志位多选
   - `HashSetField.vue` - 集合编辑（标签）
   - `ListField.vue` - 列表编辑

4. **主编辑器组件** ✅
   - `ConfigEditor.vue`
   - 支持分类显示
   - 支持字段验证
   - 支持参数说明展示

**文件结构**:
```
src/components/ConfigEditor/
├── ConfigEditor.vue       # 主编辑器
├── index.ts               # 导出
└── fields/
    ├── ConfigField.vue    # 基础字段容器
    ├── StringField.vue
    ├── BooleanField.vue
    ├── NumberField.vue
    ├── EnumField.vue
    ├── FlagField.vue
    ├── HashSetField.vue
    ├── ListField.vue
    ├── validation.ts       # 验证逻辑
    └── index.ts
```

**测试状态**:
- 类型检查通过 ✅
- 无编译错误 ✅

**待优化**:
- [ ] 渐进式加载（先显示基础字段）
- [ ] Schema 预加载
- [ ] 虚拟滚动（大量字段时）

---

## 📋 功能概览

老版本通过 **10 个模态页面** + **1 个动态配置编辑器** 实现完整的 Bot 管理功能。

### 模态页面列表

| 路由 | 组件 | 功能 | 优先级 |
|------|------|------|--------|
| `/bot/new` | BotCreate.vue | 创建 Bot | P0 |
| `/bot/:bot` | Bot.vue | Bot 详情 | P0 |
| `/bot/:bot/config` | BotConfig.vue | 编辑配置 | P0 |
| `/bot/:bot/config/:label/encrypt` | PasswordEncrypt.vue | 密码加密 | P2 |
| `/bot/:bot/bgr` | BotBGR.vue | 后台兑换 | P1 |
| `/bot/:bot/2fa` | Bot2FA.vue | 2FA 管理 | P1 |
| `/bot/:bot/2fa/delete` | Bot2FADelete.vue | 删除 2FA | P2 |
| `/bot/:bot/input/:type` | BotInput.vue | 输入处理 | P1 |
| `/bot/:bot/delete` | BotDelete.vue | 删除确认 | P0 |
| `/bot/:bot/copy` | BotCopy.vue | 复制 Bot | P1 |

---

## 🔧 基础组件依赖（必须先实现）

### CONF-001: ConfigEditor 动态配置编辑器
**重要性**: ⭐⭐⭐⭐⭐ (核心组件，多个功能依赖)

**功能需求**:
- 根据 ASF API 返回的 Schema 动态生成表单字段
- 支持分类显示（Category）
- 支持多种字段类型：
  - `string/uint64/guid` → InputString
  - `boolean` → InputBoolean
  - `uint32/uint16/byte` → InputNumber
  - `Flag (Enum)` → InputFlag
  - `Set<T>` → InputSet
  - `List<T>` → InputList
  - `KeyValuePair` → InputTag
  - `Enum (下拉选择)` → InputEnum
  - `Dictionary` → InputDictionary

**API 依赖**:
- `GET /api/Config/ArchiSteamFarm.Steam.Storage.BotConfig` - 获取 Schema
- `GET /api/Config/ParameterDescription` - 获取参数描述

**文件结构**:
```
src/components/Config/
├── Editor.vue              # 主编辑器
├── Category.vue            # 分类容器
└── Fields/
    ├── InputString.vue     # 文本输入
    ├── InputBoolean.vue    # 布尔开关
    ├── InputNumber.vue     # 数字输入
    ├── InputFlag.vue       # 标志位选择
    ├── InputSet.vue        # 集合编辑
    ├── InputList.vue       # 列表编辑
    ├── InputTag.vue        # 标签编辑
    ├── InputEnum.vue       # 枚举选择
    └── InputDictionary.vue # 字典编辑
```

**预计工时**: 8h

---

## 📦 P0 核心功能（必须实现）

### BOTS-DETAIL: Bot 详情页
**路由**: `/bot/:bot`
**组件**: `BotDetailDialog.vue` (已存在，需增强)

**功能需求**:
1. **基本信息展示** (已部分实现)
   - Bot 头像、名称、昵称
   - Steam ID、状态标签
   - 已连接、移动令牌状态

2. **钱包信息** ❌ 缺失
   - 显示 `bot.walletInfo`
   - 钱包余额展示

3. **挂卡信息** (已部分实现)
   - 已暂停、剩余时间
   - 等待游戏数量、正在挂卡数量

4. **游戏列表** ❌ 不完整
   - 等待挂卡的游戏列表
   - 每个游戏显示：游戏名、剩余卡片、已玩小时数
   - 参考：`D:\_workstation\ASF-ui\src\components\Bot\Games.vue`

5. **快捷操作** ❌ 缺失
   - 配置按钮 → 跳转配置编辑
   - BGR 按钮 → 跳转后台兑换
   - 2FA 按钮 → 跳转 2FA 管理
   - 启动/暂停/停止按钮
   - 删除按钮 → 跳转删除确认

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\Bot.vue`

**预计工时**: 4h

---

### BOTS-CREATE: 创建 Bot（使用 ConfigEditor）
**路由**: `/bot/new`
**组件**: `CreateBotDialog.vue` (已存在，需重构)

**功能需求**:
1. 使用 ConfigEditor 动态生成完整配置表单
2. 必填字段：Name, SteamLogin, SteamPassword
3. 验证规则：
   - Name 不能为 "ASF"
   - Name 不能与现有 Bot 重复
   - SteamPassword 最少 6 位
4. 支持"下载原始配置"功能
5. 创建成功后刷新 Bot 列表

**API**:
- `POST /api/Bot/Bot` - 创建 Bot

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\BotCreate.vue`

**预计工时**: 2h (依赖 ConfigEditor)

---

### BOTS-CONFIG: 编辑 Bot 配置（使用 ConfigEditor）

**状态**: ✅ 完成
**完成日期**: 2026-03-16
**实际工时**: 2h

**路由**: `/bot/:bot/config`
**组件**: `BotConfigDialog.vue`

**已实现功能**:
1. ✅ 使用 ConfigEditor 加载并编辑 Bot 配置
2. ✅ 特殊字段占位符处理：
   - SteamLogin 显示占位符 "保持不变"
   - SteamPassword 显示占位符 "保持不变"
   - SteamParentalCode 显示占位符 "保持不变"
3. ✅ 敏感字段过滤（占位符值不提交）
4. ✅ 配置保存成功后刷新 Bot 列表
5. ✅ 集成到 BotDetailDialog 和 Bots.vue

**待实现**:
- [ ] 支持从密码加密页面回调更新密码
- [ ] 支持"下载原始配置"功能
- [ ] 提供"复制 Bot"入口

**API**:
- `GET /api/Bot/{bot}` - 获取 Bot 配置
- `POST /api/Bot/{bot}` - 更新 Bot 配置

**文件结构**:
```
src/components/BotConfigDialog.vue
tests/components/BotConfigDialog.test.ts (9 tests passing)
```

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\BotConfig.vue`

---

### BOTS-DELETE: 删除 Bot 确认
**路由**: `/bot/:bot/delete`
**组件**: `BotDeleteDialog.vue` (需创建)

**功能需求**:
1. 确认对话框，显示 Bot 名称
2. 删除成功后返回 Bots 页面
3. 删除成功后刷新 Bot 列表

**API**:
- `DELETE /api/Bot/{bot}` - 删除 Bot

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\BotDelete.vue`

**预计工时**: 1h

---

## 🎯 P1 重要功能（应该实现）

### BOTS-2FA: 2FA 管理
**路由**: `/bot/:bot/2fa`
**组件**: `Bot2FADialog.vue` (需创建)

**功能需求**:
1. **未配置 2FA 时**:
   - 显示导入说明
   - 文件上传控件（.maFile）
   - 导入成功提示

2. **已配置 2FA 时**:
   - 显示 Token（大字体，居中显示）
   - Token 刷新按钮（每 30 秒自动刷新失效）
   - Token 复制按钮
   - "接受所有确认"按钮
   - "拒绝所有确认"按钮
   - "删除 2FA"链接

3. **Token 自动刷新**:
   - 30 秒倒计时后自动失效
   - 手动刷新按钮

**API**:
- `GET /api/Bot/{bot}/TwoFactorAuthentication/Token` - 生成 Token
- `POST /api/Bot/{bot}/TwoFactorAuthentication` - 导入 maFile
- `POST /api/Bot/{bot}/TwoFactorAuthentication/Confirmations` - 处理确认

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\Bot2FA.vue`

**预计工时**: 4h

---

### BOTS-2FA-DELETE: 删除 2FA
**路由**: `/bot/:bot/2fa/delete`
**组件**: `Bot2FADeleteDialog.vue` (需创建)

**功能需求**:
1. 确认对话框
2. 删除成功后返回 2FA 页面或 Bots 页面

**API**:
- `DELETE /api/Bot/{bot}/TwoFactorAuthentication` - 删除 2FA

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\Bot2FADelete.vue`

**预计工时**: 1h

---

### BOTS-BGR: 后台兑换
**路由**: `/bot/:bot/bgr`
**组件**: `BGRDialog.vue` (需创建)

**功能需求**:
1. **输入状态**:
   - 输入激活码文本框（支持多行输入）
   - 检查按钮
   - 显示已使用/未使用激活码统计
   - 显示后台队列数量（如果 bot.bgrCount > 0）
   - 重置按钮

2. **检查状态**:
   - 显示解析出的游戏列表
   - 确认/取消按钮

3. **重置状态**:
   - 确认重置对话框
   - 清空所有激活码

4. **汇总状态**:
   - 显示成功添加的激活码数量
   - 返回按钮

**API**:
- `GET /api/Bot/{bot}/GamesToRedeemInBackground` - 获取 BGR 状态
- `POST /api/Bot/{bot}/GamesToRedeemInBackground` - 添加激活码
- `DELETE /api/Bot/{bot}/GamesToRedeemInBackground` - 重置 BGR

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\BotBGR.vue`

**预计工时**: 6h

---

### BOTS-INPUT: 输入处理
**路由**: `/bot/:bot/input/:type`
**组件**: `BotInputDialog.vue` (需创建)

**功能需求**:
1. 根据输入类型显示不同的提示信息
2. 密码输入框（默认隐藏，可切换显示）
3. 提交按钮
4. Enter 键快捷提交
5. 提交成功后自动启动 Bot 并返回

**支持的输入类型**:
- `DeviceID` - 设备 ID
- `Login` - 账号
- `Password` - 密码
- `SteamGuard` - Steam Guard 代码
- `SteamParentalCode` - 家长控制代码
- `TwoFactorAuthentication` - 2FA 代码

**API**:
- `POST /api/Bot/{bot}/Input` - 提交输入

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\BotInput.vue`

**预计工时**: 2h

---

### BOTS-COPY: 复制 Bot
**路由**: `/bot/:bot/copy`
**组件**: `BotCopyDialog.vue` (需创建)

**功能需求**:
1. 加载源 Bot 配置
2. 只显示可编辑字段：
   - Name（必填）
   - SteamLogin（必填）
   - SteamPassword（必填）
3. 验证规则同创建 Bot
4. 复制成功后返回

**API**:
- `POST /api/Bot/{bot}/Copy` - 复制 Bot

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\BotCopy.vue`

**预计工时**: 2h

---

## 🔧 P2 辅助功能（可选实现）

### BOTS-PASSWORD-ENCRYPT: 密码加密工具
**路由**: `/bot/:bot/config/:label/encrypt`
**组件**: `PasswordEncryptDialog.vue` (需创建)

**功能需求**:
1. 输入明文密码
2. 选择加密方式（Encrypt/Hash）
3. 生成加密结果
4. 跳转回配置页面并填充结果

**API**:
- `POST /api/Password/Encrypt` - 加密密码
- `POST /api/Password/Hash` - Hash 密码

**老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\PasswordEncrypt.vue`

**预计工时**: 2h

---

## 📊 工时统计

| 优先级 | 功能 | 工时 |
|--------|------|------|
| 基础组件 | ConfigEditor + 字段组件 | 8h |
| P0 | Bot 详情页 | 4h |
| P0 | 创建 Bot | 2h |
| P0 | 编辑配置 | 3h |
| P0 | 删除 Bot | 1h |
| P1 | 2FA 管理 | 4h |
| P1 | 删除 2FA | 1h |
| P1 | 后台兑换 | 6h |
| P1 | 输入处理 | 2h |
| P1 | 复制 Bot | 2h |
| P2 | 密码加密 | 2h |
| **总计** | | **35h** |

---

## 🎯 实施顺序建议

### 第一阶段：基础组件（8h）
1. ConfigEditor 主编辑器
2. 各种字段类型组件

### 第二阶段：P0 核心功能（10h）
3. Bot 详情页增强
4. 创建 Bot（重构）
5. 编辑配置
6. 删除 Bot

### 第三阶段：P1 重要功能（15h）
7. 2FA 管理
8. 后台兑换
9. 输入处理
10. 复制 Bot
11. 删除 2FA

### 第四阶段：P2 辅助功能（2h）
12. 密码加密工具

---

## 📝 备注

1. **ConfigEditor 是核心**：几乎所有 Bot 配置相关功能都依赖它，必须优先实现
2. **老版本使用路由 + 模态**：新版本建议使用 Dialog 组件统一交互
3. **API 基本已实现**：新版本的 `src/api/Bot/index.ts` 已包含大部分 API，直接调用即可
4. **多语言支持**：老版本有完整的多语言，新版本可暂时使用中文，后续扩展
