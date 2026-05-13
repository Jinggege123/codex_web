<script setup lang="ts">
import JsonEditorVue from 'json-editor-vue'
import { Mode } from 'vanilla-jsoneditor'
import { useTemplateRef } from 'vue'
import JsonStatusBar from './JsonStatusBar.vue'
import JsonThemeSelect from './JsonThemeSelect.vue'
import JsonToolbar from './JsonToolbar.vue'
import { useJsonEditorChineseLocale } from '../../composables/useJsonEditorChineseLocale'
import { useJsonDocument } from '../../composables/useJsonDocument'
import { useJsonEditorTheme } from '../../composables/useJsonEditorTheme'
import { useResizablePanels } from '../../composables/useResizablePanels'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'

const {
  characterCount,
  clearDocument,
  copyPreview,
  copyState,
  documentSummary,
  documentValue,
  formatDocument,
  isValid,
  loadSample,
  parseError,
  previewText,
  setDocumentValue,
} = useJsonDocument()

const workspaceElement = useTemplateRef<HTMLElement>('workspace')
const splitGridElement = useTemplateRef<HTMLElement>('splitGrid')
const { localizeContextMenu, localizeMenu } = useJsonEditorChineseLocale(workspaceElement)
const { editorThemeClass, editorThemeStyle, previewThemeStyle, selectedTheme, themeOptions } =
  useJsonEditorTheme()
const {
  gridStyle,
  handleSeparatorKeydown,
  isResizing,
  separatorMax,
  separatorMin,
  separatorValue,
  startResize,
} = useResizablePanels(splitGridElement)
</script>

<template>
  <section ref="workspace" class="json-workspace" aria-label="JSON 在线编辑预览工作区">
    <header class="json-workspace__topbar">
      <div class="json-workspace__title-group">
        <span class="json-workspace__eyebrow">工作区</span>
        <h2 class="json-workspace__title">编辑与预览</h2>
        <p class="json-workspace__hint">左侧维护结构，右侧同步格式化输出</p>
      </div>

      <div class="json-workspace__actions">
        <JsonThemeSelect v-model="selectedTheme" :options="themeOptions" />
        <JsonToolbar
          :can-copy="previewText.length > 0"
          :copy-state="copyState"
          @clear="clearDocument"
          @copy="copyPreview"
          @format="formatDocument"
          @load-sample="loadSample"
        />
      </div>
    </header>

    <div
      ref="splitGrid"
      class="json-workspace__grid"
      :class="{ 'json-workspace__grid--resizing': isResizing }"
      :style="gridStyle"
    >
      <section class="json-workspace__panel" aria-labelledby="editor-title">
        <div class="json-workspace__panel-header">
          <div class="json-workspace__panel-heading">
            <span class="json-workspace__panel-kicker">输入</span>
            <h3 id="editor-title" class="json-workspace__panel-title">JSON 编辑器</h3>
          </div>
          <span class="json-workspace__panel-note">树形 / 文本 / 表格</span>
        </div>

        <div class="json-workspace__editor">
          <JsonEditorVue
            class="json-workspace__editor-widget"
            :class="editorThemeClass"
            :style="editorThemeStyle"
            :model-value="documentValue"
            :mode="Mode.tree"
            :on-render-context-menu="localizeContextMenu"
            :on-render-menu="localizeMenu"
            :main-menu-bar="true"
            :navigation-bar="true"
            :status-bar="true"
            :stringified="false"
            @update:model-value="setDocumentValue"
          />
        </div>
      </section>

      <button
        class="json-workspace__separator"
        type="button"
        role="separator"
        aria-label="调整编辑器和预览区宽度"
        aria-orientation="vertical"
        :aria-valuemin="separatorMin"
        :aria-valuemax="separatorMax"
        :aria-valuenow="separatorValue"
        @keydown="handleSeparatorKeydown"
        @pointerdown="startResize"
      >
        <span class="json-workspace__separator-line"></span>
      </button>

      <section class="json-workspace__panel" aria-labelledby="preview-title">
        <div class="json-workspace__panel-header">
          <div class="json-workspace__panel-heading">
            <span class="json-workspace__panel-kicker">预览</span>
            <h3 id="preview-title" class="json-workspace__panel-title">格式化输出</h3>
          </div>
          <span class="json-workspace__panel-note">只读</span>
        </div>

        <pre
          class="json-workspace__preview"
          :style="previewThemeStyle"
          tabindex="0"
        ><code>{{ previewText }}</code></pre>
      </section>
    </div>

    <JsonStatusBar
      :character-count="characterCount"
      :error="parseError"
      :is-valid="isValid"
      :summary="documentSummary"
    />
  </section>
</template>

<style scoped>
.json-workspace {
  display: flex;
  overflow: hidden;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.json-workspace__topbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 10px 12px 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
}

.json-workspace__title-group {
  display: grid;
  min-width: 260px;
  gap: 2px;
}

.json-workspace__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.json-workspace__eyebrow {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.1;
}

.json-workspace__title,
.json-workspace__panel-title {
  margin: 0;
  color: var(--color-text);
  letter-spacing: 0;
}

.json-workspace__title {
  font-size: 1rem;
  font-weight: 820;
  line-height: 1.25;
}

.json-workspace__hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  line-height: 1.35;
}

.json-workspace__grid {
  display: grid;
  min-height: 0;
  flex: 1;
  background: var(--color-border);
  grid-template-columns:
    minmax(360px, var(--editor-panel-width, 56%)) 10px
    minmax(360px, 1fr);
  gap: 0;
}

.json-workspace__grid--resizing {
  cursor: col-resize;
}

.json-workspace__panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: var(--color-surface);
}

.json-workspace__separator {
  position: relative;
  z-index: 2;
  width: 10px;
  min-width: 10px;
  min-height: 0;
  padding: 0;
  border: 0;
  border-right: 1px solid var(--color-border-strong);
  border-left: 1px solid var(--color-border-strong);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(216, 224, 221, 0.7)),
    var(--color-surface-muted);
  cursor: col-resize;
}

.json-workspace__separator::before {
  position: absolute;
  inset: 0 -8px;
  content: '';
}

.json-workspace__separator-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 46px;
  border-radius: 999px;
  background: var(--color-border-strong);
  box-shadow:
    -3px 0 0 rgba(95, 111, 106, 0.22),
    3px 0 0 rgba(95, 111, 106, 0.22);
  transform: translate(-50%, -50%);
  transition:
    background-color 140ms ease,
    box-shadow 140ms ease,
    height 140ms ease;
}

.json-workspace__separator:hover .json-workspace__separator-line,
.json-workspace__separator:focus-visible .json-workspace__separator-line,
.json-workspace__grid--resizing .json-workspace__separator-line {
  height: 72px;
  background: var(--color-primary-strong);
  box-shadow:
    -3px 0 0 rgba(15, 118, 110, 0.24),
    3px 0 0 rgba(15, 118, 110, 0.24);
}

.json-workspace__separator:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: -2px;
}

.json-workspace__panel-header {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-raised);
}

.json-workspace__panel-heading {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.json-workspace__panel-kicker {
  color: var(--color-text-subtle);
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 1.1;
}

.json-workspace__panel-title {
  font-size: 0.9rem;
  font-weight: 820;
  line-height: 1.3;
}

.json-workspace__panel-note {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 3px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.json-workspace__editor {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background: var(--color-editor-bg);
}

.json-workspace__editor-widget {
  height: 100%;
  min-height: 0;
}

.json-workspace__preview {
  min-height: 0;
  flex: 1;
  margin: 0;
  overflow: auto;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.62;
  tab-size: 2;
  white-space: pre-wrap;
}

.json-workspace__preview:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: -3px;
}

.json-workspace__preview code {
  font-family: inherit;
}

@media (max-width: 900px) {
  .json-workspace__topbar {
    align-items: stretch;
    flex-direction: column;
  }

  .json-workspace__title-group {
    min-width: 0;
  }

  .json-workspace__actions {
    justify-content: flex-start;
  }

  .json-workspace__grid {
    overflow: auto;
    grid-template-columns: 1fr;
  }

  .json-workspace__separator {
    display: none;
  }

  .json-workspace__panel {
    min-height: 480px;
  }
}

@media (max-width: 560px) {
  .json-workspace__topbar {
    padding: 10px;
  }

  .json-workspace__panel-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px;
  }

  .json-workspace__grid,
  .json-workspace__editor,
  .json-workspace__editor-widget,
  .json-workspace__preview {
    min-height: 0;
  }
}
</style>
