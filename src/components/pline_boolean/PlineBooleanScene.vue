

<template>
    <div class="box-border w-full h-full overflow-hidden bg-gray-600">
        <canvas
            ref="canvasRef"
            class="bg-white block m-auto"
        />
    </div>
</template>

<script>
    import {
        ref,
        toRefs,
        unref,
        onMounted,
        inject,
        watchEffect,
        watch,
    } from "vue";

    import CanvasScene from "@/core/rendering.js";
    import * as shared from "@/components/pline_boolean/pline_boolean_index.js";

    export default {
        props: {
            currentBooleanOp: {
                type: String,
                default: shared.BOOLEAN_NONE,
            },
            fillPolylines: {
                type: Boolean,
                default: false,
            },
        },
        setup(props) {
            const {
                currentBooleanOp,
                fillPolylines,
            } = toRefs(props);
            const canvasRef = ref(null);
            const wasm = inject("wasm");
            let canvasScene = null;

            let pline1_arr = new Float64Array([
                0, 1, 1,
                10, 1, 1
            ]);
            let pline1 = new wasm.Polyline(
                pline1_arr,
                true
            );


            let pline2_arr = new Float64Array([
                3, -10, 0,
                6, -10, 0,
                6, 10, 0,
                3, 10, 0
            ]);

            // let pline2_arr = new Float64Array([
            //     1, 0, 0,
            //     5, -3, 0,
            //     9, 0, 0,
            //     5, 4, 0
            // ]);

            let pline2 = new wasm.Polyline(
                pline2_arr,
                true
            );

            pline1.scale(10);
            pline2.scale(10);

            function drawToScene(scene) {
                let colors = [
                    "#DC2626",
                    "#2563EB",
                    "#059669",
                    "#D97706",
                    "#7C3AED",
                    "#DB2777",
                    "#EA580C",
                    "#65A30D",
                    "#C026D3",
                ];

                let op = unref(currentBooleanOp);
                let fill = unref(fillPolylines);
                if (op === shared.BOOLEAN_NONE) {
                    scene.drawCavcPolyline(
                        pline1, { color: "red", fill: fill }
                    );
                    scene.drawCavcPolyline(
                        pline2, { color: "blue", fill: fill }
                    );
                } else {
                    let opInt;
                    switch (op) {
                    case shared.BOOLEAN_OR:
                        opInt = 0;
                        break;
                    case shared.BOOLEAN_AND:
                        opInt = 1;
                        break;
                    case shared.BOOLEAN_NOT:
                        opInt = 2;
                        break;
                    case shared.BOOLEAN_XOR:
                        opInt = 3;
                        break;
                    }

                    let result = pline1.boolean(pline2, opInt);
                    let processPosPline = (pline, i) => {
                        scene.drawCavcPolyline(pline, { fill: fill, color: colors[i] });
                        pline.free();
                    };

                    let processNegPline = (pline) => {
                        let color = fill ? "white" : "black";
                        scene.drawCavcPolyline(pline, { fill: fill, color: color });
                        pline.free();
                    };

                    result.posPlines.forEach(processPosPline);
                    result.negPlines.forEach(processNegPline);

                }
            }

            function setupCanvasScene() {
                const canvas = canvasRef.value;
                canvas.width = 1000;
                canvas.height = 1000;

                canvasScene = new CanvasScene(canvas, drawToScene);
                canvasScene.connectEvents();

                canvasScene.redrawScene();
            }

            watchEffect(() =>
                console.log("currentBooleanOp:", unref(currentBooleanOp))
            );
            watchEffect(() =>
                console.log("fillPolylines:", unref(fillPolylines))
            );

            watch([currentBooleanOp, fillPolylines], () =>
                canvasScene.redrawScene()
            );

            onMounted(() => {
                setupCanvasScene();
            });

            return {
                canvasRef,
            };
        },
    };
</script>

<style scoped>
</style>
