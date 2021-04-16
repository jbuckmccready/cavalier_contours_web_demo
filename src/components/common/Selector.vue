<template>
  <div class="block">
    <span class="text-gray-700">{{ title }}</span>
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="block w-full mt-1 rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
    >
      <option v-for="opt in options" :key="opt">
        {{ opt }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Selector",
  components: {},
  props: {
    title: {
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
  },
});
</script>
