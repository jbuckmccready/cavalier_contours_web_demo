import { createApp } from "vue";
import App from "@/App.vue";
import "@/assets/styles/app.css";
import { CavcModuleKey } from "@/types";

(async () => {
  const wasm = await import("@/../wasm/cavalier_contours_web_ffi/pkg");
  createApp(App).provide(CavcModuleKey, wasm).mount("#app");
})();
