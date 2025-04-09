## markdown-editor-preview 🖹

Markdown预览编辑器是一款功能强大的工具，支持双向滚动同步，为用户提供流畅的编辑和预览体验。

该项目基于 `Vue3` + `TypeScript` 开发，结合了 `monaco-editor` 作为代码编辑器，`markdown-it` 解析Markdown语法。

### 特性
- 代码高亮：采用 `highlight.js` 实现代码高亮功能。
- 双向滚动同步：支持源码和预览页的双向滚动同步，极大提升了编辑效率。
- 自定义渲染器：支持开发者传入基于 `markdown-it` 的自定义渲染器。


该工具适用于需要实时预览Markdown效果的场景，如博客写作、文档编写等。

该项目基于 [kaciras-blog/markdown](https://github.com/kaciras-blog/markdown) 并在其基础上进行了优化和改进，感谢原作者的贡献！🎉🎉🎉

### 基础使用

```vue
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
import { ref } from "vue";
import { MarkdownEditor } from "./MarkdownEditor";

const content = ref("# Hello Markdown-Editor-Preview!");
</script>

<style scoped>
.container {
	height: 100vh;
}
</style>
```
