<script setup lang="ts">
defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
});

defineEmits({
  click: null,
});
</script>

<template>
  <button type="button" :class="['nav-button', { active: isActive }]" @click="$emit('click')">
    <slot />
  </button>
</template>

<style scoped>
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
