<script setup lang="ts">
import { ref } from "vue";
import PlineBooleanScene from "@/components/pages/pline_boolean/PlineBooleanScene.vue";
import CheckBox from "@/components/common/CheckBox.vue";
import Selector from "@/components/common/Selector.vue";
import PlineJsonEditor from "@/components/common/PlineJsonEditor.vue";
import PrimaryButton from "@/components/common/PrimaryButton.vue";
import { allBooleanOpsAsStrings } from "@/components/pages/pline_boolean/pline_boolean";
import * as utils from "@/core/utils";
import state from "@/components/pages/pline_boolean/pline_boolean_state";

const allBooleanOps = Object.freeze(allBooleanOpsAsStrings());

const plineBooleanSceneRef = ref<typeof PlineBooleanScene>();

const copyRustTestCode = () => {
  const scene = plineBooleanSceneRef.value;
  utils.copyToClipboard(utils.valueOrThrow(scene).getRustTestCodeString());
};
</script>

<template>
  <q-splitter v-model="state.splitterModel" :limits="[25, 90]" style="height: inherit">
    <template #before>
      <PlineBooleanScene
        ref="plineBooleanSceneRef"
        v-model:pline1JsonStr="state.pline1JsonStr"
        v-model:pline2JsonStr="state.pline2JsonStr"
        :current-boolean-op="state.booleanOp"
        :fill-polylines="state.fillPolylines"
      />
    </template>
    <template #after>
      <div class="q-pa-sm q-gutter-sm">
        <Selector v-model="state.booleanOp" label="Boolean Op" :options="allBooleanOps" />
        <CheckBox v-model="state.fillPolylines" label="Fill Polylines" />
        <PlineJsonEditor
          :model-value="state.pline1JsonStr"
          label="Polyline 1"
          @submitted-value="(v) => (state.pline1JsonStr = v)"
        />
        <PlineJsonEditor
          :model-value="state.pline2JsonStr"
          label="Polyline 2"
          @submitted-value="(v) => (state.pline2JsonStr = v)"
        />
        <PrimaryButton label="Copy Test Code" @click="copyRustTestCode" />
      </div>
    </template>
  </q-splitter>
</template>
