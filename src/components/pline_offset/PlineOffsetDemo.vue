<template>
  <div class="w-full h-full flex flex-row">
    <Splitpanes vertical>
      <Pane>
        <div
          class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2"
        >
          <PlineOffsetScene
            ref="plineOffsetSceneRef"
            v-model:plineJsonStr="state.plineJsonStr"
            :offset="state.offset"
            :max-offsets="state.offsetCount"
          />
        </div>
      </Pane>
      <Pane>
        <div class="overflow-auto">
          <div class="py-4 px-4">
            <div class="max-w-md">
              <div class="grid grid-cols-1 gap-2">
                <Selector
                  title="Mode"
                  :options="allDemoModes"
                  v-model="state.currentDemoMode"
                />
                <InputSlider
                  title="Offset"
                  v-model="state.offset"
                  :min="-40"
                  :max="40"
                />
                <InputSlider
                  title="Offset Count"
                  v-model="state.offsetCount"
                  :min="0"
                  :max="100"
                />
              </div>
              <PlineJsonEditor v-model="state.plineJsonStr" />
            </div>
            <div class="block mt-2">
              <button class="basic-button" @click="copyRustTestCode">
                Copy Test Code
              </button>
            </div>
            <!-- <div class="block mt-2">
                    <label class="inline-flex items-center">
                        <input
                            v-model="fillPolylines"
                            type="checkbox"
                            class="rounded bg-gray-200 border-transparent focus:border-transparent focus:bg-gray-200 text-gray-700 focus:ring-1 focus:ring-offset-2 focus:ring-gray-500"
                        >
                        <span class="ml-2">Fill Polylines</span>
                    </label>
                </div>
                <div class="block mt-2">
                    <button
                        class="basic-button"
                        @click="copyRustTestCode"
                    >
                        Copy Test Code
                    </button>
                </div> -->
          </div>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>

<script lang="ts">
import { ref, unref, defineComponent, reactive } from "vue";
import PlineOffsetScene from "@/components/pline_offset/PlineOffsetScene.vue";
import * as shapes from "@/core/shapes";
import * as utils from "@/core/utils";
import InputSlider from "@/components/common/InputSlider.vue";
import Selector from "@/components/common/Selector.vue";
import PlineJsonEditor from "@/components/common/PlineJsonEditor.vue";
import {
  DemoMode,
  allDemoModesAsStrings,
} from "@/components/pline_offset/pline_offset";
import { Splitpanes, Pane } from "splitpanes";

export default defineComponent({
  name: "PlineOffsetDemo",
  components: {
    PlineOffsetScene,
    InputSlider,
    Selector,
    PlineJsonEditor,
    Splitpanes,
    Pane,
  },
  props: {},
  setup() {
    const state = reactive({
      offset: 3.0,
      offsetCount: 50,
      plineJsonStr: utils.plineArrayToJsonStr(
        shapes.createExample1PlineVertexes(10),
        true
      ),
      currentDemoMode: DemoMode[DemoMode.Offset],
    });

    const allDemoModes = ref(allDemoModesAsStrings());

    const plineOffsetSceneRef = ref<typeof PlineOffsetScene | null>(null);

    const copyRustTestCode = () => {
      const scene = utils.valueOrThrow(unref(plineOffsetSceneRef));
      utils.copyToClipboard(scene.getRustTestCodeString());
    };

    return {
      state,
      allDemoModes,
      plineOffsetSceneRef,
      copyRustTestCode,
    };
  },
});
</script>
