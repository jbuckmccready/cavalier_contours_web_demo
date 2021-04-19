<template>
  <div class="block">
    <span class="text-gray-700">{{ title }}</span>
    <textarea
      ref="textAreaRef"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      @keypress="onKeyPress"
      class="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
      rows="6"
    />
  </div>
</template>

<script lang="ts">
import { valueOrThrow } from "@/core/utils";
import { defineComponent, ref, unref } from "vue";

export default defineComponent({
  name: "PolylineEditor",
  components: {},
  props: {
    title: {
      type: String,
      default: "Polyline",
    },
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  setup() {
    // setup the text area to raise change event on return (use shift+enter to input new line)
    const textAreaRef = ref<HTMLTextAreaElement | null>(null);
    const onKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        valueOrThrow(unref(textAreaRef)).dispatchEvent(new Event("change"));
      }
    };
    return {
      textAreaRef,
      onKeyPress,
    };
  },
});
</script>
