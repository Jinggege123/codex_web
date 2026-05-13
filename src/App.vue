<script setup lang="ts">
import { Braces, CheckCircle2, Server } from 'lucide-vue-next'
import JsonWorkspace from './components/json-workspace/JsonWorkspace.vue'
</script>

<template>
  <main class="app-shell">
    <header class="app-header" aria-labelledby="page-title">
      <div class="app-header__brand">
        <span class="app-header__mark" aria-hidden="true">
          <Braces class="app-header__mark-icon" />
        </span>
        <div class="app-header__copy">
          <h1 id="page-title" class="app-header__title">JSON 工作台</h1>
          <p class="app-header__description">在线编辑、校验和预览 JSON</p>
        </div>
      </div>

      <div class="app-header__meta" aria-label="工具状态">
        <span class="app-header__meta-item app-header__meta-item--active">
          <CheckCircle2 class="app-header__meta-icon" aria-hidden="true" />
          本地运行
        </span>
        <span class="app-header__meta-item">
          <Server class="app-header__meta-icon" aria-hidden="true" />
          json-editor-vue
        </span>
      </div>
    </header>

    <JsonWorkspace />
  </main>
</template>
