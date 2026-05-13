import { computed, onBeforeUnmount, onMounted, readonly, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'

interface UseResizablePanelsOptions {
  initialPercent?: number
  minPanelWidth?: number
  minPercent?: number
  maxPercent?: number
  separatorWidth?: number
}

const DEFAULT_OPTIONS = {
  initialPercent: 56,
  minPanelWidth: 360,
  minPercent: 28,
  maxPercent: 72,
  separatorWidth: 10,
} satisfies Required<UseResizablePanelsOptions>

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function useResizablePanels(
  containerRef: Readonly<ShallowRef<HTMLElement | null>>,
  options: UseResizablePanelsOptions = {},
) {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  const panelPercent = shallowRef(resolvedOptions.initialPercent)
  const isResizing = shallowRef(false)
  const separatorMin = shallowRef(resolvedOptions.minPercent)
  const separatorMax = shallowRef(resolvedOptions.maxPercent)

  let previousBodyCursor = ''
  let previousBodyUserSelect = ''

  const gridStyle = computed<Record<string, string>>(() => ({
    '--editor-panel-width': `${panelPercent.value}%`,
  }))

  const separatorValue = computed(() => Math.round(panelPercent.value))

  function getResizeBounds() {
    const container = containerRef.value
    const width = container?.getBoundingClientRect().width ?? 0

    if (!width) {
      return {
        max: resolvedOptions.maxPercent,
        min: resolvedOptions.minPercent,
      }
    }

    const minByWidth = (resolvedOptions.minPanelWidth / width) * 100
    const maxByWidth =
      ((width - resolvedOptions.separatorWidth - resolvedOptions.minPanelWidth) / width) * 100
    const min = Math.max(resolvedOptions.minPercent, minByWidth)
    const max = Math.min(resolvedOptions.maxPercent, maxByWidth)

    if (min > max) {
      return {
        max: 50,
        min: 50,
      }
    }

    return { max, min }
  }

  function syncBounds() {
    const bounds = getResizeBounds()

    separatorMin.value = Math.round(bounds.min)
    separatorMax.value = Math.round(bounds.max)
    panelPercent.value = clamp(panelPercent.value, bounds.min, bounds.max)
  }

  function setPanelPercentFromClientX(clientX: number) {
    const container = containerRef.value

    if (!container) {
      return
    }

    const bounds = getResizeBounds()
    const rect = container.getBoundingClientRect()
    const nextPercent = ((clientX - rect.left) / rect.width) * 100

    panelPercent.value = clamp(nextPercent, bounds.min, bounds.max)
  }

  function handleResizeMove(event: PointerEvent) {
    event.preventDefault()
    setPanelPercentFromClientX(event.clientX)
  }

  function stopResize() {
    if (!isResizing.value) {
      return
    }

    isResizing.value = false
    document.body.style.cursor = previousBodyCursor
    document.body.style.userSelect = previousBodyUserSelect
    window.removeEventListener('pointermove', handleResizeMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
    window.removeEventListener('blur', stopResize)
  }

  function startResize(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    event.preventDefault()
    syncBounds()
    setPanelPercentFromClientX(event.clientX)
    isResizing.value = true
    previousBodyCursor = document.body.style.cursor
    previousBodyUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handleResizeMove)
    window.addEventListener('pointerup', stopResize)
    window.addEventListener('pointercancel', stopResize)
    window.addEventListener('blur', stopResize)
  }

  function resizeByStep(step: number) {
    const bounds = getResizeBounds()

    panelPercent.value = clamp(panelPercent.value + step, bounds.min, bounds.max)
    syncBounds()
  }

  function handleSeparatorKeydown(event: KeyboardEvent) {
    const step = event.shiftKey ? 5 : 2

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      resizeByStep(-step)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      resizeByStep(step)
    }

    if (event.key === 'Home') {
      event.preventDefault()
      const bounds = getResizeBounds()
      panelPercent.value = bounds.min
      syncBounds()
    }

    if (event.key === 'End') {
      event.preventDefault()
      const bounds = getResizeBounds()
      panelPercent.value = bounds.max
      syncBounds()
    }
  }

  onMounted(() => {
    syncBounds()
    window.addEventListener('resize', syncBounds)
  })

  onBeforeUnmount(() => {
    stopResize()
    window.removeEventListener('resize', syncBounds)
  })

  return {
    gridStyle,
    handleSeparatorKeydown,
    isResizing: readonly(isResizing),
    separatorMax: readonly(separatorMax),
    separatorMin: readonly(separatorMin),
    separatorValue,
    startResize,
  }
}
