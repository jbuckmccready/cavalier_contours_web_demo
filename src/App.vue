<template>
    <!-- This example requires Tailwind CSS v2.0+ -->
    <div class="h-screen w-screen flex flex-col">
        <nav class="bg-primary-800 h-full w-full flex-1">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <div class="hidden md:block">
                            <div class="ml-10 flex items-baseline space-x-4">
                                <!-- Current: "bg-primary-900 text-white", Default: "text-gray-300 hover:bg-primary-700 hover:text-white" -->
                                <router-link
                                    to="/about"
                                    class="nav-button"
                                >
                                    About
                                </router-link>

                                <router-link
                                    to="/staticaabb2dindex"
                                    class="nav-button"
                                >
                                    Static AABB 2D Index
                                </router-link>
                                <router-link
                                    to="/plineboolean"
                                    class="nav-button"
                                >
                                    Polyline Boolean
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <div class="-mr-2 flex">
                        <button class="bg-primary-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white">
                            <svg
                                class="block h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        <router-view
            v-slot="{ Component }"
            class="h-full w-full min-h-0"
        >
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>

<script>
    export default {
        components: {
        },
        setup() {
            return {
            };
        },
    };
</script>

<style>
.nav-button {
  @apply text-gray-300 px-3 py-2 rounded-md text-sm font-medium;
}
.nav-button.active {
  @apply bg-primary-900 text-white;
}
.nav-button:hover {
  @apply bg-primary-700 text-white;
}
</style>
