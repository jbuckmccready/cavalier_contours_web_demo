import { Component } from "vue";
import AboutPage from "@/components/pages/AboutPage.vue";
import PlineOffsetDemo from "@/components/pages/pline_offset/PlineOffsetDemo.vue";
import PlineBooleanDemo from "@/components/pages/pline_boolean/PlineBooleanDemo.vue";
import StaticAABB2DIndexDemo from "@/components/pages/static_aabb2d_index/StaticAABB2DIndexDemo.vue";
import MultiPlineOffsetDemo from "@/components/pages/multi_pline_offset/MultiPlineOffsetDemo.vue";

type MainRoute = {
  label: string;
  path: string;
  component: Component;
};

const mainRoutes: MainRoute[] = [
  { label: "About", path: "/about", component: AboutPage },
  { label: "Polyline Offset", path: "/pline_offset", component: PlineOffsetDemo },
  { label: "Polyline Boolean", path: "/pline_boolean", component: PlineBooleanDemo },
  { label: "Static AABB Index", path: "/static_aabb2d_index", component: StaticAABB2DIndexDemo },
  { label: "Multi Polyline Offset", path: "/multi_pline_offset", component: MultiPlineOffsetDemo },
];
export default mainRoutes;
