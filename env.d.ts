/// <reference types="vite/client" />

declare module "markdown-it-footnote" {
	import { PluginSimple } from "markdown-it";
	export default {} as PluginSimple;
}

// 不能直接 export * from ...
declare module "markdown-it/lib/common/utils.mjs" {
	import { escapeHtml, unescapeMd } from "markdown-it/lib/common/utils.js";
	export { unescapeMd, escapeHtml };
}

declare module "monaco-editor/esm/vs/basic-languages/markdown/markdown.js" {
	import { languages } from "monaco-editor";

	export const conf: languages.LanguageConfiguration;
	export const language: languages.IMonarchLanguage;
}

declare module "monaco-editor/esm/vs/base/browser/ui/codicons/codiconStyles.js";
