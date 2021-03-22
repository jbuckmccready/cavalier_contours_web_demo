
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
    import { createCirclePts, createSegAABB } from "@/core/shapes.js";
    import * as shared from "@/components/static_aabb2d_index/static_aabb2d_index.js";

    export default {
        props: {
            currentDemoMode: {
                type: String,
                default: shared.DEMO_MODE_NONE,
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
        },
        setup(props) {
            const {
                currentDemoMode,
                vertexCount,
                indexNodeSize,
                editShape,
            } = toRefs(props);
            const canvasRef = ref(null);
            const wasm = inject("wasm");
            let canvasScene = null;

            let queryBox = [300, 40, 500, 500];

            const queryMinX = () => Math.min(queryBox[0], queryBox[2]);
            const queryMinY = () => Math.min(queryBox[1], queryBox[3]);
            const queryMaxX = () => Math.max(queryBox[0], queryBox[2]);
            const queryMaxY = () => Math.max(queryBox[1], queryBox[3]);

            let neighborsCircleCenter = [0, 0];

            let vertexDim = 10;
            let hitDelta = vertexDim / 2;
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

            function drawToScene(scene) {
                let index = new wasm.StaticAABB2DIndex(boxes, unref(indexNodeSize));
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

                if (unref(currentDemoMode) === shared.DEMO_MODE_INDEX_BOXES) {
                    const allBoxes = index.allBoxes();
                    const levelBounds = index.levelBounds();
                    let currentBoundIndex = 0;
                    let currentBound = levelBounds[0];

                    for (let i = 0; i < allBoxes.length; i += 4) {
                        if (i === currentBound) {
                            currentBoundIndex += 1;
                            currentBound = levelBounds[currentBoundIndex];
                        }
                        scene.drawRect(
                            allBoxes[i],
                            allBoxes[i + 1],
                            allBoxes[i + 2],
                            allBoxes[i + 3],
                            { color: colors[currentBoundIndex] }
                        );
                    }
                } else if (unref(currentDemoMode) === shared.DEMO_MODE_QUERY_BOX) {
                    scene.drawRect(
                        queryMinX(),
                        queryMinY(),
                        queryMaxX(),
                        queryMaxY(),
                        { color: "blue" }
                    );

                    scene.drawScaledRectAtPoint(
                        queryBox[0],
                        queryBox[1],
                        hitDelta,
                        { fill: true, color: "blue" }
                    );
                    scene.drawScaledRectAtPoint(
                        queryBox[0],
                        queryBox[3],
                        hitDelta,
                        { fill: true, color: "blue" }
                    );
                    scene.drawScaledRectAtPoint(
                        queryBox[2],
                        queryBox[3],
                        hitDelta,
                        { fill: true, color: "blue" }
                    );
                    scene.drawScaledRectAtPoint(
                        queryBox[2],
                        queryBox[1],
                        hitDelta,
                        { fill: true, color: "blue" }
                    );
                    let queryResults = index.query(
                        queryMinX(),
                        queryMinY(),
                        queryMaxX(),
                        queryMaxY()
                    );
                    for (let i = 0; i < boxes.length; i += 4) {
                        let color = "gray";
                        if (queryResults.includes(i / 4)) {
                            color = "red";
                        }
                        scene.drawRect(
                            boxes[i],
                            boxes[i + 1],
                            boxes[i + 2],
                            boxes[i + 3],
                            { color: color }
                        );
                    }
                } else if (unref(currentDemoMode) === shared.DEMO_MODE_NEIGHBORS) {
                    scene.drawScaledRectAtPoint(
                        neighborsCircleCenter[0],
                        neighborsCircleCenter[1],
                        hitDelta,
                        { fill: true, color: "blue" }
                    );

                    let maxDistance = 200;
                    let neighborResults = index.neighbors(
                        neighborsCircleCenter[0],
                        neighborsCircleCenter[1],
                        1000,
                        maxDistance
                    );

                    let distCirclePts = createCirclePts(neighborsCircleCenter[0], neighborsCircleCenter[1], maxDistance, 100);
                    scene.drawPolylineArray(distCirclePts);

                    for (let i = 0; i < boxes.length; i += 4) {
                        let color = "gray";
                        let resultIdx = neighborResults.findIndex(x => x === i / 4);
                        if (resultIdx !== -1) {
                            color = "red";
                            let centerX = (boxes[i + 2] - boxes[i]) / 2 + boxes[i];
                            let centerY = (boxes[i + 3] - boxes[i + 1]) / 2 + boxes[i + 1];
                            scene.drawText(resultIdx, centerX, centerY);
                        }
                        scene.drawRect(
                            boxes[i],
                            boxes[i + 1],
                            boxes[i + 2],
                            boxes[i + 3],
                            { color: color }
                        );
                    }
                }
                index.free();
                scene.drawPolylineArray(circlePoints);
                if (unref(editShape)) {
                    for (let i = 0; i < circlePoints.length - 1; i += 2) {
                        scene.drawScaledRectAtPoint(
                            circlePoints[i],
                            circlePoints[i + 1],
                            hitDelta,
                            { fill: true, color: "black" }
                        );
                    }
                }
            }

            function setupCanvasScene() {
                const canvas = canvasRef.value;
                canvas.width = 1000;
                canvas.height = 1000;

                canvasScene = new CanvasScene(canvas, drawToScene);
                canvasScene.connectEvents();

                let isQueryBoxGrabbed = false;
                let grabbedXIdx = -1;
                let grabbedYIdx = -1;

                let isNeighborsCircleGrabbed = false;

                canvasScene.dragBeginHandler = (pt) => {
                    const grabCorner = (xIdx, yIdx) => {
                        let cornerPt = { x: queryBox[xIdx], y: queryBox[yIdx] };

                        if (canvasScene.scaledHitTest(pt, cornerPt, hitDelta)) {
                            grabbedXIdx = xIdx;
                            grabbedYIdx = yIdx;
                            return true;
                        }

                        return false;
                    };

                    if (unref(currentDemoMode) === shared.DEMO_MODE_QUERY_BOX) {
                        if (
                            grabCorner(0, 1) ||
                            grabCorner(0, 3) ||
                            grabCorner(2, 1) ||
                            grabCorner(2, 3)
                        ) {
                            isQueryBoxGrabbed = true;
                            return true;
                        }
                    } else if (
                        unref(currentDemoMode) === shared.DEMO_MODE_NEIGHBORS
                    ) {
                        if (canvasScene.scaledHitTest(pt, { x: neighborsCircleCenter[0], y: neighborsCircleCenter[1] }, hitDelta)) {
                            isNeighborsCircleGrabbed = true;
                            grabbedXIdx = 0;
                            grabbedYIdx = 1;
                            return true;
                        }
                    }

                    if (unref(editShape)) {
                        for (let i = 0; i < circlePoints.length - 1; i += 2) {
                            if (
                                canvasScene.scaledHitTest(
                                    pt,
                                    { x: circlePoints[i], y: circlePoints[i + 1] },
                                    hitDelta
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

                canvasScene.draggingHandler = (pt) => {
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
                    canvasScene.redrawScene();
                };

                canvasScene.dragReleaseHandler = () => {
                    grabbedXIdx = -1;
                    grabbedYIdx = -1;
                    isQueryBoxGrabbed = false;
                    isNeighborsCircleGrabbed = false;
                };

                canvasScene.redrawScene();
            }

            watchEffect(() =>
                console.log("currentDemoMode:", unref(currentDemoMode))
            );
            watchEffect(() => console.log("vertexCount:", unref(vertexCount)));
            watchEffect(() => console.log("indexNodeSize:", unref(indexNodeSize)));
            watchEffect(() => console.log("editShape:", unref(editShape)));

            watch([vertexCount], () => {
                shapeChanged();
                canvasScene.redrawScene();
            });
            watch([currentDemoMode, indexNodeSize, editShape], () =>
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
