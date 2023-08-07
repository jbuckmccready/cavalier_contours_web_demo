import { createApp } from "vue";
import * as VueRouter from "vue-router";
import App from "@/App.vue";
import { Quasar } from "quasar";

import "@quasar/extras/material-icons/material-icons.css";

// Import Quasar css
import "quasar/src/css/index.sass";

import "@/index.css";

import wasm_init from "cavalier_contours_web_ffi";

import mainRoutes from "@/main_demo_routes";

const routes: VueRouter.RouteRecordRaw[] = [{ path: "/", redirect: "/about" }];

mainRoutes.forEach((r) => {
  routes.push({ path: r.path, component: r.component });
});

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

wasm_init().then(() => {
  const app = createApp(App);
  app.use(router);
  app.use(Quasar, {});
  app.mount("#app");
});
