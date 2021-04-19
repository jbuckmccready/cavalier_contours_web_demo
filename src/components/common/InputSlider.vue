<template>
  <div class="block">
    <span class="text-gray-700">{{ title }}</span>
    <input
      :value="modelValue"
      @change="inputChangeHandler($event)"
      type="number"
      step="any"
      class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
    />
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', parseFloat($event.target.value))"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from "vue";

export default defineComponent({
  name: "InputSlider",
  components: {},
  props: {
    title: {
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
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const { min, max } = toRefs(props);
    const inputChangeHandler = (e: Event) => {
      if (!(e.target instanceof HTMLInputElement)) {
        throw new Error("Expected input element");
      }

      e.target.valueAsNumber = Math.min(
        Math.max(e.target.valueAsNumber, min.value),
        max.value
      );
      emit("update:modelValue", e.target.valueAsNumber);
    };

    return {
      inputChangeHandler,
    };
  },
});
</script>
