export type Renderer = "rich" | "guest" | {
	render(text: string, env: object): string,
};
