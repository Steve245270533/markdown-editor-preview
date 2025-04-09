<template>
	<div class="container">
		<MarkdownEditor
			v-model='content'
			renderer='rich'
		>
		</MarkdownEditor>
	</div>
</template>

<script setup lang='ts'>
import { useLocalStorage } from "@vueuse/core";
import { MarkdownEditor } from "./MarkdownEditor";
import document from "./assets/KFM-zh.md?raw";

const content = useLocalStorage("Content", document, {
  writeDefaults: false,
});
</script>

<style scoped>
.container {
	height: 100vh;
}
</style>
