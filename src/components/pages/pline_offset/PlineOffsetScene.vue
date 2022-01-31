<script setup lang="ts">
import { ref, unref, watch, PropType } from "vue";
import { HIT_DELTA, Point, SceneRenderer } from "@/components/canvas_scene/scene_renderer";
import {
  DemoMode,
  drawOffsetScene,
  OffsetDemoModel,
} from "@/components/pages/pline_offset/pline_offset";
import * as utils from "@/core/utils";
import CanvasScene from "@/components/canvas_scene/CanvasScene.vue";
import { Polyline } from "cavalier_contours_web_ffi";

const props = defineProps({
  model: {
    type: Object as PropType<OffsetDemoModel>,
    required: true,
  },
  plineJsonStr: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (event: "update:plineJsonStr", value: string): void;
}>();

const canvasSceneRef = ref<typeof CanvasScene>();
let o = utils.jsonStrToPlineArray(props.plineJsonStr);
let pline1Array = o.array;
let pline1IsClosed = o.isClosed;

function drawToScene(scene: SceneRenderer) {
  drawOffsetScene(scene, pline1Array, pline1IsClosed, props.model);
}

let grabbedIndex = -1;

const dragBeginHandler = (payload: { pt: Point; renderer: SceneRenderer; handled: boolean }) => {
  for (let i = 0; i < pline1Array.length; i += 3) {
    let vertexPt = { x: pline1Array[i], y: pline1Array[i + 1] };
    if (payload.renderer.scaledHitTest(payload.pt, vertexPt, HIT_DELTA)) {
      grabbedIndex = i;
      payload.handled = true;
    }
  }
};

const draggingHandler = (payload: { pt: Point; renderer: SceneRenderer }) => {
  if (grabbedIndex < 0) {
    return;
  }
  pline1Array[grabbedIndex] = payload.pt.x;
  pline1Array[grabbedIndex + 1] = payload.pt.y;
  emit("update:plineJsonStr", utils.plineArrayToJsonStr(pline1Array, pline1IsClosed));
  // scene will be redrawn due to plineJsonStr update
};

const dragReleaseHandler = () => {
  grabbedIndex = -1;
};

watch(props.model, () => {
  const scene = utils.valueOrThrow(unref(canvasSceneRef));
  scene.requestRender();
});
watch(
  () => props.plineJsonStr,
  () => {
    let o = utils.jsonStrToPlineArray(props.plineJsonStr);
    pline1Array = o.array;
    pline1IsClosed = o.isClosed;
    const scene = utils.valueOrThrow(unref(canvasSceneRef));
    scene.requestRender();
  }
);

const getRustTestCodeString = () => {
  const model = props.model;
  const handleSelfIntersects = model.type === DemoMode.Offset ? model.handleSelfIntersects : true;
  let pline1 = new Polyline(pline1Array, pline1IsClosed);
  let offsetResults = pline1.parallelOffset(model.offset, handleSelfIntersects);
  let inputPlineStr = utils.createPlineRustCodeStr(pline1);
  let testPropertiesStr = utils.createPlinePropertiesSetRustCodeStr(offsetResults);
  let result = `(${inputPlineStr}, ${utils.toRustf64Str(model.offset)}) =>
                    ${testPropertiesStr}`;
  offsetResults.forEach((r) => r.free());
  pline1.free();
  return result;
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
