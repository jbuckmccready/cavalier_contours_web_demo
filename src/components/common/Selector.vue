<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <q-select :model-value="modelValue" v-bind="$attrs" outlined />
</template>

<style></style>
