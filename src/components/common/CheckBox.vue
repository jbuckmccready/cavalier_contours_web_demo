<template>
  <div class="block">
    <div>
      <label class="inline-flex items-center">
        <input
          :checked="modelValue"
          @input="$emit('update:modelValue', $event.target.checked)"
          type="checkbox"
          class="rounded bg-gray-200 border-transparent focus:border-transparent focus:bg-gray-200 text-gray-700 focus:ring-1 focus:ring-offset-2 focus:ring-gray-500"
        />
        <span class="ml-2">{{ label }}</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CheckBox",
  components: {},
  props: {
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
