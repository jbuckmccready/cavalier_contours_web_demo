<script setup lang="ts">
defineEmits<{
  (event: "click"): void;
}>();
</script>

<template>
  <div class="block">
    <button
      class="p-2 rounded-md bg-gray-200 hover:bg-gray-300 active:bg-gray-400 border border-transparent active:border-gray-600 focus:border-gray-600"
      @click="$emit('click')"
    >
      <slot></slot>
    </button>
  </div>
</template>

<style scoped></style>
