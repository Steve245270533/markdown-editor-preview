<template>
	<div class='container'>
    <SplitBoard
      :max="0.7"
      :min="0.3"
    >
      <template #1>
        <div
          ref='editorRef'
          class='editor'
        />
      </template>
      <template #2>
        <MarkdownView
          ref='previewEl'
          :renderer='editorRenderer'
          :value='debouncedContent'
          class='preview'
        />
      </template>
    </SplitBoard>
	</div>
</template>

<script setup lang='ts'>
import { onMounted, shallowRef } from "vue";
import { setupMarkdownTokenizer, setupScrollSync } from "../core";
import { useEditor } from "../composables/useEditor";
import MarkdownView from "./MarkdownView.vue";
import SplitBoard from "./SplitBoard/index.vue";
import type { ComponentPublicInstance } from "vue";
import type { EditorProps } from "../composables/useEditor";

const props = withDefaults(defineProps<EditorProps>(), {
  debounce: 500,
  renderer: "rich",
  scrollSynced: true,
});
const content = defineModel<string>({ required: true });

setupMarkdownTokenizer();

const {
  editor,
  editorRef,
  debouncedContent,
  computedScrollSynced,
  editorRenderer,
  selection,
} = useEditor(content, props);

const previewEl = shallowRef<ComponentPublicInstance<InstanceType<typeof MarkdownView>>>();

function getHTML() {
  return previewEl.value!.getHTML();
}

onMounted(() => {
  setupScrollSync(editor.value!, previewEl.value!.$el, computedScrollSynced);
});

defineExpose({
  editor,
  selection,
  getHTML,
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
