import { fileURLToPath, URL } from "node:url";
import * as path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 基础配置，两种模式共享的配置
  const baseConfig = {
    base: "./",
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      },
    },
  };

  // 根据构建模式返回不同的配置
  if (mode === "lib") {
    // 库模式配置
    return {
      ...baseConfig,
      plugins: [
        ...baseConfig.plugins,
        dts({
          tsconfigPath: "./tsconfig.lib.json",
          include: ["./src/MarkdownEditor/**/*"],
          staticImport: true,
          insertTypesEntry: true
        }),
      ],
      build: {
        rollupOptions: {
          external: ["vue", "@vueuse/core"],
        },
        outDir: "lib",
        copyPublicDir: false,
        lib: {
          formats: ["es"],
          entry: path.resolve(__dirname, "src/MarkdownEditor/index.ts"),
        },
      },
    };
  } else {
    // 网页模式配置
    return baseConfig;
  }
});
