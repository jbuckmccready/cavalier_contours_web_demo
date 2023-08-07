import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import wasmPack from "vite-plugin-wasm-pack";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: "src/quasar-variables.sass" }),
    wasmPack(["./cavalier_contours_web_ffi"]),
  ],
});
