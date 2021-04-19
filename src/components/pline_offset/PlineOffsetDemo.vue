<template>
  <div class="w-full h-full flex flex-row">
    <div class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2">
      <PlineOffsetScene
        ref="plineOffsetSceneRef"
        :model="demoModel"
        v-model:plineJsonStr="plineJsonStr"
      />
    </div>
    <div class="overflow-auto w-1/4">
      <div class="py-4 px-4">
        <div class="max-w-md">
          <div class="grid grid-cols-1 gap-2">
            <Selector
              title="Mode"
              :options="allDemoModes"
              v-model="demoModel.type"
            />
            <InputSlider
              title="Offset"
              v-model="demoModel.offset"
              :min="-100"
              :max="100"
            />
            <InputSlider
              v-if="demoModel.type === DemoMode.Offset"
              title="Offset Count"
              v-model="demoModel.repeatOffsetCount"
              :min="0"
              :max="100"
            />
            <CheckBox
              v-if="demoModel.type === DemoMode.Offset"
              label="Handle Self Intersects"
              v-model="demoModel.handleSelfIntersects"
            />
            <CheckBox
              v-if="demoModel.type === DemoMode.RawOffset"
              label="Show Dual Raw Offset"
              v-model="demoModel.showDualRawOffset"
            />
            <CheckBox
              v-if="demoModel.type === DemoMode.RawOffset"
              label="Show Self Intersects"
              v-model="demoModel.showRawOffsetIntersects"
            />
          </div>
          <PlineJsonEditor v-model="plineJsonStr" />
        </div>
        <div class="block mt-2">
          <button class="basic-button" @click="copyRustTestCode">
            Copy Test Code
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, unref, defineComponent, reactive } from "vue";
import PlineOffsetScene from "@/components/pline_offset/PlineOffsetScene.vue";
import * as shapes from "@/core/shapes";
import * as utils from "@/core/utils";
import InputSlider from "@/components/common/InputSlider.vue";
import Selector from "@/components/common/Selector.vue";
import CheckBox from "@/components/common/CheckBox.vue";
import PlineJsonEditor from "@/components/common/PlineJsonEditor.vue";
import {
  DemoMode,
  allDemoModesAsStrings,
  DemoModelStorage,
} from "@/components/pline_offset/pline_offset";

export default defineComponent({
  name: "PlineOffsetDemo",
  components: {
    PlineOffsetScene,
    InputSlider,
    Selector,
    CheckBox,
    PlineJsonEditor,
  },
  props: {},
  setup() {
    let modelData: DemoModelStorage = {
      type: DemoMode.Offset,
      offset: 3.0,
      repeatOffsetCount: 50,
      handleSelfIntersects: true,
      showDualRawOffset: false,
      showRawOffsetIntersects: false,
    };

    let demoModel = reactive(modelData);

    const plineJsonStr = ref(
      utils.plineArrayToJsonStr(shapes.createExample1PlineVertexes(10), true)
    );

    const allDemoModes = ref(allDemoModesAsStrings());

    const plineOffsetSceneRef = ref<typeof PlineOffsetScene | null>(null);

    const copyRustTestCode = () => {
      const scene = utils.valueOrThrow(unref(plineOffsetSceneRef));
      utils.copyToClipboard(scene.getRustTestCodeString());
    };

    return {
      allDemoModes,
      plineOffsetSceneRef,
      copyRustTestCode,
      DemoMode,
      demoModel,
      plineJsonStr,
    };
  },
});
</script>
