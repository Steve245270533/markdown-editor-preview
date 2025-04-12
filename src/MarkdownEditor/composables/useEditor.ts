import { computed, onMounted, onUnmounted, shallowRef, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js";
import "monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js";
import "monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/dnd/browser/dnd.js";
import "monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js";
import { guest, rich } from "../core";
import type { Ref, ShallowRef } from "vue";
import type { Renderer } from "../core";

export interface EditorProps {
  /**
   * Markdown 渲染器，可以为 MarkdownIt 的实例。
   *
   * @default "rich"
   */
  renderer?: Renderer,

  /**
   * 渲染函数的防抖（毫秒）。
   *
   * @default 500
   */
  debounce?: number,

  /**
   * 是否同步滚动。
   *
   * @default true
   */
  scrollSynced?: boolean,
}

export function useEditor(content: Ref<string>, props: Required<EditorProps>) {
  /**
   * 编辑的文本，从外部修改会导致编辑状态（光标、滚动条等等）重置。
   */
  const debouncedContent = refDebounced(content, props.debounce);
  // 保存当前内容的副本
  let contentSnapshot = content.value;

  const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorRef = shallowRef<HTMLElement>();

  const WORD_SEPARATORS =
    "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?"	// USUAL_WORD_SEPARATORS
    + "·！￥…*（）—【】：；‘’“”、《》，。？"	// 中文符号。
    + "「」｛｝＜＞・～＠＃＄％＾＆＊＝『』";	// 日韩符号。

  const computedScrollSynced = computed(() => props.scrollSynced);
  const editorRenderer = computed(() => {
    switch (props.renderer) {
    case "rich":
      return rich;
    case "guest":
      return guest;
    }
    return props.renderer;
  });

  // 同步 content 外部传入的修改到editor中
  watch(content, value => {
    if(editor.value && value !== contentSnapshot) editor.value.setValue(value);
  });

  onMounted(() => {
    editor.value = monaco.editor.create(editorRef.value!, {
      value: content.value,
      language: "markdown",
      // 要写方块字（CJK）的话最好调大点。
      lineHeight: 22,
      fontSize: 18,
      scrollbar: {
        useShadows: false,
      },
      theme: "vs-dark",
      automaticLayout: true,
      wordSeparators: WORD_SEPARATORS,
      wordWrap: "on",
      minimap: { enabled: false },
    });

    editor.value.onDidChangeModelContent(() => {
      content.value = contentSnapshot = editor.value!.getModel()!.getValue(monaco.editor.EndOfLinePreference.LF);
    });
  });

  onUnmounted(() => editor.value!.dispose());

  // 编辑器选区对象
  const selection = useEditorSelection(editor);

  return {
    editor,
    editorRef,
    debouncedContent,
    computedScrollSynced,
    editorRenderer,
    selection
  };
}

export function useEditorSelection(editor: ShallowRef<monaco.editor.IStandaloneCodeEditor | null>) {
  const selection = shallowRef(new monaco.Selection(0, 0, 0, 0));
  const result = shallowRef({
    start: 0,
    count: 0,
    startLineNumber: 0,
    startColumn: 0,
    endLineNumber: 0,
    endColumn: 0
  });

  onMounted(() => {
    // monaco-editor 将内容按行存储，选区也是，故光标的绝对位置需要计算一下。
    // https://github.com/microsoft/vscode/blob/15094ed7fded9f2de45488c13b97a8fe64a596ed/src/vs/workbench/browser/parts/editor/editorStatus.ts#L745
    watch(selection, (selection) => {
      const { startLineNumber, startColumn } = selection;
      const model = editor.value!.getModel()!;
      const offset = monaco.Selection.createWithDirection(1, 1, startLineNumber, startColumn, 0);

      result.value = {
        startLineNumber,
        startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn,
        start: model.getCharacterCountInRange(offset),
        count: model.getCharacterCountInRange(selection),
      };
    });

    editor.value!.onDidChangeCursorSelection(e => {
      selection.value = e.selection;
    });
  });

  return result;
}
