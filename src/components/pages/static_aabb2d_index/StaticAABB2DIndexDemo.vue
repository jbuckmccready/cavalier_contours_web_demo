<script setup lang="ts">
import { ref } from "vue";
import StaticAABB2DIndexScene from "@/components/pages/static_aabb2d_index/StaticAABB2DIndexScene.vue";
import Selector from "@/components/common/Selector.vue";
import InputSlider from "@/components/common/InputSlider.vue";
import CheckBox from "@/components/common/CheckBox.vue";
import {
  StaticAABBIndexDemoMode,
  allDemoModesAsStrings,
} from "@/components/pages/static_aabb2d_index/static_aabb2d_index";
import state from "@/components/pages/static_aabb2d_index/static_aabb2d_index_state";

const allDemoModes = Object.freeze(allDemoModesAsStrings());
const splitterModel = ref(75);
</script>

<template>
  <q-splitter v-model="splitterModel" :limits="[25, 90]" style="height: inherit">
    <template #before>
      <StaticAABB2DIndexScene
        :current-demo-mode="state.currentDemoMode"
        :vertex-count="state.vertexCount"
        :index-node-size="state.indexNodeSize"
        :edit-shape="state.editShape"
        :neighbor-distance="state.neighborDistance"
        :neighbors-query-center="state.neighborsQueryCenter"
        :query-box="state.queryBox"
      />
    </template>
    <template #after>
      <div class="q-pa-sm q-gutter-sm">
        <Selector v-model="state.currentDemoMode" label="Demo Mode" :options="allDemoModes" />
        <InputSlider v-model="state.vertexCount" label="Vertex Count" :min="10" :max="1000" />
        <InputSlider v-model="state.indexNodeSize" label="Index Node Size" :min="4" :max="32" />
        <CheckBox v-model="state.editShape" label="Show Polyline Vertexes" />
        <InputSlider
          v-if="state.currentDemoMode === StaticAABBIndexDemoMode.Neighbors"
          v-model="state.neighborDistance"
          label="Neighbor Distance"
          :min="0"
          :max="500"
        />
      </div>
    </template>
  </q-splitter>
</template>
