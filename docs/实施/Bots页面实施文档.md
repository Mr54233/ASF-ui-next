# Bots 页面实施文档

> **需求编号**: BOTS-001 ~ BOTS-007
> **优先级**: P0 (核心功能)
> **预计工时**: 10.5 小时
> **当前状态**: 🟡 开发中 (4/7 已完成)
> **创建日期**: 2026-03-16
> **最后更新**: 2026-03-16

---

## 📋 需求概述

实现 Bots 页面的完整功能，包括 Bot 列表展示、Bot 操作、创建/编辑/删除 Bot 等。

---

## 🔗 相关链接

- **需求文档**: [需求文档.md](../需求文档.md#2.3-bot-管理-priority-p0)
- **缺失功能**: [缺失功能清单.md](../缺失功能清单.md#21-bots-页面)
- **老版本参考**: `D:\_workstation\ASF-ui\src\views\modals\Bot.vue`
- **新版本文件**: [src/views/Bots.vue](../../src/views/Bots.vue)

---

## ✅ 已完成

### BOTS-001: Bot Store 写操作实现

**状态**: ✅ 完成
**完成日期**: 2026-03-16
**实际工时**: 2h

**实现内容**:
- `src/stores/bots.ts` 中已实现以下方法：
  - `startBots()` - 调用 `POST /api/bot/{bots}/start`
  - `stopBots()` - 调用 `POST /api/bot/{bots}/stop`
  - `pauseBots()` - 调用 `POST /api/bot/{bots}/pause`
  - `resumeBots()` - 调用 `POST /api/bot/{bots}/resume`
  - `deleteBots()` - 调用 `DELETE /api/bot/{bots}`

**文件位置**: [src/stores/bots.ts](../../src/stores/bots.ts)

---

### BOTS-002: 创建 Bot API 对接

**状态**: ✅ 完成
**完成日期**: 2026-03-16
**实际工时**: 1h

**需求描述**:
实现创建 Bot 功能，对接真实 API。

**实施内容**:

1. **API 函数** - ✅ 已存在
   - `src/api/Bot/index.ts` 中的 `createBot()` 函数已实现

2. **修改 CreateBotDialog.vue** ✅ 完成
   - 添加了 `import { createBot } from '@/api/Bot'`
   - 添加了 `import { useBotsStore } from '@/stores/bots'`
   - 添加了 `const botsStore = useBotsStore()`
   - 更新了表单验证规则：
     - 添加名称不能为 "ASF" 的验证
     - 添加名称重复的验证
   - 替换了模拟代码为真实 API 调用
   - 添加了成功后刷新 Bot 列表
   - 添加了错误处理

3. **测试验证** ✅ 完成
   - 创建了 `tests/api/Bot.test.ts`
   - 8 个测试全部通过
   - 测试内容：
     - API 调用验证
     - 成功响应处理
     - 错误响应处理
     - 表单验证逻辑

**测试结果**:
```
✓ createBot API > should call POST /Bot/Bot with correct parameters
✓ createBot API > should return success response when API call succeeds
✓ createBot API > should return error response when API call fails
✓ createBot API > should handle Bot already exists error
✓ createBot - Form Validation Logic > should validate bot name format
✓ createBot - Form Validation Logic > should validate bot name is not ASF
✓ createBot - Form Validation Logic > should validate password minimum length
✓ createBot - Form Validation Logic > should validate all required fields
```

**相关文件**:
- [src/api/Bot/index.ts](../../src/api/Bot/index.ts)
- [src/components/CreateBotDialog.vue](../../src/components/CreateBotDialog.vue)
- [tests/api/Bot.test.ts](../../tests/api/Bot.test.ts)

---

### BOTS-003: 重命名 API 对接

**状态**: ✅ 完成
**完成日期**: 2026-03-16
**实际工时**: 0.5h

**需求描述**:
实现重命名 Bot 功能，对接真实 API。

**实施内容**:

1. **API 函数** - ✅ 已存在
   - `src/api/Bot/index.ts` 中的 `renameBot()` 函数已实现

2. **修改 Bots.vue** ✅ 完成
   - 添加了 `import { renameBot } from '@/api/Bot'`
   - 修复了变量命名冲突（`renameBot` ref → `botToRename` ref）
   - 更新了 `handleConfirmRename()` 方法：
     - 添加名称格式验证（只能包含字母、数字、下划线、短横线）
     - 添加名称不能为 "ASF" 的验证
     - 添加名称不能已存在的验证
     - 替换模拟代码为真实 API 调用
     - 添加成功后刷新 Bot 列表
     - 添加错误处理

3. **测试验证** ✅ 完成
   - 创建了 `tests/api/Bot-rename.test.ts`
   - 9 个测试全部通过
   - 测试内容：
     - API 调用验证
     - 成功响应处理
     - 错误响应处理
     - 表单验证逻辑

**测试结果**:
```
✓ renameBot API > should call POST /Bot/{oldName}/Rename with correct parameters
✓ renameBot API > should return success response when API call succeeds
✓ renameBot API > should return error response when API call fails
✓ renameBot API > should handle Bot already exists error
✓ renameBot API > should handle invalid bot name error
✓ renameBot - Form Validation Logic > should validate bot name format
✓ renameBot - Form Validation Logic > should validate bot name is not ASF
✓ renameBot - Form Validation Logic > should validate trimmed name
✓ renameBot - Form Validation Logic > should validate old and new names are different
```

**相关文件**:
- [src/api/Bot/index.ts](../../src/api/Bot/index.ts)
- [src/views/Bots.vue](../../src/views/Bots.vue)
- [tests/api/Bot-rename.test.ts](../../tests/api/Bot-rename.test.ts)

---

### BOTS-004: 删除 API 对接

**状态**: ✅ 完成
**完成日期**: 2026-03-16
**实际工时**: 0.5h

**需求描述**:
实现删除 Bot 功能（单个和批量），对接真实 API。

**实施内容**:

1. **API 函数** - ✅ 已存在
   - `src/api/Bot/index.ts` 中的 `deleteBot()` 函数已实现

2. **修改 Bots.vue** ✅ 完成
   - 添加了 `import { deleteBot } from '@/api/Bot'`
   - 更新了 `handleDeleteBot()` 方法：
     - 替换模拟代码为真实 API 调用
     - 添加成功后刷新 Bot 列表
     - 添加错误处理（包括用户取消的判断）
   - 更新了 `handleBatchDelete()` 方法：
     - 过滤空值 Bot 名称
     - 调用真实 API 进行批量删除
     - 添加成功后刷新 Bot 列表并清空选中
     - 添加错误处理

3. **测试验证** ✅ 完成
   - 创建了 `tests/api/Bot-delete.test.ts`
   - 10 个测试全部通过
   - 测试内容：
     - API 调用验证（单个和多个）
     - 成功响应处理
     - 错误响应处理
     - 表单验证逻辑（过滤空值、逗号分隔）

**测试结果**:
```
✓ deleteBot API > should call DELETE /Bot/{botNames} with correct parameters
✓ deleteBot API > should call DELETE with single bot name
✓ deleteBot API > should return success response when API call succeeds
✓ deleteBot API > should return error response when API call fails
✓ deleteBot API > should handle bot not found error
✓ deleteBot API > should handle partial deletion success
✓ deleteBot - Form Validation Logic > should handle empty bot names array
✓ deleteBot - Form Validation Logic > should filter out empty bot names
✓ deleteBot - Form Validation Logic > should construct comma-separated bot names
✓ deleteBot - Form Validation Logic > should handle special characters in bot names
```

**相关文件**:
- [src/api/Bot/index.ts](../../src/api/Bot/index.ts)
- [src/views/Bots.vue](../../src/views/Bots.vue)
- [tests/api/Bot-delete.test.ts](../../tests/api/Bot-delete.test.ts)

---

## ⏸️ 待开始

### BOTS-005: Bot 详情弹窗增强

**状态**: ⏸️ 待开始
**预计工时**: 4h

**需求描述**:
增强 Bot 详情弹窗，添加游戏列表、钱包信息、多标签页布局。

**参考老版本**:
- `D:\_workstation\ASF-ui\src\views\modals\Bot.vue`
- `D:\_workstation\ASF-ui\src\components\Bot\Games.vue`

**实施步骤**:

1. **添加游戏列表组件** (1.5h)
   ```vue
   <!-- src/components/BotGames.vue -->
   <template>
     <div class="bot-games">
       <div v-for="game in games" :key="game.AppID" class="game-item">
         <img :src="game.IconUrl" :alt="game.GameName">
         <div class="game-info">
           <div class="game-name">{{ game.GameName }}</div>
           <div class="game-cards">{{ game.CardsRemaining }} 卡片</div>
         </div>
       </div>
     </div>
   </template>
   ```

2. **添加钱包信息** (0.5h)
   ```vue
   <div class="wallet-info">
     <span class="wallet-label">钱包余额:</span>
     <span class="wallet-value">{{ bot.WalletInfo || '-' }}</span>
   </div>
   ```

3. **多标签页布局** (2h)
   ```vue
   <el-tabs v-model="activeTab">
     <el-tab-pane label="概览" name="overview">
       <!-- 基本信息 + 游戏列表 -->
     </el-tab-pane>
     <el-tab-pane label="配置" name="config">
       <!-- 配置编辑 -->
     </el-tab-pane>
     <el-tab-pane label="2FA" name="2fa">
       <!-- 2FA 管理 -->
     </el-tab-pane>
     <el-tab-pane label="BGR" name="bgr">
       <!-- BGR 管理 -->
     </el-tab-pane>
   </el-tabs>
   ```

**相关文件**:
- [src/components/BotDetailDialog.vue](../../src/components/BotDetailDialog.vue)
- 新建: [src/components/BotGames.vue](../../src/components/BotGames.vue)

---

### BOTS-006: Bot 复制功能

**状态**: ⏸️ 待开始
**预计工时**: 1h

**参考老版本**: `D:\_workstation\ASF-ui\src\views\modals\BotCopy.vue`

**API 接口**:
```typescript
// POST /api/bot/{source}/copy
interface CopyRequest {
  TargetBot: string
}
```

**实施步骤**:
1. 创建 `BotCopyDialog.vue` 组件
2. 表单：目标 Bot 名称
3. 复制时排除：BotName, SteamLogin, SteamPassword
4. 添加验证：目标名称不能为 ASF、不能重复

---

### BOTS-007: Bot 输入处理

**状态**: ⏸️ 待开始
**预计工时**: 2h

**参考老版本**: `D:\_workstation\ASF-ui\src\views\modals\BotInput.vue`

**需求描述**:
当 Bot 需要用户输入时（如 SteamGuard 代码、密码、家长控制码），显示输入界面。

**支持的输入类型**:
- `DeviceID` - 设备 ID
- `Login` - 账号
- `Password` - 密码
- `SteamGuard` - Steam Guard 代码
- `SteamParentalCode` - 家长控制代码
- `TwoFactorAuthentication` - 2FA 代码

**API 接口**:
```typescript
// POST /api/bot/{bot}/input
interface InputRequest {
  InputType: string
  Value: string
}
```

---

## 📝 实施笔记

### 2026-03-16

**进度更新**:
- ✅ Bot Store 写操作已确认完成 (BOTS-001)
- ✅ 创建 Bot API 对接完成 (BOTS-002)
- ✅ 重命名 Bot API 对接完成 (BOTS-003)
- ✅ 删除 Bot API 对接完成 (BOTS-004)
- 🟡 总计 4/7 任务已完成，实际工时: 4h / 预计 10.5h

**发现的问题**:
1. `CreateBotDialog.vue` 使用简化表单，老版本使用 ConfigEditor 动态表单
2. 需要考虑是否先实现 ConfigEditor 组件系统
3. 变量命名冲突：`renameBot` 函数与 ref 变量同名 → 已修复，重命名为 `botToRename`

**技术决策**:
- 暂时使用简化表单实现创建 Bot
- ConfigEditor 作为独立任务（CONF-001 ~ CONF-005）后续实现

**测试覆盖**:
- API 测试文件: `tests/api/Bot.test.ts` (8 个测试通过)
- API 测试文件: `tests/api/Bot-rename.test.ts` (9 个测试通过)
- API 测试文件: `tests/api/Bot-delete.test.ts` (10 个测试通过)
- 总计 27 个测试全部通过 ✅

---

## 🔗 相关任务

| 任务编号 | 任务名称 | 状态 | 依赖关系 |
|----------|----------|------|----------|
| CONF-001 | Schema 加载工具 | ⏸️ 待开始 | 无 |
| CONF-002 | 参数描述加载 | ⏸️ 待开始 | 无 |
| CONF-003 | ConfigEditor 主组件 | ⏸️ 待开始 | CONF-001, CONF-002 |
| 2FA-001 | maFile 导入 | ⏸️ 待开始 | 无 |
| BGR-001 | BGR 状态加载 | ⏸️ 待开始 | 无 |

---

## ✅ 验收标准

- [x] 能够创建新 Bot
- [x] 能够重命名 Bot
- [x] 能够删除 Bot（单个和批量）
- [ ] 能够复制 Bot
- [ ] Bot 详情弹窗显示完整信息
- [ ] 支持 Bot 输入处理
- [x] 所有操作有正确的错误处理
- [x] 所有操作有成功/失败提示
