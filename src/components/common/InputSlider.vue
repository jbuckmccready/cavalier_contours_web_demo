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
    const { modelValue, min, max } = toRefs(props);
    const inputChangeHandler = (e: any) => {
      const v = e.target.value;
      e.target.value = Math.min(Math.max(v, min.value), max.value);
      emit("update:modelValue", parseFloat(e.target.value));
    };

    return {
      inputChangeHandler,
    };
  },
});
</script>
