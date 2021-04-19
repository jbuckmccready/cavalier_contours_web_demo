<template>
  <div class="box-border w-full h-full overflow-hidden bg-gray-600">
    <canvas ref="canvasRef" class="bg-white block m-auto" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  toRefs,
  unref,
  onMounted,
  watch,
  PropType,
} from "vue";

import { CanvasScene, SimpleColors, HIT_DELTA, COLORS } from "@/core/rendering";
import { createCirclePts, createSegAABB } from "@/core/shapes";
import { DemoMode } from "@/components/static_aabb2d_index/static_aabb2d";
import * as utils from "@/core/utils";
import { CavcModuleKey } from "@/types";

export default defineComponent({
  name: "StaticAABB2DIndexScene",
  props: {
    currentDemoMode: {
      type: String as PropType<DemoMode>,
      default: DemoMode.None,
    },
    vertexCount: {
      type: Number,
      default: 100,
    },
    indexNodeSize: {
      type: Number,
      default: 16,
    },
    editShape: {
      type: Boolean,
      default: false,
    },
    neighborDistance: {
      type: Number,
      default: 100,
    },
  },
  setup(props) {
    const {
      currentDemoMode,
      vertexCount,
      indexNodeSize,
      editShape,
      neighborDistance,
    } = toRefs(props);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const wasm = utils.injectStrict(CavcModuleKey);
    let canvasScene: CanvasScene | null = null;

    let queryBox = [300, 40, 500, 500];

    const queryMinX = () => Math.min(queryBox[0], queryBox[2]);
    const queryMinY = () => Math.min(queryBox[1], queryBox[3]);
    const queryMaxX = () => Math.max(queryBox[0], queryBox[2]);
    const queryMaxY = () => Math.max(queryBox[1], queryBox[3]);

    let neighborsCircleCenter = [0, 0];

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

    function drawToScene(scene: CanvasScene) {
      const index = new wasm.StaticAABB2DIndex(boxes, unref(indexNodeSize));
      const mode = unref(currentDemoMode);
      switch (mode) {
        case DemoMode.None:
          break;
        case DemoMode.IndexBoxes: {
          const allBoxes = index.allBoxes();
          const levelBounds = index.levelBounds();
          let currentBoundIndex = 0;
          let currentBound = levelBounds[0];

          for (let i = 0; i < allBoxes.length; i += 4) {
            if (i === currentBound) {
              currentBoundIndex += 1;
              currentBound = levelBounds[currentBoundIndex];
            }
            scene.drawRectFromBounds(
              allBoxes[i],
              allBoxes[i + 1],
              allBoxes[i + 2],
              allBoxes[i + 3],
              { color: COLORS[currentBoundIndex % COLORS.length] }
            );
          }
          break;
        }
        case DemoMode.QueryBox: {
          scene.drawRectFromBounds(
            queryMinX(),
            queryMinY(),
            queryMaxX(),
            queryMaxY(),
            {
              color: SimpleColors.Blue,
            }
          );

          scene.drawScaledRect(queryBox[0], queryBox[1], HIT_DELTA, HIT_DELTA, {
            fill: true,
            color: SimpleColors.Blue,
          });
          scene.drawScaledRect(queryBox[0], queryBox[3], HIT_DELTA, HIT_DELTA, {
            fill: true,
            color: SimpleColors.Blue,
          });
          scene.drawScaledRect(queryBox[2], queryBox[3], HIT_DELTA, HIT_DELTA, {
            fill: true,
            color: SimpleColors.Blue,
          });
          scene.drawScaledRect(queryBox[2], queryBox[1], HIT_DELTA, HIT_DELTA, {
            fill: true,
            color: SimpleColors.Blue,
          });
          let queryResults = index.query(
            queryMinX(),
            queryMinY(),
            queryMaxX(),
            queryMaxY()
          );
          for (let i = 0; i < boxes.length; i += 4) {
            let color = SimpleColors.Gray;
            if (queryResults.includes(i / 4)) {
              color = SimpleColors.Red;
            }
            scene.drawRectFromBounds(
              boxes[i],
              boxes[i + 1],
              boxes[i + 2],
              boxes[i + 3],
              {
                color: color,
              }
            );
          }

          break;
        }
        case DemoMode.Neighbors: {
          scene.drawScaledRect(
            neighborsCircleCenter[0],
            neighborsCircleCenter[1],
            HIT_DELTA,
            HIT_DELTA,
            { fill: true, color: SimpleColors.Blue }
          );

          const maxDistance = unref(neighborDistance);
          let neighborResults = index.neighbors(
            neighborsCircleCenter[0],
            neighborsCircleCenter[1],
            1000,
            maxDistance
          );

          scene.drawCircle(
            neighborsCircleCenter[0],
            neighborsCircleCenter[1],
            maxDistance
          );

          for (let i = 0; i < boxes.length; i += 4) {
            let color = SimpleColors.Gray;
            let resultIdx = neighborResults.findIndex((x) => x === i / 4);
            if (resultIdx !== -1) {
              color = SimpleColors.Red;
            }
            scene.drawRectFromBounds(
              boxes[i],
              boxes[i + 1],
              boxes[i + 2],
              boxes[i + 3],
              {
                color: color,
              }
            );
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
          scene.drawScaledRect(
            circlePoints[i],
            circlePoints[i + 1],
            HIT_DELTA,
            HIT_DELTA,
            { fill: true, color: SimpleColors.Black }
          );
        }
      }
    }

    function setupCanvasScene() {
      const canvas = utils.valueOrThrow(unref(canvasRef));
      canvas.width = 1000;
      canvas.height = 1000;

      let scene = new CanvasScene(canvas, drawToScene);

      let isQueryBoxGrabbed = false;
      let grabbedXIdx = -1;
      let grabbedYIdx = -1;

      let isNeighborsCircleGrabbed = false;

      scene.dragBeginHandler = (pt: { x: number; y: number }) => {
        const grabCorner = (xIdx: number, yIdx: number) => {
          let cornerPt = { x: queryBox[xIdx], y: queryBox[yIdx] };

          if (scene.scaledHitTest(pt, cornerPt, HIT_DELTA)) {
            grabbedXIdx = xIdx;
            grabbedYIdx = yIdx;
            return true;
          }

          return false;
        };

        if (unref(currentDemoMode) === DemoMode.QueryBox) {
          if (
            grabCorner(0, 1) ||
            grabCorner(0, 3) ||
            grabCorner(2, 1) ||
            grabCorner(2, 3)
          ) {
            isQueryBoxGrabbed = true;
            return true;
          }
        } else if (unref(currentDemoMode) === DemoMode.Neighbors) {
          if (
            scene.scaledHitTest(
              pt,
              { x: neighborsCircleCenter[0], y: neighborsCircleCenter[1] },
              HIT_DELTA
            )
          ) {
            isNeighborsCircleGrabbed = true;
            grabbedXIdx = 0;
            grabbedYIdx = 1;
            return true;
          }
        }

        if (unref(editShape)) {
          for (let i = 0; i < circlePoints.length - 1; i += 2) {
            if (
              scene.scaledHitTest(
                pt,
                { x: circlePoints[i], y: circlePoints[i + 1] },
                HIT_DELTA
              )
            ) {
              grabbedXIdx = i;
              grabbedYIdx = i + 1;
              return true;
            }
          }
        }

        grabbedXIdx = -1;
        grabbedYIdx = -1;
        return false;
      };

      scene.draggingHandler = (pt: { x: number; y: number }) => {
        if (grabbedXIdx < 0 || grabbedYIdx < 0) {
          return;
        }

        if (isQueryBoxGrabbed) {
          queryBox[grabbedXIdx] = pt.x;
          queryBox[grabbedYIdx] = pt.y;
        } else if (isNeighborsCircleGrabbed) {
          neighborsCircleCenter[0] = pt.x;
          neighborsCircleCenter[1] = pt.y;
        } else {
          shapeMutated();
          circlePoints[grabbedXIdx] = pt.x;
          circlePoints[grabbedYIdx] = pt.y;
        }
        scene.redrawScene();
      };

      scene.dragReleaseHandler = () => {
        grabbedXIdx = -1;
        grabbedYIdx = -1;
        isQueryBoxGrabbed = false;
        isNeighborsCircleGrabbed = false;
      };

      canvasScene = scene;
      canvasScene.redrawScene();
    }

    watch([vertexCount], () => {
      shapeChanged();
      utils.valueOrThrow(canvasScene).redrawScene();
    });
    watch([currentDemoMode, indexNodeSize, editShape, neighborDistance], () => {
      utils.valueOrThrow(canvasScene).redrawScene();
    });

    onMounted(() => {
      setupCanvasScene();
    });

    return {
      canvasRef,
    };
  },
});
</script>

<style scoped></style>
