import { createApp } from "vue";
import App from "@/App.vue";
import "@/index.css";

import wasm_init from "cavalier_contours_web_ffi";

wasm_init().then(() => {
  createApp(App).mount("#app");
});
