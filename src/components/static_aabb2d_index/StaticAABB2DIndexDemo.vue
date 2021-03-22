<template>
    <div class="w-full h-full flex flex-row">
        <div class="flex-1 h-full min-w-0 box-border border-primary-500 border-r-2">
            <StaticAABB2DIndexScene
                :current-demo-mode="currentDemoMode"
                :vertex-count="vertexCount"
                :index-node-size="indexNodeSize"
                :edit-shape="editShape"
            />
        </div>
        <div class="w-auto overflow-auto">
            <div class="py-4 px-4">
                <div class="mt-8 max-w-md">
                    <div class="grid grid-cols-1 gap-6">
                        <label class="block">
                            <span class="text-gray-700">Demo Mode</span>
                            <select
                                v-model="currentDemoMode"
                                class="block w-full mt-1 rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                                <option
                                    v-for="mode in allDemoModes"
                                    :key="mode"
                                >{{ mode }}</option>
                            </select>
                        </label>
                        <label class="block">
                            <!-- <span class="text-gray-700">Vertex Count: {{ vertexCount }}</span> -->
                            <span class="text-gray-700">Vertex Count: </span>
                            <input
                                v-model.number.lazy="vertexCount"
                                type="number"
                                step="1"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                            <input
                                v-model.number="vertexCount"
                                type="range"
                                :min="vertexCountMin"
                                :max="vertexCountMax"
                                step="1"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                        </label>
                        <label class="block">
                            <span class="text-gray-700">Index Node Size: </span>
                            <input
                                v-model.number.lazy="indexNodeSize"
                                type="number"
                                step="1"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                            <input
                                v-model.number="indexNodeSize"
                                type="range"
                                :min="indexNodeSizeMin"
                                :max="indexNodeSizeMax"
                                step="1"
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            >
                        </label>
                        <label class="block">
                            <span class="text-gray-700">Additional details</span>
                            <textarea
                                class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                                rows="3"
                            />
                        </label>
                        <div class="block">
                            <div class="mt-2">
                                <div>
                                    <label class="inline-flex items-center">
                                        <input
                                            v-model="editShape"
                                            type="checkbox"
                                            class="rounded bg-gray-200 border-transparent focus:border-transparent focus:bg-gray-200 text-gray-700 focus:ring-1 focus:ring-offset-2 focus:ring-gray-500"
                                        >
                                        <span class="ml-2">Show Polyline Vertexes</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { ref, watch } from 'vue';
    import StaticAABB2DIndexScene from '@/components/static_aabb2d_index/StaticAABB2DIndexScene.vue';
    import * as shared from '@/components/static_aabb2d_index/static_aabb2d_index.js';

    export default {
        components: {
            StaticAABB2DIndexScene,
        },
        props: {
        },
        setup() {
            let currentDemoMode = ref(shared.DEMO_MODE_NONE);
            const allDemoModes = shared.ALL_DEMO_MODES;

            let vertexCount = ref(100);
            const vertexCountMin = 10;
            const vertexCountMax = 1000;
            watch(vertexCount, (newValue) => {
                vertexCount.value = Math.min(Math.max(newValue, vertexCountMin), vertexCountMax);
            });

            let indexNodeSize = ref(16);
            const indexNodeSizeMin = 4;
            const indexNodeSizeMax = 32;
            watch(indexNodeSize, (newValue) => {
                indexNodeSize.value = Math.min(Math.max(newValue, indexNodeSizeMin), indexNodeSizeMax);
            });

            let editShape = ref(false);
            return {
                currentDemoMode,
                allDemoModes,
                vertexCount,
                vertexCountMin,
                vertexCountMax,
                indexNodeSize,
                indexNodeSizeMin,
                indexNodeSizeMax,
                editShape,
            };
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
