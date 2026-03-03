<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  // 应用暗色主题
  settingsStore.applyTheme()
})
</script>

<template>
  <router-view />
</template>
<style lang="less">
/* App.vue 中的 #app 样式已被 main.css 统一管理 */
/* 这里只保留页面级别的特定样式（如有） */
</style>
