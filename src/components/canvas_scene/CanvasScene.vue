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
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

let sceneRenderer: SceneRenderer | null = null;

onMounted(() => {
  console.log("scene mounted");
  const canvas = utils.valueOrThrow(unref(canvasRef));

  sceneRenderer = new SceneRenderer(canvas, (renderer) => {
    emit("rendering", renderer);
  });

  if (props.resizeToParent) {
    resizeScene();
    window.addEventListener("resize", resizeScene);
  }
});

const resizeScene = () => {
  const canvas = unref(canvasRef);
  console.log("resizeScene called");
  if (canvas === null || sceneRenderer === null) {
    return;
  }

  console.log("resizing scene");
  if (canvas.parentNode?.ELEMENT_NODE !== 0) {
    let container = (canvas.parentNode as HTMLElement).getBoundingClientRect();
    sceneRenderer.resize(container.width, container.height);
  }
};

watch(
  () => props.resizeToParent,
  () => {
    console.log("resizeToParent changed:", props.resizeToParent);
    if (props.resizeToParent) {
      window.addEventListener("resize", resizeScene);
    } else {
      window.removeEventListener("resize", resizeScene);
    }
  }
);

onUnmounted(() => {
  console.log("scene unmounted");
  window.removeEventListener("resize", resizeScene);
});
</script>

<template>
  <canvas ref="canvasRef" class="bg-white block m-auto"> </canvas>
</template>

<style scoped></style>
