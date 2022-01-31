<script setup lang="ts">
import { reactive, ref } from "vue";
import StaticAABB2DIndexScene from "@/components/pages/static_aabb2d_index/StaticAABB2DIndexScene.vue";
import Selector from "@/components/common/Selector.vue";
import InputSlider from "@/components/common/InputSlider.vue";
import CheckBox from "@/components/common/CheckBox.vue";
import {
  DemoMode,
  allDemoModesAsStrings,
} from "@/components/pages/static_aabb2d_index/static_aabb2d_index";

const state = reactive({
  currentDemoMode: DemoMode.None,
  vertexCount: 100,
  indexNodeSize: 16,
  editShape: false,
  neighborDistance: 100,
});

const allDemoModes = ref(allDemoModesAsStrings());
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2">
      <StaticAABB2DIndexScene
        :current-demo-mode="state.currentDemoMode"
        :vertex-count="state.vertexCount"
        :index-node-size="state.indexNodeSize"
        :edit-shape="state.editShape"
        :neighbor-distance="state.neighborDistance"
      />
    </div>
    <div class="w-auto overflow-auto">
      <div class="py-4 px-4">
        <div class="mt-8 max-w-md">
          <div class="grid grid-cols-1 gap-6">
            <Selector v-model="state.currentDemoMode" title="Demo Mode" :options="allDemoModes" />
            <InputSlider v-model="state.vertexCount" title="Vertex Count" :min="10" :max="1000" />
            <InputSlider v-model="state.indexNodeSize" title="Index Node Size" :min="4" :max="32" />
            <CheckBox v-model="state.editShape" label="Show Polyline Vertexes" />
            <InputSlider
              v-if="state.currentDemoMode === DemoMode.Neighbors"
              v-model="state.neighborDistance"
              title="Neighbor Distance"
              :min="0"
              :max="500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
