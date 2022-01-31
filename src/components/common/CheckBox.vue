<script setup lang="ts">
defineEmits<{
  (event: "update:modelValue", checked: boolean): void;
}>();

defineProps({
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="block">
    <div>
      <label class="inline-block">
        <input
          type="checkbox"
          class="align-middle rounded bg-gray-200 border-transparent focus:border-transparent focus:bg-gray-200 text-gray-700 focus:ring-1 focus:ring-offset-2 focus:ring-gray-500"
          :checked="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        />
        <span class="align-middle ml-2">{{ label }}</span>
      </label>
    </div>
  </div>
</template>

<style></style>
