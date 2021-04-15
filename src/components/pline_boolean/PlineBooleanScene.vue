<template>
  <div class="box-border w-full h-full overflow-hidden bg-gray-600">
    <canvas ref="canvasRef" class="bg-white block m-auto" />
  </div>
</template>

<script lang="ts">
import {
  ref,
  toRefs,
  unref,
  onMounted,
  watchEffect,
  watch,
  defineComponent,
} from "vue";

import {
  CanvasScene,
  HIT_DELTA,
  COLORS,
  SimpleColors,
} from "@/core/rendering2";
import * as shapes from "@/core/shapes";
import {
  BooleanOp,
  allBooleanOps,
} from "@/components/pline_boolean/pline_boolean";
import * as utils from "@/core/utils";
import { CavcModuleKey, Polyline } from "@/types";

export default defineComponent({
  name: "PlineBooleanScene",
  props: {
    currentBooleanOp: {
      type: String,
      default: BooleanOp[BooleanOp.None],
    },
    fillPolylines: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { currentBooleanOp, fillPolylines } = toRefs(props);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const wasm = utils.injectStrict(CavcModuleKey);
    let canvasScene: CanvasScene | null = null;

    let pline1Array = shapes.createExample1PlineVertexes(10);
    pline1Array[3] = 3;
    pline1Array[4] = 10;

    let pline2Array = shapes.createExample1PlineVertexes(10);

    // helper function to perform boolean operation between two polylines, visit all results
    // and free/clean up memory
    let visitBoolean = (
      p1: Polyline,
      p2: Polyline,
      op: BooleanOp,
      posVisitor: (pline: Polyline, index: number) => void,
      negVisitor: (pline: Polyline, index: number) => void,
      free = true
    ) => {
      let result = p1.boolean(p2, op);

      result.posPlines.forEach((pline: Polyline, i: number) => {
        posVisitor(pline, i);
        if (free) {
          pline.free();
        }
      });
      result.negPlines.forEach((pline: Polyline, i: number) => {
        negVisitor(pline, i);
        if (free) {
          pline.free();
        }
      });
    };

    function drawToScene(scene: CanvasScene) {
      let pline1 = new wasm.Polyline(pline1Array, true);
      let pline2 = new wasm.Polyline(pline2Array, true);
      pline2.cycleVertexes(2);
      let pline1Color = SimpleColors.Red;
      let pline2Color = SimpleColors.Blue;
      // draw vertexes
      let drawVertexes = (vertexes: Float64Array, color: SimpleColors) => {
        for (let i = 0; i < vertexes.length; i += 3) {
          scene.drawScaledRect(
            vertexes[i],
            vertexes[i + 1],
            HIT_DELTA,
            HIT_DELTA,
            {
              fill: true,
              color: color,
            }
          );
        }
      };

      drawVertexes(pline1.vertexData(), pline1Color);
      drawVertexes(pline2.vertexData(), pline2Color);

      // draw polylines/boolean result
      let op = BooleanOp[unref(currentBooleanOp) as keyof typeof BooleanOp];
      let fill = unref(fillPolylines);
      if (op === BooleanOp.None) {
        scene.drawCavcPolyline(pline1, { color: pline1Color, fill: fill });
        scene.drawCavcPolyline(pline2, { color: pline2Color, fill: fill });
      } else {
        let processPosPline = (pline: Polyline, i: number) => {
          let color = COLORS[i % COLORS.length];
          scene.drawCavcPolyline(pline, { fill: fill, color: color });
        };

        let processNegPline = (pline: Polyline) => {
          let color = fill ? SimpleColors.White : SimpleColors.Black;
          scene.drawCavcPolyline(pline, {
            fill: fill,
            color: color,
            // noTransparency: true,
          });
        };

        visitBoolean(pline1, pline2, op, processPosPline, processNegPline);
      }

      pline1.free();
      pline2.free();
    }

    function setupCanvasScene() {
      const canvas = utils.valueOrThrow(unref(canvasRef));
      canvas.width = 1000;
      canvas.height = 1000;

      let grabbedIndex = -1;
      let grabbedPlineArr = pline1Array;

      let scene = new CanvasScene(canvas, drawToScene);

      scene.dragBeginHandler = (pt: { x: number; y: number }) => {
        let tryGrabPline = (plineArr: Float64Array) => {
          for (let i = 0; i < plineArr.length; i += 3) {
            let vertexPt = { x: plineArr[i], y: plineArr[i + 1] };
            if (scene.scaledHitTest(pt, vertexPt, HIT_DELTA)) {
              grabbedPlineArr = plineArr;
              grabbedIndex = i;
              return true;
            }
          }

          return false;
        };

        if (tryGrabPline(pline1Array) || tryGrabPline(pline2Array)) {
          return true;
        }

        return false;
      };

      scene.draggingHandler = (pt: { x: number; y: number }) => {
        if (grabbedIndex < 0) {
          return;
        }

        grabbedPlineArr[grabbedIndex] = pt.x;
        grabbedPlineArr[grabbedIndex + 1] = pt.y;
        scene.redrawScene();
      };

      scene.dragReleaseHandler = () => {
        grabbedIndex = -1;
      };

      canvasScene = scene;

      canvasScene.redrawScene();
    }

    watchEffect(() =>
      console.log("currentBooleanOp:", unref(currentBooleanOp))
    );
    watchEffect(() => console.log("fillPolylines:", unref(fillPolylines)));

    watch([currentBooleanOp, fillPolylines], () =>
      utils.valueOrThrow(canvasScene).redrawScene()
    );

    onMounted(() => {
      setupCanvasScene();
    });

    const getRustTestCodeString = () => {
      let pline1 = new wasm.Polyline(pline1Array, true);
      let pline2 = new wasm.Polyline(pline2Array, true);

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
            (p) =>
              resultPosPlineProperties.push(
                utils.createPlineTestPropertiesRustCodeStr(p)
              ),
            (p) =>
              resultNegPlineProperties.push(
                utils.createPlineTestPropertiesRustCodeStr(p)
              )
          );

          result +=
            `    (BooleanOp::${op}, &[` +
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

    return {
      canvasRef,
      getRustTestCodeString,
    };
  },
});
</script>

<style scoped></style>
