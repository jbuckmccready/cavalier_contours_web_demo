import { createRouter, createWebHistory } from 'vue-router';

import About from '@/components/About.vue';
import StaticAABB2DIndexDemo from '@/components/static_aabb2d_index/StaticAABB2DIndexDemo.vue';
import PlineBooleanDemo from '@/components/pline_boolean/PlineBooleanDemo.vue';


const routes = [
    { path: '/', redirect: '/about' },
    { path: '/about', component: About },
    { path: '/staticaabb2dindex', component: StaticAABB2DIndexDemo },
    { path: '/plineboolean', component: PlineBooleanDemo },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
    linkExactActiveClass: "active",
});

export default router;