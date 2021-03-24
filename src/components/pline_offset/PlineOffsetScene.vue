<template>
    <div class="box-border w-full h-full overflow-hidden bg-gray-600">
        <canvas
            ref="canvasRef"
            class="bg-white block m-auto"
        />
    </div>
</template>

<script>
    import { ref, toRefs, unref, onMounted, inject, watchEffect, watch } from "vue";

    import { CanvasScene, HIT_DELTA } from "@/core/rendering.js";
    import * as shapes from "@/core/shapes.js";
    import * as shared from "@/components/pline_offset/pline_offset";
    import * as utils from "@/core/utils.js";

    export default {
        props: {},
        setup(props) {
            // const { currentBooleanOp, fillPolylines } = toRefs(props);
            const canvasRef = ref(null);
            const wasm = inject("wasm");
            let canvasScene = null;

            let pline1_arr = shapes.createExample1PlineVertexes(10);
            // pline1_arr[3] = 3;
            // pline1_arr[4] = 10;

            function drawToScene(scene) {
                let pline1 = new wasm.Polyline(pline1_arr, true);
                // draw vertexes
                let vertexes = pline1.vertexData();
                for (let i = 0; i < vertexes.length; i += 3) {
                    scene.drawScaledRectAtPoint(vertexes[i], vertexes[i + 1], HIT_DELTA, {
                        fill: true,
                        color: "black"
                    });
                }

                // draw polyline
                scene.drawCavcPolyline(pline1, { color: "black" });

                // draw offsets
                let isCCWPline = pline1.area() > 0;
                let offsetValue = 3;
                let offsetResults = pline1.parallelOffset(offsetValue);
                let nextResults = [];
                let offsetCount = 0;
                const maxOffsetCount = 1000;
                while (offsetResults.length !== 0 && offsetCount < maxOffsetCount) {
                    for (let i = 0; i < offsetResults.length; ++i) {
                        let offsetIsCCW = offsetResults[i].area() > 0;
                        if (isCCWPline !== offsetIsCCW) {
                            scene.drawCavcPolyline(offsetResults[i], { color: "red" });
                            continue;
                        }
                        scene.drawCavcPolyline(offsetResults[i], { color: "blue" });
                        offsetCount += 1;
                        offsetResults[i]
                            .parallelOffset(offsetValue)
                            .forEach(o => nextResults.push(o));
                    }
                    offsetResults.forEach(p => p.free());
                    offsetResults = nextResults;
                    nextResults = [];
                }

                offsetResults.forEach(p => p.free());

                pline1.free();
            }

            function setupCanvasScene() {
                const canvas = canvasRef.value;
                canvas.width = 1000;
                canvas.height = 1000;

                canvasScene = new CanvasScene(canvas, drawToScene);
                canvasScene.connectEvents();

                let grabbedIndex = -1;
                canvasScene.dragBeginHandler = pt => {
                    for (let i = 0; i < pline1_arr.length; i += 3) {
                        let vertexPt = { x: pline1_arr[i], y: pline1_arr[i + 1] };
                        if (canvasScene.scaledHitTest(pt, vertexPt, HIT_DELTA)) {
                            grabbedIndex = i;
                            return true;
                        }
                    }

                    return false;
                };

                canvasScene.draggingHandler = pt => {
                    if (grabbedIndex < 0) {
                        return;
                    }

                    pline1_arr[grabbedIndex] = pt.x;
                    pline1_arr[grabbedIndex + 1] = pt.y;
                    canvasScene.redrawScene();
                };

                canvasScene.dragReleaseHandler = () => {
                    grabbedIndex = -1;
                };
                // canvasScene.cursorPosCallBack = pos => {
                //     console.log(pos.x, pos.y);
                // };

                canvasScene.redrawScene();
            }

            // watchEffect(() =>
            //     console.log("currentBooleanOp:", unref(currentBooleanOp))
            // );
            // watchEffect(() => console.log("fillPolylines:", unref(fillPolylines)));

            // watch([currentBooleanOp, fillPolylines], () => canvasScene.redrawScene());

            onMounted(() => {
                setupCanvasScene();
            });

            return {
                canvasRef
            };
        }
    };
</script>

<style scoped></style>
