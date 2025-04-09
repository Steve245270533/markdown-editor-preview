<template>
	<div class='container'>
    <SplitBoard
      :max="0.7"
      :min="0.3"
    >
      <template #1>
        <div
          ref='editorEl'
          class='editor'
        />
      </template>
      <template #2>
        <MarkdownView
          ref='previewEl'
          :renderer='editorRenderer'
          :value='debounced'
          class='preview'
        />
      </template>
    </SplitBoard>
	</div>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import type { ComponentPublicInstance } from "vue";
import { refDebounced } from "@vueuse/core";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js";
import "monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js";
import "monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/dnd/browser/dnd.js";
import "monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js";
import { rich, guest, setupMarkdownTokenizer, setupScrollSync } from "../core";
import MarkdownView from "./MarkdownView.vue";
import SplitBoard from "./SplitBoard/index.vue";
import type { Renderer } from "../core";


const props = withDefaults(defineProps<{
	/**
	 * Markdown 渲染器，可以为 MarkdownIt 的实例。
	 */
	renderer?: Renderer,

	/**
	 * 渲染函数的防抖（毫秒）。
	 *
	 * @default 500
	 */
	debounce?: number,
}>(), {
  debounce: 500,
  renderer: "rich"
});

setupMarkdownTokenizer();

/**
 * 编辑的文本，从外部修改会导致编辑状态（光标、滚动条等等）重置。
 */
const content = defineModel<string>({ required: true });

const debounced = refDebounced(content, props.debounce);
const editorEl = shallowRef<HTMLElement>();
const previewEl = shallowRef<ComponentPublicInstance>();

const editorRenderer = computed(() => {
  switch (props.renderer) {
  case "rich":
    return rich;
  case "guest":
    return guest;
  }
  return props.renderer;
});

let editor: monaco.editor.IStandaloneCodeEditor;

// 保存当前内容的副本，用于判断 content 是由外部还是这里修改的。
let contentSnapshot = content.value;

const WORD_SEPARATORS =
  "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?"	// USUAL_WORD_SEPARATORS
  + "·！￥…*（）—【】：；‘’“”、《》，。？"	// 中文符号。
  + "「」｛｝＜＞・～＠＃＄％＾＆＊＝『』";	// 日韩符号。

watch(content, value => value !== contentSnapshot && editor.setValue(value));

onUnmounted(() => editor.dispose());

onMounted(() => {
  editor = monaco.editor.create(editorEl.value!, {
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

  editor.onDidChangeModelContent(() => {
    content.value = contentSnapshot = editor.getModel()!.getValue(1);
  });

  setupScrollSync(editor, previewEl.value!.$el, ref(true));
});
</script>

<style scoped>
.container {
	display: flex;
	width: 100%;
	height: 100%;
}

.editor {
	width: 100%;
	height: 100%;
}

.preview {
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	padding: 16px;
	overflow-y: scroll;
}
</style>
