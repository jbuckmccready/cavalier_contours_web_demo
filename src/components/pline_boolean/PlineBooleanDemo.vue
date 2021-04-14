<template>
  <div class="w-full h-full flex flex-row">
    <div class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2">
      <PlineBooleanScene
        ref="plineBooleanSceneRef"
        :current-boolean-op="currentBooleanOp"
        :fill-polylines="fillPolylines"
      />
    </div>
    <div class="w-auto overflow-auto">
      <div class="py-4 px-4">
        <div class="mt-8 max-w-md">
          <div class="grid grid-cols-1 gap-6">
            <label class="block">
              <span class="text-gray-700">Boolean Op</span>
              <select
                v-model="currentBooleanOp"
                class="block w-full mt-1 rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
              >
                <option v-for="mode in allBooleanOps" :key="mode">
                  {{ mode }}
                </option>
              </select>
            </label>
          </div>
        </div>
        <div class="block mt-2">
          <label class="inline-flex items-center">
            <input
              v-model="fillPolylines"
              type="checkbox"
              class="rounded bg-gray-200 border-transparent focus:border-transparent focus:bg-gray-200 text-gray-700 focus:ring-1 focus:ring-offset-2 focus:ring-gray-500"
            />
            <span class="ml-2">Fill Polylines</span>
          </label>
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
import { ref, defineComponent } from "vue";
import PlineBooleanScene from "@/components/pline_boolean/PlineBooleanScene.vue";
import {
  allBooleanOpsAsStrings,
  BooleanOp,
} from "@/components/pline_boolean/pline_boolean";
import * as utils from "@/core/utils";

export default defineComponent({
  name: "PlineBooleanDemo",
  components: {
    PlineBooleanScene,
  },
  props: {},
  setup() {
    let currentBooleanOp = ref(BooleanOp[BooleanOp.None]);
    const allBooleanOps = allBooleanOpsAsStrings();
    let fillPolylines = ref(true);

    const plineBooleanSceneRef = ref<typeof PlineBooleanScene | null>(null);

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
    };
  },
});
</script>
