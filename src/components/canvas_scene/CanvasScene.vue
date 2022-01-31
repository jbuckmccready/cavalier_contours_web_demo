<script setup lang="ts">
import { onMounted, onUnmounted, ref, unref, watch } from "vue";
import * as utils from "@/core/utils";
import { SceneRenderer } from "./scene_renderer";

const props = defineProps({
  resizeToParent: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "rendering", renderer: SceneRenderer): void;
  (
    event: "dragBegin",
    payload: { pt: { x: number; y: number }; renderer: SceneRenderer; handled: boolean }
  ): void;
  (event: "dragging", payload: { pt: { x: number; y: number }; renderer: SceneRenderer }): void;
  (event: "dragRelease", renderer: SceneRenderer): void;
}>();

const canvasRef = ref<HTMLCanvasElement>();

let sceneRenderer: SceneRenderer | undefined = undefined;

onMounted(() => {
  const canvas = utils.valueOrThrow(unref(canvasRef));

  sceneRenderer = new SceneRenderer(canvas, (renderer) => {
    emit("rendering", renderer);
  });

  sceneRenderer.dragBeginHandler = (pt) => {
    let payload = { pt, renderer: utils.valueOrThrow(sceneRenderer), handled: false };
    emit("dragBegin", payload);
    return payload.handled;
  };

  sceneRenderer.draggingHandler = (pt) => {
    emit("dragging", { pt, renderer: utils.valueOrThrow(sceneRenderer) });
  };

  sceneRenderer.dragReleaseHandler = () => {
    emit("dragRelease", utils.valueOrThrow(sceneRenderer));
  };

  if (props.resizeToParent) {
    resizeScene();
    window.addEventListener("resize", resizeScene);
  }

  sceneRenderer.center();
});

const resizeScene = () => {
  const canvas = unref(canvasRef);
  if (canvas === undefined || sceneRenderer === undefined) {
    return;
  }

  if (canvas.parentNode?.ELEMENT_NODE !== 0) {
    let container = (canvas.parentNode as HTMLElement).getBoundingClientRect();
    sceneRenderer.resize(container.width, container.height);
  }
};

watch(
  () => props.resizeToParent,
  () => {
    if (props.resizeToParent) {
      window.addEventListener("resize", resizeScene);
    } else {
      window.removeEventListener("resize", resizeScene);
    }
  }
);

onUnmounted(() => {
  window.removeEventListener("resize", resizeScene);
});

const requestRender = () => {
  if (sceneRenderer === undefined) {
    return;
  }
  sceneRenderer.redrawScene();
};

defineExpose({
  requestRender,
});
</script>

<template>
  <canvas ref="canvasRef" class="bg-white block m-auto"> </canvas>
</template>

<style scoped></style>
