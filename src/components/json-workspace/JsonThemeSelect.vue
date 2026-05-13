<script setup lang="ts">
import { Palette } from 'lucide-vue-next'
import type { JsonEditorTheme, JsonEditorThemeOption } from '../../composables/useJsonEditorTheme'

interface Props {
  options: readonly JsonEditorThemeOption[]
}

const model = defineModel<JsonEditorTheme>({ required: true })
const props = defineProps<Props>()
</script>

<template>
  <label class="json-theme-select" title="切换编辑器主题">
    <Palette class="json-theme-select__icon" aria-hidden="true" />
    <span class="json-theme-select__label">主题</span>
    <select v-model="model" class="json-theme-select__control" aria-label="切换编辑器主题">
      <option
        v-for="option in props.options"
        :key="option.value"
        :value="option.value"
        :title="option.hint"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.json-theme-select {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-toolbar);
  color: var(--color-text);
}

.json-theme-select__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  color: var(--color-primary-strong);
  stroke-width: 2;
}

.json-theme-select__label {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.json-theme-select__control {
  min-width: 116px;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font-size: 0.86rem;
  font-weight: 760;
  outline: 0;
}

.json-theme-select__control:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .json-theme-select {
    flex: 1 1 120px;
    justify-content: center;
  }
}
</style>
