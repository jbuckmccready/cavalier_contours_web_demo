<script setup lang="ts">
defineEmits<{
  (event: "click"): void;
}>();
</script>

<template>
  <div class="block mt-2">
    <button class="basic-button" @click="$emit('click')">
      <slot></slot>
    </button>
  </div>
</template>

<style scoped>
.basic-button {
  @apply bg-gray-200 p-2;
}
.basic-button:hover {
  @apply bg-gray-600;
}
</style>
