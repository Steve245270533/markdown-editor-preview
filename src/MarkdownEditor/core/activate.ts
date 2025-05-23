import { activateCopyButtons } from "./web/fence.ts";
import observeLazyLoad, { type LazyLoadOptions } from "./web/lazy-loading.ts";

// ESBuild 不会去识别 type import，所以这里 export 后要加 type 来注明。
export type { LazyLoadOptions };

/**
 * 激活 Markdown 元素，其实就是添加各种监听。返回一个清理函数，卸载组件后记得调用哦。
 *
 * @param el 容器元素，监听将应用到它的下级元素。
 * @param options 懒加载选项
 * @return 取消监听的函数，必须在被监视的元素移除后调用，以避免内存泄漏。
 */
export default function (el: HTMLElement, options: LazyLoadOptions = {}) {
  activateCopyButtons(el);
  return observeLazyLoad(el, options);
}
