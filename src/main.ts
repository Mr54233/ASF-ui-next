import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Element Plus Icons - 只导入实际使用的图标
import {
  Fold,
  RefreshRight,
  CircleClose,
  User,
  Timer,
  Grid,
  VideoPlay,
  Monitor,
  Document,
  Setting,
  House,
  CircleCheckFilled,
  CopyDocument,
  Clock,
  Delete,
  QuestionFilled,
  VideoPause,
  ArrowUp,
  ArrowRight,
  WarningFilled,
  ChatDotRound,
  Sunny,
  Moon,
} from '@element-plus/icons-vue'

// Element Plus 深色模式
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/theme-dark.css'

import App from './App.vue'
import router from './router'
import 'virtual:uno.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)
app.use(pinia)
app.use(router)

// 注册 Element Plus Icons（具名注册）
app.component('Fold', Fold)
app.component('RefreshRight', RefreshRight)
app.component('CircleClose', CircleClose)
app.component('User', User)
app.component('Timer', Timer)
app.component('Grid', Grid)
app.component('VideoPlay', VideoPlay)
app.component('Monitor', Monitor)
app.component('Document', Document)
app.component('Setting', Setting)
app.component('House', House)
app.component('CircleCheckFilled', CircleCheckFilled)
app.component('CopyDocument', CopyDocument)
app.component('Clock', Clock)
app.component('Delete', Delete)
app.component('QuestionFilled', QuestionFilled)
app.component('VideoPause', VideoPause)
app.component('ArrowUp', ArrowUp)
app.component('ArrowRight', ArrowRight)
app.component('WarningFilled', WarningFilled)
app.component('ChatDotRound', ChatDotRound)
app.component('Sunny', Sunny)
app.component('Moon', Moon)

app.mount('#app')
