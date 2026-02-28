<template>
  <div class="about-page">
    <el-result icon="success" title="ASF UI Next" sub-title="ArchiSteamFarm Web 界面">
      <template #extra>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="版本">v0.1.0</el-descriptions-item>
          <el-descriptions-item label="框架">Vue 3 + Element Plus</el-descriptions-item>
          <el-descriptions-item label="状态">开发中</el-descriptions-item>
        </el-descriptions>
      </template>

      <template #extra>
        <div class="links">
          <el-link href="https://github.com/JustArchiNET/ArchiSteamFarm" target="_blank">
            <el-icon><Link /></el-icon>
            ASF 官方仓库
          </el-link>
          <el-divider direction="vertical" />
          <el-link href="https://github.com/Mr54233/ASF-ui-next" target="_blank">
            <el-icon><Link /></el-icon>
            本项目仓库
          </el-link>
        </div>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { Link } from '@element-plus/icons-vue'
</script>

<style scoped lang="less">
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.links {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
</style>
