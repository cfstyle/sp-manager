<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { zhCn } from 'element-plus/es/locale/index.mjs';
</script>

<style>
/* Global resets if any */
</style>
