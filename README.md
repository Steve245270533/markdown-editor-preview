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

#### 安装
```bash
pnpm i markdown-editor-preview
```

#### 引入
```ts
import { MarkdownEditor } from "markdown-editor-preview";
// style.css样式表包含了编辑器和预览的样式
import "markdown-editor-preview/style.css";
```

#### 示例
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
import { MarkdownEditor } from "markdown-editor-preview";
import "markdown-editor-preview/style.css"

const content = ref("# Hello Markdown-Editor-Preview!");
</script>

<style scoped>
.container {
	height: 100vh;
}
</style>
```

### MarkdownEditor组件

完整的Markdown编辑器组件，包含编辑器和预览区域。

```ts
import { MarkdownEditor } from "markdown-editor-preview";
import "markdown-editor-preview/style.css";
```

#### Props
| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| v-model | string |  | 编辑器内容 |
| renderer | Renderer | rich | 渲染器类型，可选值为 'rich' 或 'guest' 也可以为 MarkdownIt 的实例 |
| debounce | number | 500 | 渲染函数的防抖（毫秒） |
| scrollSynced | boolean | true | 是否同步滚动 |

#### 预设渲染器

库内置了两种预设渲染器：

- `rich`：默认渲染器，提供完整的 Markdown 渲染功能
- `guest`：访客模式渲染器，适用于用户生成内容场景，具有更严格的安全限制

#### Exposes
| 名称 | 类型 | 说明 |
| --- | --- | --- |
| editor | MonacoEditor | 编辑器实例 |
| getHTML | Function | 获取渲染后的HTML内容 |

### MarkdownView组件

Markdown预览组件，用于将Markdown文本渲染为HTML。

```ts
import { MarkdownView } from "markdown-editor-preview";
import "markdown-editor-preview/style.css";
```

#### Props
| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | string |  | 要渲染的 Markdown 文本，转换过程是同步的 |
| renderer | Renderer | 'guest' | 渲染器类型，可选值为 'rich' 或 'guest' 也可以为 MarkdownIt 的实例 |
| docId | string |  | 设置唯一 ID，用于区分锚点 |

#### Exposes
| 名称 | 类型 | 说明 |
| --- | --- | --- |
| getHTML | Function | 获取渲染后的HTML内容 |

### MarkdownIt

`markdown-editor-preview` 导出了 `MarkdownIt` 类，这是整个库的核心渲染引擎，用于将 Markdown 文本转换为 HTML。

```ts
import { MarkdownIt } from "markdown-editor-preview";

// 创建 MarkdownIt 实例
const md = new MarkdownIt({
  html: true,        // 启用 HTML 标签
  linkify: true,     // 自动将 URL 转换为链接
  typographer: true  // 启用一些语言中立的替换和引号美化
});

// 渲染 Markdown 文本
const html = md.render('# Hello World');
```

### sourceLine

`sourceLine` 是一个用于标注原文行号信息的 MarkdownIt 插件，主要用于实现编辑器和预览区域的双向滚动同步功能。

#### 使用场景

当您需要自定义 MarkdownIt 渲染器并保持滚动同步功能时，可以使用此插件

```ts
import { sourceLine, MarkdownIt } from "markdown-editor-preview";

// 创建 MarkdownIt 实例
const md = new MarkdownIt();

// 使用 sourceLine 插件
md.use(sourceLine);
```

#### 功能说明

- 给块语法渲染的结果中添加原文行号信息，用于定位哪一行渲染出了哪个元素
- 为实现编辑器和预览区域的双向滚动同步提供基础支持
- 在渲染的 HTML 元素上添加 `data-line` 属性，格式为 `start,end`，表示该元素对应的原始 Markdown 文本的起始和结束行号