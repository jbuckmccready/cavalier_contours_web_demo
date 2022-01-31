<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref } from "vue";
import NavButton from "@/components/common/NavButton.vue";
import AboutPage from "@/components/pages/AboutPage.vue";
import PlineOffsetDemo from "@/components/pages/pline_offset/PlineOffsetDemo.vue";
import PlineBooleanDemo from "@/components/pages/pline_boolean/PlineBooleanDemo.vue";
import StaticAABB2DIndexDemo from "@/components/pages/static_aabb2d_index/StaticAABB2DIndexDemo.vue";

const pages = [
  ["About", AboutPage],
  ["Polyline Offset", PlineOffsetDemo],
  ["Polyline Boolean", PlineBooleanDemo],
  ["Static AABB Index", StaticAABB2DIndexDemo],
];
const selectedPageIndex = ref(0);
</script>

<template>
  <!-- Page navigation bar-->
  <div class="h-screen w-screen flex flex-col">
    <nav class="bg-primary-800 h-full w-full flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <NavButton
                  v-for="([pageName, _], index) in pages"
                  :key="index"
                  :is-active="selectedPageIndex === index"
                  @click="selectedPageIndex = index"
                >
                  {{ pageName }}
                </NavButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main page area-->
    <div class="w-full h-full min-h-0">
      <!-- Cache inactive pages -->
      <keep-alive>
        <component :is="pages[selectedPageIndex][1]" v-bind="pages[selectedPageIndex][2]" />
      </keep-alive>
    </div>
  </div>
</template>

<style></style>
