<template>
  <div class="w-full h-full flex flex-row">
    <div class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2">
      <PlineBooleanScene
        ref="plineBooleanSceneRef"
        :current-boolean-op="currentBooleanOp"
        :fill-polylines="fillPolylines"
        v-model:pline1JsonStr="pline1JsonStr"
        v-model:pline2JsonStr="pline2JsonStr"
      />
    </div>
    <div class="overflow-auto w-1/4">
      <div class="py-4 px-4">
        <div class="mt-8 max-w-md">
          <div class="grid grid-cols-1 gap-6">
            <Selector
              title="Boolean Op"
              :options="allBooleanOps"
              v-model="currentBooleanOp"
            />
          </div>
        </div>
        <CheckBox class="mt-2" label="Fill Polylines" v-model="fillPolylines" />
        <PlineJsonEditor title="Polyline 1" v-model="pline1JsonStr" />
        <PlineJsonEditor title="Polyline 2" v-model="pline2JsonStr" />
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
import { ref, defineComponent } from "vue";
import * as shapes from "@/core/shapes";
import PlineBooleanScene from "@/components/pline_boolean/PlineBooleanScene.vue";
import CheckBox from "@/components/common/CheckBox.vue";
import Selector from "@/components/common/Selector.vue";
import PlineJsonEditor from "@/components/common/PlineJsonEditor.vue";
import {
  allBooleanOpsAsStrings,
  BooleanOp,
} from "@/components/pline_boolean/pline_boolean";
import * as utils from "@/core/utils";

export default defineComponent({
  name: "PlineBooleanDemo",
  components: {
    PlineBooleanScene,
    CheckBox,
    Selector,
    PlineJsonEditor,
  },
  props: {},
  setup() {
    let currentBooleanOp = ref(BooleanOp[BooleanOp.None]);
    const allBooleanOps = allBooleanOpsAsStrings();
    let fillPolylines = ref(true);

    const plineBooleanSceneRef = ref<typeof PlineBooleanScene | null>(null);
    let pline1Array = shapes.createExample1PlineVertexes(10);
    pline1Array[3] = 3;
    pline1Array[4] = 10;
    const pline1JsonStr = ref(utils.plineArrayToJsonStr(pline1Array, true));
    let pline2Array = shapes.createExample1PlineVertexes(10);
    const pline2JsonStr = ref(utils.plineArrayToJsonStr(pline2Array, true));

    const copyRustTestCode = () => {
      const scene = plineBooleanSceneRef.value;
      utils.copyToClipboard(utils.valueOrThrow(scene).getRustTestCodeString());
    };

    return {
      currentBooleanOp,
      allBooleanOps,
      fillPolylines,
      plineBooleanSceneRef,
      copyRustTestCode,
      pline1JsonStr,
      pline2JsonStr,
    };
  },
});
</script>
