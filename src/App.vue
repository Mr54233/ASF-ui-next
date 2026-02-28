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
#app {
  min-height: 100vh;
  background-color: #0a0a0a;
}
</style>
