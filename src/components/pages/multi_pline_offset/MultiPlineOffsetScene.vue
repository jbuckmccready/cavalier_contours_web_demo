<script setup lang="ts">
import { ref, unref, watch } from "vue";
import { HIT_DELTA, Point, SceneRenderer } from "@/components/canvas_scene/scene_renderer";
import * as utils from "@/core/utils";
import CanvasScene from "@/components/canvas_scene/CanvasScene.vue";
import { Polyline, plineParallelOffset } from "cavalier_contours_web_ffi";
import {
  OffsetDemoMode,
  drawOffsetScene,
  OffsetDemoModel,
} from "@/components/pages/multi_pline_offset/multi_pline_offset";
import { Pline } from "@/core/cavc_types";

interface Props {
  model: OffsetDemoModel;
  plineJsonStr: string;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "update:plineJsonStr", value: string): void;
}>();

const canvasSceneRef = ref<typeof CanvasScene>();
let inputPlines: Pline[] = JSON.parse(props.plineJsonStr);

function drawToScene(renderer: SceneRenderer) {
  console.log("drawToScene");
  drawOffsetScene(renderer, inputPlines, props.model);
}

let grabbedVertexIndex = -1;
let grabbedPlineIndex = -1;

const dragBeginHandler = (payload: { pt: Point; renderer: SceneRenderer; handled: boolean }) => {
  for (let i = 0; i < inputPlines.length; i++) {
    let plineVertexes = inputPlines[i].vertexes;
    for (let j = 0; j < plineVertexes.length; j++) {
      let vertexPt = { x: plineVertexes[j][0], y: plineVertexes[j][1] };
      if (payload.renderer.scaledHitTest(payload.pt, vertexPt, HIT_DELTA)) {
        grabbedPlineIndex = i;
        grabbedVertexIndex = j;
        payload.handled = true;
      }
    }
  }
};

const draggingHandler = (payload: { pt: Point; renderer: SceneRenderer }) => {
  if (grabbedPlineIndex < 0 || grabbedVertexIndex < 0) {
    return;
  }
  let plineVertexes = inputPlines[grabbedPlineIndex].vertexes;
  plineVertexes[grabbedVertexIndex][0] = payload.pt.x;
  plineVertexes[grabbedVertexIndex][1] = payload.pt.y;
  emit("update:plineJsonStr", utils.plinesToJsonStr(inputPlines));
  //   scene will be redrawn due to plineJsonStr update
};

const dragReleaseHandler = () => {
  grabbedVertexIndex = -1;
  grabbedPlineIndex = -1;
};

watch(props.model, () => {
  const scene = utils.valueOrThrow(unref(canvasSceneRef));
  scene.requestRender();
});
watch(
  () => props.plineJsonStr,
  () => {
    inputPlines = JSON.parse(props.plineJsonStr);
    const scene = utils.valueOrThrow(unref(canvasSceneRef));
    scene.requestRender();
  }
);

const getRustTestCodeString = () => {
  //   const model = props.model;
  //   const handleSelfIntersects =
  //     model.type === OffsetDemoMode.Offset ? model.handleSelfIntersects : true;
  //   let pline1 = new Polyline(pline1Array, pline1IsClosed);
  //   let offsetResults = pline1.parallelOffset(model.offset, handleSelfIntersects);
  //   let inputPlineStr = utils.createPlineRustCodeStr(pline1);
  //   let testPropertiesStr = utils.createPlinePropertiesSetRustCodeStr(offsetResults);
  //   let result = `(${inputPlineStr}, ${utils.toRustf64Str(model.offset)}) =>
  //                     ${testPropertiesStr}`;
  //   offsetResults.forEach((r) => r.free());
  //   pline1.free();
  //   return result;
};

defineExpose({
  getRustTestCodeString,
});
</script>

<template>
  <CanvasScene
    ref="canvasSceneRef"
    :resize-to-parent="true"
    @rendering="drawToScene"
    @drag-begin="dragBeginHandler"
    @dragging="draggingHandler"
    @drag-release="dragReleaseHandler"
  ></CanvasScene>
</template>

<style scoped></style>
