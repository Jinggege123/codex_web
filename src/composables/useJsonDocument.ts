import { computed, shallowRef } from 'vue'
import type { JsonDocument, JsonValue } from '../types/json'
import { getJsonSummary, parseJsonText, stringifyJson } from '../utils/json'

const starterJson: JsonValue = {
  meta: {
    service: 'json-editor-vue-demo',
    updatedAt: '2026-05-13T11:50:00+08:00',
    environment: 'local',
  },
  data: [
    {
      id: 1001,
      name: '订单同步任务',
      enabled: true,
      retries: 3,
      tags: ['api', 'debug', 'preview'],
    },
    {
      id: 1002,
      name: '配置校验任务',
      enabled: false,
      retries: 1,
      tags: ['schema', 'lint'],
    },
  ],
}

export function useJsonDocument() {
  const documentValue = shallowRef<JsonDocument>(starterJson)
  const parseError = shallowRef<string | null>(null)
  const copyState = shallowRef<'idle' | 'done' | 'failed'>('idle')

  const previewText = computed(() => stringifyJson(documentValue.value))
  const documentSummary = computed(() => getJsonSummary(documentValue.value))
  const characterCount = computed(() => previewText.value.length)
  const isValid = computed(() => parseError.value === null)

  function setDocumentValue(value: unknown) {
    documentValue.value = value as JsonDocument
    parseError.value = null
    copyState.value = 'idle'
  }

  function loadSample() {
    documentValue.value = structuredClone(starterJson)
    parseError.value = null
    copyState.value = 'idle'
  }

  function clearDocument() {
    documentValue.value = {}
    parseError.value = null
    copyState.value = 'idle'
  }

  function formatDocument() {
    try {
      const formatted = stringifyJson(documentValue.value)

      if (!formatted) {
        documentValue.value = {}
        parseError.value = null
        return
      }

      documentValue.value = parseJsonText(formatted)
      parseError.value = null
      copyState.value = 'idle'
    } catch (error) {
      parseError.value = error instanceof Error ? error.message : 'JSON 格式化失败'
    }
  }

  async function copyPreview() {
    try {
      await navigator.clipboard.writeText(previewText.value)
      copyState.value = 'done'
    } catch {
      copyState.value = 'failed'
    }
  }

  return {
    characterCount,
    copyPreview,
    copyState,
    clearDocument,
    documentSummary,
    documentValue,
    formatDocument,
    isValid,
    loadSample,
    parseError,
    previewText,
    setDocumentValue,
  }
}
