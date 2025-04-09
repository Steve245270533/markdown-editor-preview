import * as md from "monaco-editor/esm/vs/basic-languages/markdown/markdown.js";
import MarkdownIt from "markdown-it";
import { kfmPreset } from "./miscellaneous.ts";
import { sourceLine } from "./diagnostics.ts";

// 预设渲染器
const rich = new MarkdownIt();
rich.use(kfmPreset);
rich.use(sourceLine);
const guest = new MarkdownIt();
guest.use(kfmPreset, { guest: true });
guest.use(sourceLine);

export function setupMarkdownTokenizer() {
  // 给自定义的两个语法 TOC 和 Directive 添加解析支持。
  const { tokenizer } = md.language;
  tokenizer.root.unshift([/^(\[\[TOC]])/, ["keyword.toc"]]);
  tokenizer.root.unshift([
    /^(@\w+)(!?\[)((?:[^\]\\]|@escapes)*)(]\([^)]+\))/,
    ["type.directive", "string.link", "", "string.link"],
  ]);
}

// 自定义渲染器，给 list_item 添加自定义属性。
// rich.renderer.rules.list_item_open = function(tokens, idx, options, env, self) {
// 	const token = tokens[idx];
// 	token.attrSet('data-xxx', "test");
// 	return self.renderToken(tokens, idx, options);
// }

export {
  rich,
  guest
};
