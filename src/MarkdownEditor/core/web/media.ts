import MarkdownIt from "markdown-it";
import Renderer from "markdown-it/lib/renderer.mjs";
import Token from "markdown-it/lib/token.mjs";
import { default as directive, type DirectiveMap } from "../directive.js";

/**
 * 从资源的链接参数（?vw=...&vh=...）里读取尺寸，生成防抖容器的 style 属性。
 *
 * @param url 资源的链接
 * @return style 属性字符串
 */
function getSizeStyle(url: string) {
  const urlParams = new URLSearchParams(url.split("?")[1]);

  // parseFloat(null) 返回 NaN 也是可以的
  const vw = parseFloat(urlParams.get("vw")!);
  const vh = parseFloat(urlParams.get("vh")!);

  if (!(vw && vh)) {
    return "";
  }
  return `style='--width:${vw}px;--aspect:${vw}/${vh}'`;
}

/**
 * 提取了属性部分的通用逻辑，首先是里移出了 src 避免顶层元素有多余的属性，
 * 另外使用了 MarkdownIt 的 renderAttrs()。
 *
 * TODO: 这里修改了 Token，但应该不会有后续插件会去用它吧。
 */
function blockAttrs(renderer: Renderer, token: Token) {
  const i = token.attrIndex("src");
  const src = token.attrs![i][1];
	token.attrs!.splice(i, 1);
	token.attrJoin("class", "center");
	return [src, renderer.renderAttrs(token).trimStart()];
}

/**
 * 自定义图片的渲染，相比默认的来说多了标签元素、懒加载、以及居中。
 *
 * 【不用 figure 元素】
 * <figure> 介绍里提到即使移除也不影响 main flow，但文章里的图可能跟上下文联系紧密，
 * 似乎并不能代替 <img> + <span>。
 *
 * 【防止布局抖动】
 * 通过 URL 里携带的宽高信息，设置图片的宽高比，防止布局抖动，下面的 GIF 视频同理。
 *
 * 【加载指示器】
 * 图片本身就有在不完全加载的时的显示方式，比如从上往下显示或者渐进式图片。
 * 如果无法加载，下面的标签也能表明空白区域是图片，所以没有必要用菊花图。
 */
function renderImage(this: MarkdownIt, tokens: Token[], i: number, _: any, __: any, self: any) {
  const token = tokens[i];
	token.attrs!.splice(token.attrIndex("alt"), 1);

	const [src, wrapperAttrs] = blockAttrs(self, token);
	const label = this.utils.escapeHtml(token.content);

	/*
	 * MarkdownIt 遵守 CommonMark 规范对单引号不转义，所以 alt 必须用双引号。
	 * ahrefs 的检测工具太垃圾，会报个警告说内链不要 nofollow，但这是图片无所谓。
	 */
	return `
		<span ${wrapperAttrs}>
			<a
				${getSizeStyle(src)}
				class='md-inspect'
				href="${src}"
				target='_blank'
				rel='noopener,nofollow'
			>
				<img data-src="${src}" alt="${label}" class='md-img' crossorigin>
			</a>
			${label ? `<span class='md-alt'>${label}</span>` : ""}
		</span>
	`;
}

/**
 * 各种自定义指令在本站页面的渲染实现，渲染出来的 HTML 必须配合下面的懒加载使用。
 *
 * 对于其它的环境，比如 RSS，使用的是另外的渲染方案。
 */
const mediaMap: DirectiveMap = {
  // 大部分浏览器只允许无声视频自动播放，不过 GIF 视频本来就是无声的。
  gif(token, md) {
    const alt = md.utils.escapeHtml(token.content);
    const [src, wrapperAttrs] = blockAttrs(this, token);
    return `
			<p ${wrapperAttrs}>
				<video
					${getSizeStyle(src)}
					class='gif'
					crossorigin
					loop
					muted
					data-src='${src}'
				/>
				${alt ? `<span class='md-alt'>${alt}</span>` : ""}
			</p>
		`;
  },
  video(token, md) {
    let poster = md.normalizeLink(token.content);
    if (!md.validateLink(poster)) {
      poster = "";
    }
    const [src, wrapperAttrs] = blockAttrs(this, token);
    return `
			<p ${wrapperAttrs}>
				<video
					class='md-video'
					controls
					crossorigin
					poster="${poster}"
					data-src="${src}"
				/>
			</p>
		`;
  },
  audio(token, md) {
    const alt = md.utils.escapeHtml(token.content);
    const [src, wrapperAttrs] = blockAttrs(this, token);
    return `
			<p ${wrapperAttrs}>
				<audio controls data-src="${src}" crossorigin/>
				${alt ? `<span class='md-alt'>${alt}</span>` : ""}
			</p>`;
  },
};

/**
 * 自定义媒体元素的前端版，覆盖 Media 插件和默认的图片渲染器，
 * 在这里，媒体将被渲染成具有更复杂的布局的元素，同时还启用了延迟加载。
 *
 * 添加该插件会同时添加 Directive 插件。
 */
export default function (md: MarkdownIt) {
  md.use(directive, mediaMap);
  md.renderer.rules.image = renderImage.bind(md);
}
