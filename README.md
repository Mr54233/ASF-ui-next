# ASF UI Next

基于 Vue 3 + Element Plus 的 ArchiSteamFarm Web 界面

## 特性

- 🚀 **现代化技术栈**：Vue 3 + TypeScript + Vite
- 🎨 **暗色/亮色主题**：支持跟随系统自动切换
- 📱 **响应式设计**：完美适配移动端、平板、桌面
- 🔐 **认证系统**：安全的登录与路由守卫
- 🤖 **Bot 管理**：完整的 Bot 列表、详情、批量操作
- 🎮 **命令控制台**：命令执行与历史记录
- 📜 **日志查看**：实时日志浏览与导出
- ⚙️ **配置编辑器**：可视化编辑 ASF 配置
- 🎁 **BGR 后台兑换**：Key 管理与兑换功能
- 📊 **Dashboard**：数据概览与统计图表

## 技术栈

### 核心框架
- Vue 3 - 渐进式 JavaScript 框架
- TypeScript - 类型安全的 JavaScript 超集
- Vite - 下一代前端构建工具

### UI 组件
- Element Plus - Vue 3 组件库
- UnoCSS - 原子化 CSS 引擎
- ECharts - 数据可视化库

### 状态管理
- Pinia - Vue 状态管理库
- pinia-plugin-persistedstate - Pinia 持久化插件

### 工具库
- Axios - HTTP 客户端
- MockJS - 模拟数据生成

### 开发工具
- ESLint - 代码检查
- Prettier - 代码格式化
- Vitest - 单元测试框架

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 开发模式

\`\`\`bash
pnpm dev
\`\`\`

访问 http://localhost:5173

### 构建生产版本

\`\`\`bash
pnpm build
\`\`\`

### 类型检查

\`\`\`bash
pnpm type-check
\`\`\`

### 代码检查

\`\`\`bash
pnpm lint
\`\`\`

### 代码格式化

\`\`\`bash
pnpm format
\`\`\`

## 项目结构

\`\`\`
ASF-ui-next/
├── src/
│   ├── api/          # API 接口层
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── layouts/      # 布局组件
│   ├── router/       # 路由配置
│   ├── stores/       # 状态管理
│   ├── types/        # TypeScript 类型定义
│   └── views/        # 页面组件
├── public/           # 公共资源
├── mock/             # Mock 数据
└── tests/            # 测试文件
\`\`\`

## 功能模块

### P0 基础工程 (已完成)
- 项目初始化
- 路由配置
- 状态管理搭建
- API 层封装
- Mock 数据

### P1 布局框架 (已完成)
- 整体布局
- 侧边栏导航
- 统计数据展示
- Header 组件
- Dashboard 页面

### P2 认证系统 (已完成)
- 登录页面
- 路由守卫
- 状态持久化

### P3 Bot 管理 (已完成)
- Bot 列表
- Bot 详情
- Bot 创建/删除/重命名
- Bot 状态筛选
- Bot 批量操作

### P4 命令控制台 (已完成)
- 命令输入
- 历史记录
- 输出展示

### P5 BGR 后台兑换 (已完成)
- Key 管理
- 兑换功能

### P6 日志 (已完成)
- 日志查看
- 日志导出

### P7 配置编辑器 (已完成)
- 表单编辑
- JSON 编辑
- 配置保存

### P8 其他功能 (已完成)
- 关于页面
- 响应式优化
- 主题切换

### P9 收尾 (进行中)
- 代码优化
- 文档完善
- 最终测试
- 发布准备

## 开发规范

### 命名规范
- 组件：PascalCase（如 \`UserProfile.vue\`）
- 文件：kebab-case（如 \`user-profile.vue\`）
- 变量/函数：camelCase（如 \`getUserInfo\`）
- 常量：UPPER_SNAKE_CASE（如 \`API_BASE_URL\`）
- 类型/接口：PascalCase（如 \`UserInfo\`）

### Git 提交规范

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

**类型（type）：**
- \`feat\` - 新功能
- \`fix\` - Bug 修复
- \`docs\` - 文档更新
- \`style\` - 代码格式（不影响功能）
- \`refactor\` - 重构（既不是新功能也不是 Bug 修复）
- \`perf\` - 性能优化
- \`test\` - 测试相关
- \`chore\` - 构建/工具链相关

**作用域（scope）：**
- \`P0-P9\` - 里程碑编号
- \`组件名\` - 特定组件

**示例：**
\`\`\`
feat: P3-04 Bot 状态筛选功能

添加按状态筛选 Bot 的功能，支持下拉选择和快捷标签
\`\`\`

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License

## 相关链接

- [ArchiSteamFarm](https://github.com/JustArchiNET/ArchiSteamFarm) - ASF 官方仓库
- [Vue 3](https://vuejs.org/) - Vue 3 官方文档
- [Element Plus](https://element-plus.org/) - Element Plus 官方文档
- [Vite](https://vitejs.dev/) - Vite 官方文档

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

- 作者：54
- 邮箱：mrsoberey@gmail.com
- GitHub：[Mr54233/ASF-ui-next](https://github.com/Mr54233/ASF-ui-next)
