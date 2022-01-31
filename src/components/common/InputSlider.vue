<script setup lang="ts">
import { valueOrThrow } from "@/core/utils";
import { ref, unref } from "vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: number): void;
}>();

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: -10,
  },
  max: {
    type: Number,
    default: 10,
  },
  step: {
    type: Number,
    default: 1.0,
  },
});

const textInputRef = ref<HTMLInputElement>();

const { min, max } = unref(props);

const valueChangeHandler = (e: Event) => {
  if (!(e.target instanceof HTMLInputElement)) {
    throw new Error("Expected input element");
  }

  let value = e.target.valueAsNumber;
  if (isNaN(value)) {
    // set to min value
    value = min;
    // update text input directly to ensure it is updated (e.g., case where value is minimum but
    // the user just input garbage)
    const textInput = valueOrThrow(unref(textInputRef));
    textInput.valueAsNumber = min;
  }
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="block">
    <span class="text-gray-700">{{ label }}</span>
    <input
      ref="textInputRef"
      :value="modelValue"
      type="number"
      step="any"
      class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
      @change="valueChangeHandler($event)"
    />
    <input
      :value="modelValue"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="slider appearance-none mt-0.5 block w-full rounded-md bg-gray-100 border-transparent focus:bg-white focus:border-gray-600 border"
      @input="valueChangeHandler"
    />
  </div>
</template>

<style scoped>
/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
.slider::-webkit-slider-thumb {
  @apply bg-gray-600 w-3 h-4 border-none appearance-none rounded-md mt-0.5 mb-0.5;
}
.slider::-moz-range-thumb {
  @apply bg-gray-600 w-3 h-4 border-none appearance-none rounded-md;
}
</style>
