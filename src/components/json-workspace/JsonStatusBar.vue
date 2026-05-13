<script setup lang="ts">
import { AlertTriangle, CheckCircle2, FileText, Hash } from 'lucide-vue-next'

interface Props {
  characterCount: number
  error: string | null
  isValid: boolean
  summary: string
}

const props = defineProps<Props>()
</script>

<template>
  <footer class="json-status" aria-live="polite">
    <span
      class="json-status__badge"
      :class="props.isValid ? 'json-status__badge--valid' : 'json-status__badge--invalid'"
    >
      <CheckCircle2 v-if="props.isValid" class="json-status__icon" aria-hidden="true" />
      <AlertTriangle v-else class="json-status__icon" aria-hidden="true" />
      {{ props.isValid ? '有效 JSON' : '存在错误' }}
    </span>

    <span class="json-status__item">
      <FileText class="json-status__icon" aria-hidden="true" />
      {{ props.summary }}
    </span>

    <span class="json-status__item">
      <Hash class="json-status__icon" aria-hidden="true" />
      {{ props.characterCount }} 字符
    </span>

    <span v-if="props.error" class="json-status__error">
      <AlertTriangle class="json-status__icon" aria-hidden="true" />
      {{ props.error }}
    </span>
  </footer>
</template>

<style scoped>
.json-status {
  display: flex;
  min-height: 40px;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 7px 12px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
}

.json-status__badge,
.json-status__item,
.json-status__error {
  display: inline-flex;
  min-height: 26px;
  align-items: center;
  gap: 6px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  line-height: 1.2;
}

.json-status__badge {
  padding: 3px 8px;
  font-weight: 800;
}

.json-status__badge--valid {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.json-status__badge--invalid {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.json-status__item {
  color: var(--color-text-muted);
}

.json-status__error {
  color: var(--color-danger);
  font-weight: 700;
}

.json-status__icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  stroke-width: 2.2;
}
</style>
