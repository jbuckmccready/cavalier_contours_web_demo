<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <q-checkbox :model-value="modelValue" v-bind="$attrs"></q-checkbox>
</template>

<style></style>
