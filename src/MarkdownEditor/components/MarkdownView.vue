<!-- 将 Markdown 转换成 HTML 并显示出来的组件。-->
<template>
	<MarkdownBox
    :html='html'
    :lazy-loading='lazyLoading'
  />
</template>

<script setup lang='ts'>
import { computed } from "vue";
import MarkdownBox from "./MarkdownBox.vue";
import { rich, guest } from "../core";
import type { LazyLoadOptions, Renderer } from "../core";

const { value, renderer, docId } = defineProps<{
	/**
	 * 要渲染的 Markdown 文本，转换过程是同步的。
	 */
	value: string,

	/** 设置个唯一 ID，由于区分锚点。*/
	docId?: string,

	/**
	 * Markdown 渲染器，可以为 MarkdownIt 的实例。
	 * 如果是字符串则使用预设，详见源码里上面的 script 块。
	 *
	 * @default "guest"
	 */
	renderer?: Renderer,

	/** 懒加载相关的选项，默认为空 */
	lazyLoading?: LazyLoadOptions,
}>();

const html = computed(() => {
  let resolved = guest;

  switch (renderer) {
  case undefined:
  case "guest":
    break;
  case "rich":
    resolved = rich;
    break;
  default:
    resolved = renderer as any;
  }

  return resolved.render(value, { docId });
});

function getHTML() {
  return html.value;
}

defineExpose({
  getHTML,
});
</script>
