<template>
  <!-- This example requires Tailwind CSS v2.0+ -->
  <div class="h-screen w-screen flex flex-col">
    <nav class="bg-primary-800 h-full w-full flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <button
                  v-for="(tab, index) in tabNames"
                  :key="tab"
                  :class="['nav-button', { active: currentTabIndex === index }]"
                  @click="currentTabIndex = index"
                >
                  {{ tab }}
                </button>
              </div>
            </div>
          </div>
          <div class="-mr-2 flex">
            <button
              class="bg-primary-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white"
            >
              <svg
                class="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
    <div id="main-content" class="w-full h-full min-h-0">
      <!-- Inactive components will be cached! -->
      <keep-alive>
        <component :is="currentComponent" />
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import About from "@/components/About.vue";
import StaticAABB2DIndexDemo from "@/components/static_aabb2d_index/StaticAABB2DIndexDemo.vue";
import PlineBooleanDemo from "@/components/pline_boolean/PlineBooleanDemo.vue";
import PlineOffsetDemo from "@/components/pline_offset/PlineOffsetDemo.vue";

import { ref, computed, defineComponent } from "vue";

export default defineComponent({
  name: "App",
  setup() {
    const tabComponents = [
      About,
      StaticAABB2DIndexDemo,
      PlineBooleanDemo,
      PlineOffsetDemo,
    ];
    const tabNames = [
      "About",
      "Static AABB Index",
      "Polyline Boolean",
      "Polyline Offset",
    ];
    const currentTabIndex = ref(0);

    const currentComponent = computed(
      () => tabComponents[currentTabIndex.value]
    );

    return {
      tabNames,
      currentTabIndex,
      currentComponent,
    };
  },
  created() {
    document.title = "Cavalier Contours";
  },
});
</script>

<style>
.nav-button {
  @apply text-gray-300 px-3 py-2 rounded-md text-sm font-medium;
}
.nav-button.active {
  @apply bg-primary-900 text-white;
}
.nav-button:hover {
  @apply bg-primary-700 text-white;
}

.basic-button {
  @apply bg-gray-200 p-2;
}
</style>
