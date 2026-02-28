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
} from '@element-plus/icons-vue'

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

app.mount('#app')
