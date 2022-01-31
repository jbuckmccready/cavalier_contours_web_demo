<script setup lang="ts">
defineEmits<{
  (event: "update:modelValue", selected: string): void;
}>();

defineProps({
  label: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="block">
    <span class="text-gray-700">{{ label }}</span>
    <select
      class="block w-full mt-1 rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="(opt as string)">
        {{ opt }}
      </option>
    </select>
  </div>
</template>

<style></style>
