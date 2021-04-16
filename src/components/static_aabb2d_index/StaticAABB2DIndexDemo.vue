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
            <Selector
              title="Demo Mode"
              :options="allDemoModes"
              v-model="state.currentDemoMode"
            />
            <InputSlider
              title="Vertex Count"
              v-model="state.vertexCount"
              :min="10"
              :max="1000"
            />
            <InputSlider
              title="Index Node Size"
              v-model="state.indexNodeSize"
              :min="4"
              :max="32"
            />
            <CheckBox
              label="Show Polyline Vertexes"
              v-model="state.editShape"
            />
            <InputSlider
              v-if="state.currentDemoMode === DemoMode.Neighbors"
              title="Neighbor Distance"
              v-model="state.neighborDistance"
              :min="0"
              :max="500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import StaticAABB2DIndexScene from "@/components/static_aabb2d_index/StaticAABB2DIndexScene.vue";
import Selector from "@/components/common/Selector.vue";
import InputSlider from "@/components/common/InputSlider.vue";
import CheckBox from "@/components/common/CheckBox.vue";
import {
  DemoMode,
  allDemoModesAsStrings,
} from "@/components/static_aabb2d_index/static_aabb2d";

export default defineComponent({
  name: "StaticAABB2DIndexDemo",
  components: {
    StaticAABB2DIndexScene,
    Selector,
    InputSlider,
    CheckBox,
  },
  props: {},
  setup() {
    const state = reactive({
      currentDemoMode: DemoMode.None,
      vertexCount: 100,
      indexNodeSize: 16,
      editShape: false,
      neighborDistance: 100,
    });

    const allDemoModes = ref(allDemoModesAsStrings());

    return {
      state,
      allDemoModes,
      DemoMode,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
