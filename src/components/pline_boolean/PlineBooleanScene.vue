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

    import { CanvasScene, HIT_DELTA, COLORS } from "@/core/rendering.js";
    import * as shapes from "@/core/shapes.js";
    import * as shared from "@/components/pline_boolean/pline_boolean.js";
    import * as utils from "@/core/utils.js";

    export default {
        props: {
            currentBooleanOp: {
                type: String,
                default: shared.BOOLEAN_NONE
            },
            fillPolylines: {
                type: Boolean,
                default: false
            }
        },
        setup(props) {
            const { currentBooleanOp, fillPolylines } = toRefs(props);
            const canvasRef = ref(null);
            const wasm = inject("wasm");
            let canvasScene = null;

            let pline1_arr = shapes.createExample1PlineVertexes(10);
            pline1_arr[3] = 3;
            pline1_arr[4] = 10;

            // let pline1_arr = new Float64Array([-50, 0, 1, 50, 0, 1]);

            let pline2_arr = shapes.createExample1PlineVertexes(10);
            // pline2_arr[0] = 3;
            // pline2_arr[1] = 10;

            // let pline2_arr = shapes.createRectanglePlineVertexes(-50, 0, 50, 50);

            // helper function to perform boolean operation between two polylines, visit all results
            // and free/clean up memory
            let visitBoolean = (p1, p2, op, posVisitor, negVisitor, free = true) => {
                let opInt = shared.booleanOpAsInt(op);
                let result = p1.boolean(p2, opInt);

                result.posPlines.forEach((pline, i) => {
                    posVisitor(pline, i);
                    if (free) {
                        pline.free();
                    }
                });
                result.negPlines.forEach((pline, i) => {
                    negVisitor(pline, i);
                    if (free) {
                        pline.free();
                    }
                });
            };

            function drawToScene(scene) {
                let pline1 = new wasm.Polyline(pline1_arr, true);
                let pline2 = new wasm.Polyline(pline2_arr, true);
                let pline1Color = "red";
                let pline2Color = "blue";
                // draw vertexes
                let drawVertexes = (vertexes, color) => {
                    for (let i = 0; i < vertexes.length; i += 3) {
                        scene.drawScaledRectAtPoint(vertexes[i], vertexes[i + 1], HIT_DELTA, {
                            fill: true,
                            color: color
                        });
                    }
                };

                drawVertexes(pline1.vertexData(), pline1Color);
                drawVertexes(pline2.vertexData(), pline2Color);

                // draw polylines/boolean result
                let op = unref(currentBooleanOp);
                let fill = unref(fillPolylines);
                if (op === shared.BOOLEAN_NONE) {
                    scene.drawCavcPolyline(pline1, { color: pline1Color, fill: fill });
                    scene.drawCavcPolyline(pline2, { color: pline2Color, fill: fill });
                } else {
                    let processPosPline = (pline, i) => {
                        let color = COLORS[i % COLORS.length];
                        scene.drawCavcPolyline(pline, { fill: fill, color: color });
                    };

                    let processNegPline = pline => {
                        let color = fill ? "white" : "black";
                        scene.drawCavcPolyline(pline, {
                            fill: fill,
                            color: color,
                            noTransparency: true
                        });
                    };

                    visitBoolean(pline1, pline2, op, processPosPline, processNegPline);
                }

                pline1.free();
                pline2.free();
            }

            function setupCanvasScene() {
                const canvas = canvasRef.value;
                canvas.width = 1000;
                canvas.height = 1000;

                canvasScene = new CanvasScene(canvas, drawToScene);
                canvasScene.connectEvents();

                let grabbedIndex = -1;
                let grabbedPlineArr = pline1_arr;

                canvasScene.dragBeginHandler = pt => {
                    let tryGrabPline = plineArr => {
                        for (let i = 0; i < plineArr.length; i += 3) {
                            let vertexPt = { x: plineArr[i], y: plineArr[i + 1] };
                            if (canvasScene.scaledHitTest(pt, vertexPt, HIT_DELTA)) {
                                grabbedPlineArr = plineArr;
                                grabbedIndex = i;
                                return true;
                            }
                        }

                        return false;
                    };

                    if (tryGrabPline(pline1_arr) || tryGrabPline(pline2_arr)) {
                        return true;
                    }

                    return false;
                };

                canvasScene.draggingHandler = pt => {
                    if (grabbedIndex < 0) {
                        return;
                    }

                    grabbedPlineArr[grabbedIndex] = pt.x;
                    grabbedPlineArr[grabbedIndex + 1] = pt.y;
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

            watchEffect(() =>
                console.log("currentBooleanOp:", unref(currentBooleanOp))
            );
            watchEffect(() => console.log("fillPolylines:", unref(fillPolylines)));

            watch([currentBooleanOp, fillPolylines], () => canvasScene.redrawScene());

            onMounted(() => {
                setupCanvasScene();
            });

            const getRustTestCodeString = () => {
                let pline1 = new wasm.Polyline(pline1_arr, true);
                let pline2 = new wasm.Polyline(pline2_arr, true);

                const createPlineArrayString = pline => {
                    let vertexData = pline.vertexData();
                    let result = "[";
                    for (let i = 0; i < vertexData.length; i += 3) {
                        let values = [vertexData[i], vertexData[i + 1], vertexData[i + 2]];
                        result += "(" + values.map(utils.toRustf64Str).join(", ") + "), ";
                    }
                    result = result.slice(0, -2) + "]";
                    return result;
                };

                const createPlinePropertiesString = p => {
                    let f64Props = [p.area, p.pathLength, p.minX, p.minY, p.maxX, p.maxY];
                    return (
                        "PlineProperties::new(" +
                        p.vertexCount.toString() +
                        ", " +
                        f64Props.map(utils.toRustf64Str).join(", ") +
                        ")"
                    );
                };

                const createPlinePropertiesSetString = propertiesSet => {
                    return (
                        "&[" +
                        propertiesSet.map(p => createPlinePropertiesString(p)).join(", ") +
                        "]"
                    );
                };

                let result = "(\n    pline_closed!";
                result += createPlineArrayString(pline1) + ",\n";
                result +=
                    "    pline_closed!" + createPlineArrayString(pline2) + "\n)\n=>\n[\n";

                let resultPosPlineProperties = [];
                let resultNegPlineProperties = [];

                shared.ALL_BOOLEAN_OPS.slice(1).forEach(op => {
                    visitBoolean(
                        pline1,
                        pline2,
                        op,
                        p => resultPosPlineProperties.push(p.testProperties()),
                        p => resultNegPlineProperties.push(p.testProperties())
                    );

                    result +=
                        `    (BooleanOp::${op}, ` +
                        createPlinePropertiesSetString(resultPosPlineProperties) +
                        ", " +
                        createPlinePropertiesSetString(resultNegPlineProperties) +
                        "),\n";

                    resultPosPlineProperties = [];
                    resultNegPlineProperties = [];
                });
                result = result.slice(0, -2);
                result += "\n]";

                pline1.free();
                pline2.free();

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
