<template>
	<div class="container">
		<MarkdownEditor
      v-if="isShow"
			v-model='content'
      :scroll-synced='scrollSynced'
			renderer='rich'
      ref="editorRef"
		>
		</MarkdownEditor>
	</div>
</template>

<script setup lang='ts'>
import { useLocalStorage } from "@vueuse/core";
import { MarkdownEditor } from "./MarkdownEditor";
import document from "./assets/KFM-zh.md?raw";
import { onMounted, ref } from "vue";

const isShow = ref(true);
const scrollSynced = ref(true);

const content = useLocalStorage("Content", document, {
  writeDefaults: false,
});

const editorRef = ref<InstanceType<typeof MarkdownEditor>>();

onMounted(() => {
  console.log(editorRef.value);
});
</script>

<style scoped>
.container {
	height: 100vh;
}
</style>
