<script setup lang="ts">
import { Check, Copy, FileText, Sparkles, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  canCopy: boolean
  copyState: 'idle' | 'done' | 'failed'
}

interface Emits {
  clear: []
  copy: []
  format: []
  loadSample: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const copyLabel = computed(() => {
  if (props.copyState === 'done') {
    return '已复制'
  }

  if (props.copyState === 'failed') {
    return '复制失败'
  }

  return '复制'
})
</script>

<template>
  <div class="json-toolbar" role="toolbar" aria-label="JSON 操作">
    <button
      class="json-toolbar__button json-toolbar__button--primary"
      type="button"
      title="格式化 JSON"
      aria-label="格式化 JSON"
      @click="emit('format')"
    >
      <Sparkles class="json-toolbar__icon" aria-hidden="true" />
      <span>格式化</span>
    </button>

    <button
      class="json-toolbar__button"
      type="button"
      title="载入示例"
      aria-label="载入示例"
      @click="emit('loadSample')"
    >
      <FileText class="json-toolbar__icon" aria-hidden="true" />
      <span>示例</span>
    </button>

    <button
      class="json-toolbar__button"
      type="button"
      title="清空当前 JSON"
      aria-label="清空当前 JSON"
      @click="emit('clear')"
    >
      <Trash2 class="json-toolbar__icon" aria-hidden="true" />
      <span>清空</span>
    </button>

    <button
      class="json-toolbar__button"
      :class="{ 'json-toolbar__button--success': props.copyState === 'done' }"
      type="button"
      title="复制格式化预览"
      aria-label="复制格式化预览"
      :disabled="!props.canCopy"
      @click="emit('copy')"
    >
      <Check v-if="props.copyState === 'done'" class="json-toolbar__icon" aria-hidden="true" />
      <Copy v-else class="json-toolbar__icon" aria-hidden="true" />
      <span>{{ copyLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.json-toolbar {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-toolbar);
}

.json-toolbar__button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.json-toolbar__button:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-primary-strong);
}

.json-toolbar__button:active:not(:disabled) {
  background: var(--color-surface-pressed);
}

.json-toolbar__button--primary {
  border-color: var(--color-primary-border);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.json-toolbar__button--success {
  border-color: var(--color-success-border);
  background: var(--color-success-soft);
  color: var(--color-success);
}

.json-toolbar__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  stroke-width: 2;
}

@media (max-width: 700px) {
  .json-toolbar {
    width: 100%;
    justify-content: flex-start;
  }

  .json-toolbar__button {
    flex: 1 1 108px;
  }
}
</style>
