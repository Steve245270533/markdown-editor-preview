// 库模式下会进行处理，但不会出现在生成的 JS 文件中，需要用户手动导入。
import "./web/markdown.scss";

export * from "./directive";
export * from "./helper";
export * from "./utils";
export * from "./miscellaneous";
export * from "./activate";
export * from "./diagnostics";

export { default as MarkdownIt } from "markdown-it";

export { default as activate } from "./activate";
export { default as toc } from "markdown-it-toc-done-right";
export { default as directive } from "./directive";
export { default as div } from "./div";
export { default as collapsible } from "./collapsible";

export { default as fence } from "./web/fence";
export { default as media } from "./web/media";
export { default as highlight } from "./web/highlight";
