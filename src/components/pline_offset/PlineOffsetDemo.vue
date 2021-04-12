<template>
    <div class="w-full h-full flex flex-row">
        <div class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2">
            <PlineOffsetScene
                ref="plineOffsetSceneRef"
                v-model:plineJsonStr="plineJsonStr"
                :offset="offset"
                :max-offsets="offsetCount"
            />
        </div>
        <div class="w-96 overflow-auto">
            <div class="py-4 px-4">
                <div class="mt-8 max-w-md">
                    <div class="grid grid-cols-1 gap-6">
                        <label class="block">
                            <!-- <span class="text-gray-700">Vertex Count: {{ vertexCount }}</span> -->
                            <span class="text-gray-700">Offset:</span>
                            <input
                                v-model.number.lazy="offset"
                                type="number"
                                step="1.0"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                            <input
                                v-model.number="offset"
                                type="range"
                                :min="offsetMin"
                                :max="offsetMax"
                                step="1.0"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                        </label>
                        <label class="block">
                            <!-- <span class="text-gray-700">Vertex Count: {{ vertexCount }}</span> -->
                            <span class="text-gray-700">Offset Count:</span>
                            <input
                                v-model.number.lazy="offsetCount"
                                type="number"
                                step="1"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                            <input
                                v-model.number="offsetCount"
                                type="range"
                                :min="offsetCountMin"
                                :max="offsetCountMax"
                                step="1"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                        </label>
                    </div>
                    <label class="block">
                        <span class="text-gray-700">Polyline:</span>
                        <textarea
                            v-model="plineJsonStr"
                            class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            rows="6"
                        />
                    </label>
                </div>
                <div class="block mt-2">
                    <button
                        class="basic-button"
                        @click="copyRustTestCode"
                    >
                        Copy Test Code
                    </button>
                </div>
                <!-- <div class="block mt-2">
                    <label class="inline-flex items-center">
                        <input
                            v-model="fillPolylines"
                            type="checkbox"
                            class="rounded bg-gray-200 border-transparent focus:border-transparent focus:bg-gray-200 text-gray-700 focus:ring-1 focus:ring-offset-2 focus:ring-gray-500"
                        >
                        <span class="ml-2">Fill Polylines</span>
                    </label>
                </div>
                <div class="block mt-2">
                    <button
                        class="basic-button"
                        @click="copyRustTestCode"
                    >
                        Copy Test Code
                    </button>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script>
    import { ref, watch, watchEffect } from "vue";
    import PlineOffsetScene from "@/components/pline_offset/PlineOffsetScene.vue";
    import * as shapes from "@/core/shapes.js";
    import * as shared from "@/components/pline_boolean/pline_boolean.js";
    import * as utils from "@/core/utils.js";

    export default {
        components: {
            PlineOffsetScene
        },
        props: {},
        setup() {
            let offset = ref(3.0);
            const offsetMin = -40.0;
            const offsetMax = 40.0;
            watch(offset, newValue => {
                offset.value = Math.min(Math.max(newValue, offsetMin), offsetMax);
            });

            let offsetCount = ref(50);
            const offsetCountMin = 0;
            const offsetCountMax = 100;
            watch(offsetCount, newValue => {
                offsetCount.value = Math.min(
                    Math.max(newValue, offsetCountMin),
                    offsetCountMax
                );
            });

            let plineJsonStr = ref(
                utils.plineArrayToJsonStr(shapes.createExample1PlineVertexes(10), true)
            );

            const plineOffsetSceneRef = ref(null);

            const copyRustTestCode = () => {
                const scene = plineOffsetSceneRef.value;
                utils.copyToClipboard(scene.getRustTestCodeString());
            };

            return {
                offset,
                offsetMin,
                offsetMax,
                offsetCount,
                offsetCountMin,
                offsetCountMax,
                plineJsonStr,
                plineOffsetSceneRef,
                copyRustTestCode
            };
        }
    };
</script>
