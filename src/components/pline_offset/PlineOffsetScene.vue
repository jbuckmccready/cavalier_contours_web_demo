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
        props: {
            offset: {
                type: Number,
                default: 1
            },
            maxOffsets: {
                type: Number,
                default: 1
            },
            plineJsonStr: {
                type: String,
                default: ""
            }
        },
        emits: ["update:plineJsonStr"],
        setup(props, { emit }) {
            const { offset, maxOffsets, plineJsonStr } = toRefs(props);
            const canvasRef = ref(null);
            const wasm = inject("wasm");
            let canvasScene = null;

            let pline1Array = shapes.createExample1PlineVertexes(10);
            let pline1IsClosed = true;

            function drawToScene(scene) {
                let pline1 = new wasm.Polyline(pline1Array, pline1IsClosed);
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
                let maxOffsetsValue = unref(maxOffsets);
                if (maxOffsetsValue > 0) {
                    let isCCWPline = pline1.area() > 0;
                    let offsetValue = unref(offset);
                    let offsetResults = pline1.parallelOffset(offsetValue);
                    let nextResults = [];
                    let offsetCount = 0;
                    const maxOffsetCount = maxOffsetsValue;
                    while (offsetResults.length !== 0 && offsetCount < maxOffsetCount) {
                        // console.log("offsetResult:", offsetCount);
                        for (let i = 0; i < offsetResults.length; ++i) {
                            // offsetResults[i].logToConsole();
                            if (pline1IsClosed) {
                                let offsetIsCCW = offsetResults[i].area() > 0;
                                if (isCCWPline !== offsetIsCCW) {
                                    scene.drawCavcPolyline(offsetResults[i], { color: "red" });
                                    continue;
                                }
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
                }
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
                    for (let i = 0; i < pline1Array.length; i += 3) {
                        let vertexPt = { x: pline1Array[i], y: pline1Array[i + 1] };
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

                    pline1Array[grabbedIndex] = pt.x;
                    pline1Array[grabbedIndex + 1] = pt.y;
                    emit(
                        "update:plineJsonStr",
                        utils.plineArrayToJsonStr(pline1Array, pline1IsClosed)
                    );
                    // scene will be redrawn due to jsonStr update
                };

                canvasScene.dragReleaseHandler = () => {
                    grabbedIndex = -1;
                };
                // canvasScene.cursorPosCallBack = pos => {
                //     console.log(pos.x, pos.y);
                // };

                canvasScene.redrawScene();
            }

            watch([offset, maxOffsets], () => {
                canvasScene.redrawScene();
            });

            watch(plineJsonStr, () => {
                let v = unref(plineJsonStr);
                let o = utils.jsonStrToPlineArray(v);
                if (o === null) {
                    return;
                }
                pline1Array = o.array;
                pline1IsClosed = o.isClosed;
                canvasScene.redrawScene();
            });

            onMounted(() => {
                setupCanvasScene();
            });

            const getRustTestCodeString = () => {
                let offsetValue = unref(offset);
                let pline1 = new wasm.Polyline(pline1Array, pline1IsClosed);
                let offsetResults = pline1.parallelOffset(offsetValue);
                let inputPlineStr = utils.createPlineRustCodeStr(pline1);
                let testPropertiesStr = utils.createPlinePropertiesSetRustCodeStr(
                    offsetResults
                );

                let result = `(${inputPlineStr}, ${utils.toRustf64Str(offsetValue)}) =>
                    ${testPropertiesStr}`;

                offsetResults.forEach(r => r.free());
                pline1.free();

                return result;
            };

            return {
                canvasRef,
                getRustTestCodeString
            };
        }
    };
</script>

<style scoped></style>
