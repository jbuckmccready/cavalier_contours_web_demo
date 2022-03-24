<script setup lang="ts">
import PlineOffsetScene from "@/components/pages/pline_offset/PlineOffsetScene.vue";
import { ref, unref } from "vue";
import CheckBox from "@/components/common/CheckBox.vue";
import InputSlider from "@/components/common/InputSlider.vue";
import Selector from "@/components/common/Selector.vue";
import PlineJsonEditor from "@/components/common/PlineJsonEditor.vue";
import PrimaryButton from "@/components/common/PrimaryButton.vue";
import * as utils from "@/core/utils";
import {
  OffsetDemoMode,
  allDemoModesAsStrings,
} from "@/components/pages/pline_offset/pline_offset";

import state from "@/components/pages/pline_offset/pline_offset_state";

const allDemoModes = Object.freeze(allDemoModesAsStrings());

const plineOffsetSceneRef = ref<typeof PlineOffsetScene>();

const copyRustTestCode = () => {
  const scene = utils.valueOrThrow(unref(plineOffsetSceneRef));
  utils.copyToClipboard(scene.getRustTestCodeString());
};
</script>

<template>
  <q-splitter v-model="state.splitterModel" :limits="[25, 90]" style="height: inherit">
    <template #before>
      <PlineOffsetScene
        ref="plineOffsetSceneRef"
        v-model:plineJsonStr="state.plineJsonStr"
        :model="state"
      />
    </template>

    <template #after>
      <div class="q-pa-sm q-gutter-sm">
        <Selector v-model="state.type" :options="allDemoModes" label="Mode" />
        <InputSlider v-model.number="state.offset" :min="-100" :max="100" label="Offset" />
        <InputSlider
          v-model.number="state.repeatOffsetCount"
          label="Offset Count"
          :min="0"
          :max="100"
        />
        <div v-if="state.type === OffsetDemoMode.Offset">
          <CheckBox v-model="state.handleSelfIntersects" label="Handle Self Intersects" />
        </div>
        <div v-if="state.type === OffsetDemoMode.RawOffset">
          <CheckBox v-model="state.showDualRawOffset" label="Show Dual Raw Offset" />
          <CheckBox v-model="state.showRawOffsetIntersects" label="Show Self Intersects" />
        </div>
        <PlineJsonEditor
          :model-value="state.plineJsonStr"
          label="Polyline"
          @submitted-value="(v) => (state.plineJsonStr = v)"
        />
        <PrimaryButton label="Copy Test Code" @click="copyRustTestCode" />
      </div>
    </template>
  </q-splitter>
</template>
