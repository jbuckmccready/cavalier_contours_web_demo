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
import { CanvasScene, HIT_DELTA, Point, SimpleColors } from "@/core/rendering";
import {
  DemoMode,
  OffsetDemoModel,
} from "@/components/pline_offset/pline_offset";
import * as utils from "@/core/utils";
import { CavcModuleKey, Polyline } from "@/types";

export default defineComponent({
  name: "PlineOffsetScene",
  props: {
    model: {
      type: Object as PropType<OffsetDemoModel>,
      required: true,
    },
    plineJsonStr: {
      type: String,
      default: "",
    },
  },
  emits: ["update:plineJsonStr"],
  setup(props, { emit }) {
    const { model, plineJsonStr } = toRefs(props);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const wasm = utils.injectStrict(CavcModuleKey);

    let canvasScene: CanvasScene | null = null;

    let o = utils.jsonStrToPlineArray(unref(plineJsonStr));
    let pline1Array = o.array;
    let pline1IsClosed = o.isClosed;

    function drawToScene(scene: CanvasScene) {
      let pline1 = new wasm.Polyline(pline1Array, pline1IsClosed);
      // draw vertexes
      let vertexes = pline1.vertexData();
      for (let i = 0; i < vertexes.length; i += 3) {
        scene.drawScaledRect(
          vertexes[i],
          vertexes[i + 1],
          HIT_DELTA,
          HIT_DELTA,
          {
            fill: true,
            color: SimpleColors.Black,
          }
        );
      }

      // draw polyline
      scene.drawCavcPolyline(pline1, { color: SimpleColors.Black });

      const m = unref(model);

      switch (m.type) {
        case DemoMode.Offset:
          // draw offsets
          if (m.repeatOffsetCount > 0) {
            let isCCWPline = pline1.area() > 0;
            let offsetResults: Polyline[] = pline1.parallelOffset(
              m.offset,
              m.handleSelfIntersects
            );
            let nextResults: Polyline[] = [];
            let offsetCount = 0;
            while (
              offsetResults.length !== 0 &&
              offsetCount < m.repeatOffsetCount
            ) {
              for (let i = 0; i < offsetResults.length; ++i) {
                if (pline1IsClosed) {
                  let offsetIsCCW = offsetResults[i].area() > 0;
                  if (isCCWPline !== offsetIsCCW) {
                    scene.drawCavcPolyline(offsetResults[i], {
                      color: SimpleColors.Red,
                    });
                    continue;
                  }
                }
                scene.drawCavcPolyline(offsetResults[i], {
                  color: SimpleColors.Blue,
                });
                offsetCount += 1;
                offsetResults[i]
                  .parallelOffset(m.offset, m.handleSelfIntersects)
                  .forEach((o: Polyline) => nextResults.push(o));
              }
              offsetResults.forEach((p) => p.free());
              offsetResults = nextResults;
              nextResults = [];
            }

            offsetResults.forEach((p) => p.free());
          }
          break;
        case DemoMode.RawOffset: {
          const drawRawOffset = (
            pline: Polyline,
            offset: number,
            drawIntersects: boolean,
            color: number
          ) => {
            let rawOffsetPline = pline.rawOffset(offset);
            scene.drawCavcPolyline(rawOffsetPline, { color: color });
            if (drawIntersects) {
              const selfIntrs: Point[] = rawOffsetPline.selfIntersects();
              for (let i = 0; i < selfIntrs.length; ++i) {
                const p = selfIntrs[i];
                scene.drawRect(p.x, p.y, HIT_DELTA / 2, HIT_DELTA / 2, {
                  color: SimpleColors.Red,
                });
              }
            }
            rawOffsetPline.free();
          };

          drawRawOffset(
            pline1,
            m.offset,
            m.showRawOffsetIntersects,
            SimpleColors.Green
          );

          if (m.showDualRawOffset) {
            drawRawOffset(
              pline1,
              -m.offset,
              m.showRawOffsetIntersects,
              SimpleColors.Purple
            );
          }
          break;
        }
        case DemoMode.RawOffsetSegs: {
          scene.drawCavcRawOffsetSegs(pline1, m.offset);
          break;
        }
        default:
          utils.assertExhaustive(m);
      }

      pline1.free();
    }

    function setupCanvasScene() {
      const canvas = utils.valueOrThrow(unref(canvasRef));
      canvas.width = 1000;
      canvas.height = 1000;

      let scene = new CanvasScene(canvas, drawToScene);
      let grabbedIndex = -1;

      scene.dragBeginHandler = (pt: { x: number; y: number }) => {
        for (let i = 0; i < pline1Array.length; i += 3) {
          let vertexPt = { x: pline1Array[i], y: pline1Array[i + 1] };
          if (scene.scaledHitTest(pt, vertexPt, HIT_DELTA)) {
            grabbedIndex = i;
            return true;
          }
        }

        return false;
      };

      scene.draggingHandler = (pt: { x: number; y: number }) => {
        if (grabbedIndex < 0) {
          return;
        }

        pline1Array[grabbedIndex] = pt.x;
        pline1Array[grabbedIndex + 1] = pt.y;
        emit(
          "update:plineJsonStr",
          utils.plineArrayToJsonStr(pline1Array, pline1IsClosed)
        );
        // scene will be redrawn due to jsonStr update
      };

      scene.dragReleaseHandler = () => {
        grabbedIndex = -1;
      };

      canvasScene = scene;
      canvasScene.redrawScene();
    }

    watch(props.model, () => {
      utils.valueOrThrow(canvasScene).redrawScene();
    });

    watch(plineJsonStr, () => {
      let v = unref(plineJsonStr);
      let o = utils.jsonStrToPlineArray(v);
      pline1Array = o.array;
      pline1IsClosed = o.isClosed;
      utils.valueOrThrow(canvasScene).redrawScene();
    });

    onMounted(() => {
      setupCanvasScene();
    });

    const getRustTestCodeString = () => {
      const m = unref(model);
      const handleSelfIntersects =
        m.type === DemoMode.Offset ? m.handleSelfIntersects : true;
      let pline1 = new wasm.Polyline(pline1Array, pline1IsClosed);
      let offsetResults = pline1.parallelOffset(m.offset, handleSelfIntersects);
      let inputPlineStr = utils.createPlineRustCodeStr(pline1);
      let testPropertiesStr = utils.createPlinePropertiesSetRustCodeStr(
        offsetResults
      );

      let result = `(${inputPlineStr}, ${utils.toRustf64Str(m.offset)}) =>
                    ${testPropertiesStr}`;

      offsetResults.forEach((r) => r.free());
      pline1.free();

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
