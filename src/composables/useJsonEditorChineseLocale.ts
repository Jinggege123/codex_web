import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import type { ShallowRef } from 'vue'
import type {
  ContextMenuColumn,
  ContextMenuItem,
  ContextMenuRow,
  MenuButton,
  MenuDropDownButton,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from 'vanilla-jsoneditor'

type LocalizableContextMenuItem = ContextMenuItem | ContextMenuColumn | ContextMenuRow | MenuLabel

const exactTranslations: Record<string, string> = {
  'A boolean': '布尔值',
  'A null': '空值',
  'A number': '数字',
  'A string': '字符串',
  'An empty array': '空数组',
  'An empty document': '空文档',
  'An object': '对象',
  'Object with nested arrays': '包含嵌套数组的对象',
  Apply: '应用',
  'Apply fixed JSON': '应用修复后的 JSON',
  'Auto repair': '自动修复',
  Cancel: '取消',
  'Cancel repair': '取消修复',
  Clear: '清除',
  Close: '关闭',
  Compact: '压缩',
  'Collapse all': '全部折叠',
  Copy: '复制',
  'Copy compacted': '复制压缩内容',
  'Copy formatted': '复制格式化内容',
  Cut: '剪切',
  'Cut compacted': '剪切压缩内容',
  'Cut formatted': '剪切格式化内容',
  Duplicate: '复制一份',
  Expand: '展开',
  'Expand all': '全部展开',
  Edit: '编辑',
  'Edit array': '编辑数组',
  'Edit key': '编辑键',
  'Edit object': '编辑对象',
  'Edit value': '编辑值',
  'Enforce string': '强制为字符串',
  Extract: '提取',
  Filter: '筛选',
  Format: '格式化',
  Insert: '插入',
  'Insert:': '插入：',
  'Insert after': '后面插入',
  'Insert before': '前面插入',
  'Leave as is': '保持原样',
  'No thanks': '不用了',
  Ok: '确定',
  Paste: '粘贴',
  'Paste as JSON instead': '改为按 JSON 粘贴',
  'Paste as string instead': '改为按字符串粘贴',
  Project: '投影',
  Redo: '重做',
  'Redo (Ctrl+Shift+Z)': '重做（Ctrl+Shift+Z）',
  Remove: '删除',
  Repair: '修复',
  'Repair manually': '手动修复',
  'Repair manually instead': '改为手动修复',
  Search: '搜索',
  'Search (Ctrl+F)': '搜索（Ctrl+F）',
  'Select a query language': '选择查询语言',
  'Show me': '定位错误',
  Sort: '排序',
  Array: '数组',
  Object: '对象',
  Structure: '结构',
  'Switch to tree mode': '切换到树形模式',
  'Tip: you can open this context menu via right-click or with Ctrl+Q':
    '提示：可以右键打开此菜单，也可以使用 Ctrl+Q',
  Transform: '转换',
  'Transform contents (filter, sort, project)': '转换内容（筛选、排序、投影）',
  Undo: '撤销',
  'Undo (Ctrl+Z)': '撤销（Ctrl+Z）',
  Value: '值',
  View: '查看',
  table: '表格',
  text: '文本',
  tree: '树形',
}

const phraseTranslations: Array<[RegExp, string]> = [
  [/\((\d+)\s+items?\)/g, '（$1 项）'],
  [/(\d+)\s+items/g, '$1 项'],
  [/(\d+)\s+item/g, '$1 项'],
  [/Convert to:/g, '转换为：'],
  [/Insert:/g, '插入：'],
  [/Edit the key \(Double-click on the key\)/g, '编辑键（双击键名）'],
  [/Edit the value \(Double-click on the value\)/g, '编辑值（双击值）'],
  [
    /Enforce keeping the value as string when it contains a numeric value/g,
    '当值包含数字时仍保持为字符串',
  ],
  [/Cut selected contents, formatted with indentation/g, '剪切所选内容，保留缩进格式'],
  [/Cut selected contents, without indentation/g, '剪切所选内容，压缩格式'],
  [/Duplicate selected contents/g, '复制所选内容一份'],
  [/Extract selected contents/g, '提取所选内容'],
  [/Sort array or object contents/g, '排序数组或对象内容'],
  [
    /Transform array or object contents \(filter, sort, project\)/g,
    '转换数组或对象内容（筛选、排序、投影）',
  ],
  [
    /Expand or collapse this object \(Ctrl\+Click to expand\/collapse recursively\)/g,
    '展开或折叠此对象（Ctrl+点击可递归展开/折叠）',
  ],
  [
    /Expand or collapse this array \(Ctrl\+Click to expand\/collapse recursively\)/g,
    '展开或折叠此数组（Ctrl+点击可递归展开/折叠）',
  ],
  [
    /Open context menu \(Click here, right click on the selection, or use the context menu button or Ctrl\+Q\)/g,
    '打开上下文菜单（点击这里、右键选择内容，或使用上下文菜单按钮 / Ctrl+Q）',
  ],
  [/Edit the selected path/g, '编辑当前选中路径'],
  [/Remove selected contents \(Delete\)/g, '删除所选内容（Delete）'],
  [/Insert: structure like the first item in the array/g, '插入：沿用数组第一项的结构'],
  [/Convert to: structure like the first item in the array/g, '转换为：沿用数组第一项的结构'],
  [/Insert: object/g, '插入：对象'],
  [/Insert: array/g, '插入：数组'],
  [/Insert: value/g, '插入：值'],
  [/Convert to: object/g, '转换为：对象'],
  [/Convert to: array/g, '转换为：数组'],
  [/Convert to: value/g, '转换为：值'],
  [
    /An object cannot be opened in table mode\. You can open a nested array instead, or open the\s+document in tree mode\./g,
    '对象不能直接在表格模式中打开。你可以打开其中的嵌套数组，或切换到树形模式。',
  ],
  [
    /An empty document cannot be opened in table mode\. You can go to tree mode instead, or paste\s+a JSON Array using/g,
    '空文档不能在表格模式中打开。你可以切换到树形模式，或粘贴一个 JSON 数组（',
  ],
  [
    /An object cannot be opened in table mode\. You can open the document in tree mode instead\./g,
    '对象不能在表格模式中打开。你可以切换到树形模式。',
  ],
  [
    /An empty array cannot be opened in table mode\. You can open the document in tree mode instead\./g,
    '空数组不能在表格模式中打开。你可以切换到树形模式。',
  ],
  [
    /A string cannot be opened in table mode\. You can open the document in tree mode instead\./g,
    '字符串不能在表格模式中打开。你可以切换到树形模式。',
  ],
  [
    /A number cannot be opened in table mode\. You can open the document in tree mode instead\./g,
    '数字不能在表格模式中打开。你可以切换到树形模式。',
  ],
  [
    /A boolean cannot be opened in table mode\. You can open the document in tree mode instead\./g,
    '布尔值不能在表格模式中打开。你可以切换到树形模式。',
  ],
  [
    /A null cannot be opened in table mode\. You can open the document in tree mode instead\./g,
    '空值不能在表格模式中打开。你可以切换到树形模式。',
  ],
  [/Format JSON: add proper indentation and new lines/g, '格式化 JSON：添加缩进和换行'],
  [/Compact JSON: remove all white spacing and new lines/g, '压缩 JSON：移除空白和换行'],
  [/Do you want to format the JSON\?/g, '是否格式化 JSON？'],
  [/Copy selected path to the clipboard/g, '复制所选路径到剪贴板'],
  [/Copy selected contents, formatted with indentation/g, '复制所选内容，保留缩进格式'],
  [/Copy selected contents, without indentation/g, '复制所选内容，压缩格式'],
  [/Copying and pasting/g, '复制和粘贴'],
  [/Paste clipboard contents/g, '粘贴剪贴板内容'],
  [/Insert or paste contents/g, '插入或粘贴内容'],
  [
    /Select area before current entry to insert or paste contents/g,
    '选择当前项前方区域以插入或粘贴内容',
  ],
  [
    /Select area after current entry to insert or paste contents/g,
    '选择当前项后方区域以插入或粘贴内容',
  ],
  [/Remove selected contents/g, '删除所选内容'],
  [/Repair invalid JSON, then click apply/g, '修复无效 JSON，然后点击应用'],
  [/Automatically repair JSON/g, '自动修复 JSON'],
  [/Scroll to the error location/g, '滚动到错误位置'],
  [/Accept the repaired document/g, '接受修复后的文档'],
  [/Leave the document unchanged and repair it manually instead/g, '保持文档不变，改为手动修复'],
  [/Open the document in "code" mode and repair it manually/g, '以文本模式打开文档并手动修复'],
  [
    /The loaded JSON document is invalid and could not be repaired/g,
    '加载的 JSON 文档无效，且无法自动修复',
  ],
  [
    /The loaded JSON document was invalid but is successfully repaired/g,
    '加载的 JSON 文档无效，但已成功修复',
  ],
  [/Validation turned off: the document is too large/g, '文档过大，已关闭校验'],
  [/Open context menu/g, '打开上下文菜单'],
  [/Close this message/g, '关闭这条消息'],
]

const textContainersSelector = [
  '.jse-main-menu',
  '.jse-context-menu',
  '.jse-modal',
  '.jse-message',
  '.jse-welcome',
  '.jse-copy-paste',
  '.jse-table-mode-welcome',
  '.jse-tip',
  '.jse-tip-text',
].join(',')

const excludedTextSelector = [
  '.jse-contents',
  '.jse-navigation-bar-text',
  '.jse-value',
  '.jse-key',
  '.cm-content',
  '[contenteditable="true"]',
  'input',
  'textarea',
].join(',')

export function translateJsonEditorPhrase(value: string | undefined): string | undefined {
  if (!value) {
    return value
  }

  const exactTranslation = exactTranslations[value]

  if (exactTranslation) {
    return exactTranslation
  }

  return phraseTranslations.reduce((translated, [pattern, replacement]) => {
    return translated.replace(pattern, replacement)
  }, value)
}

export function useJsonEditorChineseLocale(rootRef: Readonly<ShallowRef<HTMLElement | null>>) {
  let observer: MutationObserver | undefined
  let pendingFrame = 0

  function localizeMenu(items: MenuItem[]) {
    return items.map(localizeMenuItem)
  }

  function localizeContextMenu(items: ContextMenuItem[]) {
    return items.map(localizeContextMenuItem)
  }

  function scheduleLocalizeElement() {
    if (pendingFrame) {
      return
    }

    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0
      localizeElement()
    })
  }

  function localizeElement() {
    const root = rootRef.value

    if (!root) {
      return
    }

    localizeAttributes(root)
    localizeTextNodes(root)
    localizeMetaText(root)
  }

  function attachObserver() {
    observer?.disconnect()

    const root = rootRef.value

    if (!root) {
      return
    }

    localizeElement()
    observer = new MutationObserver(scheduleLocalizeElement)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['aria-label', 'placeholder', 'title'],
      childList: true,
      characterData: true,
      subtree: true,
    })
  }

  onMounted(() => {
    void nextTick(attachObserver)
  })

  watch(rootRef, () => {
    void nextTick(attachObserver)
  })

  onBeforeUnmount(() => {
    if (pendingFrame) {
      window.cancelAnimationFrame(pendingFrame)
    }

    observer?.disconnect()
  })

  return {
    localizeContextMenu,
    localizeMenu,
  }
}

function localizeAttributes(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(
      '[title], [aria-label], input[placeholder], textarea[placeholder]',
    )
    .forEach((element) => {
      for (const attributeName of ['title', 'aria-label', 'placeholder']) {
        const value = element.getAttribute(attributeName)
        const translatedValue = translateJsonEditorPhrase(value ?? undefined)

        if (translatedValue && translatedValue !== value) {
          element.setAttribute(attributeName, translatedValue)
        }
      }
    })
}

function localizeTextNodes(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(textContainersSelector).forEach((container) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    let textNode = walker.nextNode()

    while (textNode) {
      const parentElement = textNode.parentElement

      if (parentElement && !parentElement.closest(excludedTextSelector)) {
        const rawText = textNode.nodeValue ?? ''
        const trimmedText = rawText.trim()
        const translatedText = translateJsonEditorPhrase(trimmedText)

        if (translatedText && translatedText !== trimmedText) {
          const leadingWhitespace = rawText.match(/^\s*/)?.[0] ?? ''
          const trailingWhitespace = rawText.match(/\s*$/)?.[0] ?? ''
          textNode.nodeValue = `${leadingWhitespace}${translatedText}${trailingWhitespace}`
        }
      }

      textNode = walker.nextNode()
    }
  })
}

function localizeMetaText(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.jse-meta, .jse-nested-property-count').forEach((element) => {
    const translatedText = translateJsonEditorPhrase(element.textContent?.trim())

    if (translatedText && translatedText !== element.textContent?.trim()) {
      element.textContent = translatedText
    }
  })
}

function localizeMenuItem(item: MenuItem): MenuItem {
  if (item.type === 'button') {
    return localizeMenuButton(item)
  }

  return item
}

function localizeContextMenuItem(item: LocalizableContextMenuItem): LocalizableContextMenuItem {
  if (item.type === 'button') {
    return localizeMenuButton(item)
  }

  if (item.type === 'dropdown-button') {
    return localizeMenuDropDownButton(item)
  }

  if (item.type === 'label') {
    return {
      ...item,
      text: translateJsonEditorPhrase(item.text) ?? item.text,
    }
  }

  if (item.type === 'column') {
    return {
      ...item,
      items: item.items.map(localizeContextMenuColumnItem),
    }
  }

  if (item.type === 'row') {
    return {
      ...item,
      items: item.items.map(localizeContextMenuRowItem),
    }
  }

  return item
}

function localizeContextMenuColumnItem(
  item: MenuButton | MenuDropDownButton | MenuLabel | MenuSeparator,
): MenuButton | MenuDropDownButton | MenuLabel | MenuSeparator {
  if (item.type === 'button') {
    return localizeMenuButton(item)
  }

  if (item.type === 'dropdown-button') {
    return localizeMenuDropDownButton(item)
  }

  if (item.type === 'label') {
    return {
      ...item,
      text: translateJsonEditorPhrase(item.text) ?? item.text,
    }
  }

  return item
}

function localizeContextMenuRowItem(
  item: MenuButton | MenuDropDownButton | ContextMenuColumn,
): MenuButton | MenuDropDownButton | ContextMenuColumn {
  if (item.type === 'button') {
    return localizeMenuButton(item)
  }

  if (item.type === 'dropdown-button') {
    return localizeMenuDropDownButton(item)
  }

  return {
    ...item,
    items: item.items.map(localizeContextMenuColumnItem),
  }
}

function localizeMenuButton<T extends MenuButton>(button: T): T {
  return {
    ...button,
    text: translateJsonEditorPhrase(button.text) ?? button.text,
    title: translateJsonEditorPhrase(button.title) ?? button.title,
  }
}

function localizeMenuDropDownButton<T extends MenuDropDownButton>(button: T): T {
  return {
    ...button,
    main: localizeMenuButton(button.main),
    items: button.items.map(localizeMenuButton),
  }
}
