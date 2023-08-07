<script setup lang="ts">
import { ref, unref, watch, toRefs } from "vue";
import { HIT_DELTA, Point, SceneRenderer } from "@/components/canvas_scene/scene_renderer";
import * as utils from "@/core/utils";
import CanvasScene from "@/components/canvas_scene/CanvasScene.vue";
import { Polyline } from "cavalier_contours_web_ffi";
import {
  BooleanOp,
  allBooleanOps,
  visitBoolean,
  drawBooleanScene,
} from "@/components/pages/pline_boolean/pline_boolean";

interface Props {
  currentBooleanOp: string;
  fillPolylines: boolean;
  pline1JsonStr: string;
  pline2JsonStr: string;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "update:pline1JsonStr", value: string): void;
  (event: "update:pline2JsonStr", value: string): void;
}>();

const { currentBooleanOp, fillPolylines, pline1JsonStr, pline2JsonStr } = toRefs(props);
const canvasSceneRef = ref<typeof CanvasScene>();

let pline1Array = utils.jsonStrToPlineArray(unref(pline1JsonStr)).array;
let pline2Array = utils.jsonStrToPlineArray(unref(pline2JsonStr)).array;

function drawToScene(scene: SceneRenderer) {
  let op = BooleanOp[unref(currentBooleanOp) as keyof typeof BooleanOp];
  drawBooleanScene(scene, pline1Array, pline2Array, op, unref(fillPolylines));
}

let grabbedIndex = -1;
let isPline1Grabbed = true;

const dragBeginHandler = (payload: { pt: Point; renderer: SceneRenderer; handled: boolean }) => {
  let tryGrabPline = (plineArr: Float64Array, isPline1: boolean) => {
    for (let i = 0; i < plineArr.length; i += 3) {
      let vertexPt = { x: plineArr[i], y: plineArr[i + 1] };
      if (payload.renderer.scaledHitTest(payload.pt, vertexPt, HIT_DELTA)) {
        isPline1Grabbed = isPline1;
        grabbedIndex = i;
        return true;
      }
    }
    return false;
  };

  payload.handled = tryGrabPline(pline1Array, true) || tryGrabPline(pline2Array, false);
};

const draggingHandler = (payload: { pt: Point; renderer: SceneRenderer }) => {
  if (grabbedIndex < 0) {
    return;
  }
  let grabbedPlineArr = pline1Array;
  if (!isPline1Grabbed) {
    grabbedPlineArr = pline2Array;
  }
  grabbedPlineArr[grabbedIndex] = payload.pt.x;
  grabbedPlineArr[grabbedIndex + 1] = payload.pt.y;
  if (isPline1Grabbed) {
    emit("update:pline1JsonStr", utils.plineArrayToJsonStr(pline1Array, true));
  } else {
    emit("update:pline2JsonStr", utils.plineArrayToJsonStr(pline2Array, true));
  }
  // scene will be redrawn due to jsonStr update
};

const dragReleaseHandler = () => {
  grabbedIndex = -1;
};

watch([currentBooleanOp, fillPolylines], () =>
  utils.valueOrThrow(unref(canvasSceneRef)).requestRender()
);
watch(pline1JsonStr, () => {
  let v = unref(pline1JsonStr);
  let o = utils.jsonStrToPlineArray(v);
  pline1Array = o.array;
  utils.valueOrThrow(unref(canvasSceneRef)).requestRender();
});
watch(pline2JsonStr, () => {
  let v = unref(pline2JsonStr);
  let o = utils.jsonStrToPlineArray(v);
  pline2Array = o.array;
  utils.valueOrThrow(unref(canvasSceneRef)).requestRender();
});

const getRustTestCodeString = () => {
  let pline1 = new Polyline(pline1Array, true);
  let pline2 = new Polyline(pline2Array, true);
  let result = "(\n    ";
  result += utils.createPlineRustCodeStr(pline1) + ",\n";
  result += "    " + utils.createPlineRustCodeStr(pline2) + "\n)\n=>\n[\n";
  let resultPosPlineProperties: string[] = [];
  let resultNegPlineProperties: string[] = [];
  allBooleanOps()
    .slice(1)
    .forEach((op) => {
      visitBoolean(
        pline1,
        pline2,
        op,
        (p) => resultPosPlineProperties.push(utils.createPlineTestPropertiesRustCodeStr(p)),
        (p) => resultNegPlineProperties.push(utils.createPlineTestPropertiesRustCodeStr(p))
      );
      result +=
        `    (BooleanOp::${BooleanOp[op]}, &[` +
        resultPosPlineProperties.join(", ") +
        "], &[" +
        resultNegPlineProperties.join(", ") +
        "]),\n";
      resultPosPlineProperties = [];
      resultNegPlineProperties = [];
    });
  result = result.slice(0, -2) + "\n]";
  pline1.free();
  pline2.free();
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
