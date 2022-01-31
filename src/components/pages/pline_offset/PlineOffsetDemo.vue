<script setup lang="ts">
import PlineOffsetScene from "@/components/pages/pline_offset/PlineOffsetScene.vue";
import { reactive, ref, unref } from "vue";
import CheckBox from "@/components/common/CheckBox.vue";
import InputSlider from "@/components/common/InputSlider.vue";
import Selector from "@/components/common/Selector.vue";
import Button from "@/components/common/Button.vue";
import PlineJsonEditor from "@/components/common/PlineJsonEditor.vue";
import * as shapes from "@/core/shapes";
import * as utils from "@/core/utils";
import {
  DemoMode,
  allDemoModesAsStrings,
  DemoModelStorage,
} from "@/components/pages/pline_offset/pline_offset";

let modelData: DemoModelStorage = {
  type: DemoMode.Offset,
  offset: 3.0,
  repeatOffsetCount: 50,
  handleSelfIntersects: true,
  showDualRawOffset: false,
  showRawOffsetIntersects: false,
};

let demoModel = reactive(modelData);

const plineJsonStr = ref(utils.plineArrayToJsonStr(shapes.createExample1PlineVertexes(10), true));

const allDemoModes = ref(allDemoModesAsStrings());

const plineOffsetSceneRef = ref<typeof PlineOffsetScene>();

const copyRustTestCode = () => {
  const scene = utils.valueOrThrow(unref(plineOffsetSceneRef));
  utils.copyToClipboard(scene.getRustTestCodeString());
};
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <div class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2">
      <PlineOffsetScene
        ref="plineOffsetSceneRef"
        v-model:plineJsonStr="plineJsonStr"
        :model="demoModel"
      />
    </div>
    <div class="overflow-auto w-1/4">
      <div class="py-4 px-4">
        <div class="max-w-md">
          <div class="grid grid-cols-1 gap-2">
            <Selector v-model="demoModel.type" label="Mode" :options="allDemoModes" />
            <InputSlider v-model="demoModel.offset" label="Offset" :min="-100" :max="100" />
            <InputSlider
              v-if="demoModel.type === DemoMode.Offset"
              v-model="demoModel.repeatOffsetCount"
              label="Offset Count"
              :min="0"
              :max="100"
            />
            <CheckBox
              v-if="demoModel.type === DemoMode.Offset"
              v-model="demoModel.handleSelfIntersects"
              label="Handle Self Intersects"
            />
            <CheckBox
              v-if="demoModel.type === DemoMode.RawOffset"
              v-model="demoModel.showDualRawOffset"
              label="Show Dual Raw Offset"
            />
            <CheckBox
              v-if="demoModel.type === DemoMode.RawOffset"
              v-model="demoModel.showRawOffsetIntersects"
              label="Show Self Intersects"
            />
          </div>
          <PlineJsonEditor v-model="plineJsonStr" />
        </div>
        <Button @click="copyRustTestCode">Copy Test Code</Button>
      </div>
    </div>
  </div>
</template>

<style></style>
