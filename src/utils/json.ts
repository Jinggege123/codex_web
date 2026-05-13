import type { JsonDocument, JsonValue } from '../types/json'

export function stringifyJson(value: JsonDocument, spaces = 2): string {
  if (value === undefined) {
    return ''
  }

  return JSON.stringify(value, null, spaces)
}

export function parseJsonText(text: string): JsonValue {
  return JSON.parse(text) as JsonValue
}

export function getJsonSummary(value: JsonDocument): string {
  if (value === undefined) {
    return '空文档'
  }

  if (Array.isArray(value)) {
    return `${value.length} 个数组项`
  }

  if (value !== null && typeof value === 'object') {
    return `${Object.keys(value).length} 个顶层字段`
  }

  return `JSON ${typeof value}`
}
