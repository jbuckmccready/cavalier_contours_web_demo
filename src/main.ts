import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

import wasm_init, * as wasm from "cavalier_contours_web_ffi";

wasm_init().then(() => {
  let pl = new wasm.Polyline(new Float64Array ([0, 0, 1, 1, 0, 1]), true);
  let wnInside = pl.windingNumber(0.5, 0);
  let wnOutside = pl.windingNumber(-0.5, 0);
  pl.free();
  console.log("wnInside:", wnInside);
  console.log("wnOutside:", wnOutside);

  createApp(App).mount('#app')
});