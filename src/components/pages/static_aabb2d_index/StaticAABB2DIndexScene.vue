<script setup lang="ts">
import { ref, toRefs, unref, watch } from "vue";

import {
  SimpleColors,
  HIT_DELTA,
  COLORS,
  SceneRenderer,
  Point,
} from "@/components/canvas_scene/scene_renderer";
import { createCirclePts, createSegAABB } from "@/core/shapes";
import { StaticAABBIndexDemoMode } from "@/components/pages/static_aabb2d_index/static_aabb2d_index";
import * as utils from "@/core/utils";
import CanvasScene from "@/components/canvas_scene/CanvasScene.vue";
import { StaticAABB2DIndex } from "cavalier_contours_web_ffi";

interface Props {
  currentDemoMode: StaticAABBIndexDemoMode;
  vertexCount: number;
  indexNodeSize: number;
  editShape: boolean;
  neighborDistance: number;
  neighborsQueryCenter: [number, number];
  queryBox: [number, number, number, number];
}
const props = defineProps<Props>();

const {
  currentDemoMode,
  vertexCount,
  indexNodeSize,
  editShape,
  neighborDistance,
  queryBox,
  neighborsQueryCenter,
} = toRefs(props);
const canvasSceneRef = ref<typeof CanvasScene>();

let qBox = unref(queryBox);

const queryMinX = () => Math.min(qBox[0], qBox[2]);
const queryMinY = () => Math.min(qBox[1], qBox[3]);
const queryMaxX = () => Math.max(qBox[0], qBox[2]);
const queryMaxY = () => Math.max(qBox[1], qBox[3]);

let neighborsCenter = unref(neighborsQueryCenter);

let radius = 500;
let circlePoints = createCirclePts(0, 0, radius, unref(vertexCount));
let boxes = createSegAABB(circlePoints);

function shapeChanged() {
  circlePoints = createCirclePts(0, 0, radius, unref(vertexCount));
  boxes = createSegAABB(circlePoints);
}

function shapeMutated() {
  boxes = createSegAABB(circlePoints);
}

function drawToScene(scene: SceneRenderer) {
  const index = new StaticAABB2DIndex(boxes, unref(indexNodeSize));
  const mode = unref(currentDemoMode);
  switch (mode) {
    case StaticAABBIndexDemoMode.None:
      break;
    case StaticAABBIndexDemoMode.IndexBoxes: {
      const allBoxes = index.allBoxes();
      const levelBounds = index.levelBounds();
      let currentBoundIndex = 0;
      let currentBound = levelBounds[0];

      for (let i = 0; i < allBoxes.length; i += 4) {
        if (i === currentBound) {
          currentBoundIndex += 1;
          currentBound = levelBounds[currentBoundIndex];
        }
        scene.drawRectFromBounds(allBoxes[i], allBoxes[i + 1], allBoxes[i + 2], allBoxes[i + 3], {
          color: COLORS[currentBoundIndex % COLORS.length],
        });
      }
      break;
    }
    case StaticAABBIndexDemoMode.QueryBox: {
      scene.drawRectFromBounds(queryMinX(), queryMinY(), queryMaxX(), queryMaxY(), {
        color: SimpleColors.Blue,
      });

      scene.drawScaledRect(qBox[0], qBox[1], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: SimpleColors.Blue,
      });
      scene.drawScaledRect(qBox[0], qBox[3], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: SimpleColors.Blue,
      });
      scene.drawScaledRect(qBox[2], qBox[3], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: SimpleColors.Blue,
      });
      scene.drawScaledRect(qBox[2], qBox[1], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: SimpleColors.Blue,
      });
      let queryResults = index.query(queryMinX(), queryMinY(), queryMaxX(), queryMaxY());
      for (let i = 0; i < boxes.length; i += 4) {
        let color = SimpleColors.Gray;
        if (queryResults.includes(i / 4)) {
          color = SimpleColors.Red;
        }
        scene.drawRectFromBounds(boxes[i], boxes[i + 1], boxes[i + 2], boxes[i + 3], {
          color: color,
        });
      }

      break;
    }
    case StaticAABBIndexDemoMode.Neighbors: {
      scene.drawScaledRect(neighborsCenter[0], neighborsCenter[1], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: SimpleColors.Blue,
      });

      const maxDistance = unref(neighborDistance);
      let neighborResults = index.neighbors(
        neighborsCenter[0],
        neighborsCenter[1],
        1000,
        maxDistance
      );

      scene.drawCircle(neighborsCenter[0], neighborsCenter[1], maxDistance);

      for (let i = 0; i < boxes.length; i += 4) {
        let color = SimpleColors.Gray;
        let resultIdx = neighborResults.findIndex((x) => x === i / 4);
        if (resultIdx !== -1) {
          color = SimpleColors.Red;
        }
        scene.drawRectFromBounds(boxes[i], boxes[i + 1], boxes[i + 2], boxes[i + 3], {
          color: color,
        });
      }
      break;
    }
    default:
      utils.assertExhaustive(mode);
  }

  index.free();
  scene.drawPolygon(circlePoints);
  if (unref(editShape)) {
    for (let i = 0; i < circlePoints.length - 1; i += 2) {
      scene.drawScaledRect(circlePoints[i], circlePoints[i + 1], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: SimpleColors.Black,
      });
    }
  }
}

let isQueryBoxGrabbed = false;
let grabbedXIdx = -1;
let grabbedYIdx = -1;

let isNeighborsCircleGrabbed = false;

const dragBeginHandler = (payload: { pt: Point; renderer: SceneRenderer; handled: boolean }) => {
  const grabCorner = (xIdx: number, yIdx: number) => {
    let cornerPt = { x: qBox[xIdx], y: qBox[yIdx] };

    if (payload.renderer.scaledHitTest(payload.pt, cornerPt, HIT_DELTA)) {
      grabbedXIdx = xIdx;
      grabbedYIdx = yIdx;
      return true;
    }

    return false;
  };

  if (unref(currentDemoMode) === StaticAABBIndexDemoMode.QueryBox) {
    if (grabCorner(0, 1) || grabCorner(0, 3) || grabCorner(2, 1) || grabCorner(2, 3)) {
      isQueryBoxGrabbed = true;
      payload.handled = true;
      return;
    }
  } else if (unref(currentDemoMode) === StaticAABBIndexDemoMode.Neighbors) {
    if (
      payload.renderer.scaledHitTest(
        payload.pt,
        { x: neighborsCenter[0], y: neighborsCenter[1] },
        HIT_DELTA
      )
    ) {
      isNeighborsCircleGrabbed = true;
      grabbedXIdx = 0;
      grabbedYIdx = 1;
      payload.handled = true;
      return;
    }
  }

  if (unref(editShape)) {
    for (let i = 0; i < circlePoints.length - 1; i += 2) {
      if (
        payload.renderer.scaledHitTest(
          payload.pt,
          { x: circlePoints[i], y: circlePoints[i + 1] },
          HIT_DELTA
        )
      ) {
        grabbedXIdx = i;
        grabbedYIdx = i + 1;
        payload.handled = true;
        return;
      }
    }
  }

  grabbedXIdx = -1;
  grabbedYIdx = -1;
};

const draggingHandler = (payload: { pt: Point; renderer: SceneRenderer }) => {
  if (grabbedXIdx < 0 || grabbedYIdx < 0) {
    return;
  }

  if (isQueryBoxGrabbed) {
    qBox[grabbedXIdx] = payload.pt.x;
    qBox[grabbedYIdx] = payload.pt.y;
  } else if (isNeighborsCircleGrabbed) {
    neighborsCenter[0] = payload.pt.x;
    neighborsCenter[1] = payload.pt.y;
  } else {
    shapeMutated();
    circlePoints[grabbedXIdx] = payload.pt.x;
    circlePoints[grabbedYIdx] = payload.pt.y;
  }
  payload.renderer.redrawScene();
};

const dragReleaseHandler = () => {
  grabbedXIdx = -1;
  grabbedYIdx = -1;
  isQueryBoxGrabbed = false;
  isNeighborsCircleGrabbed = false;
};

watch([vertexCount], () => {
  shapeChanged();
  const scene = utils.valueOrThrow(unref(canvasSceneRef));
  scene.requestRender();
});
watch([currentDemoMode, indexNodeSize, editShape, neighborDistance], () => {
  const scene = utils.valueOrThrow(unref(canvasSceneRef));
  scene.requestRender();
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
