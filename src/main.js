import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import "@/assets/styles/app.css";

(async () => {
    const wasm = await import("../wasm/cavalier_contours_web_ffi/pkg");

    createApp(App)
        .provide('wasm', wasm)
        .use(router)
        .mount('#app');
})();
