<script setup lang="ts">
import { valueOrThrow } from "@/core/utils";
import { ref, unref } from "vue";

defineEmits<{
  (event: "update:modelValue", jsonString: string): void;
}>();

defineProps({
  label: {
    type: String,
    default: "Polyline",
  },
  modelValue: {
    type: String,
    default: "",
  },
});

const textAreaRef = ref<HTMLTextAreaElement>();
const onKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    valueOrThrow(unref(textAreaRef)).dispatchEvent(new Event("change"));
  }
};
</script>

<template>
  <div class="block">
    <span class="text-gray-700">{{ label }}</span>
    <textarea
      ref="textAreaRef"
      class="block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
      rows="6"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @keypress="onKeyPress"
    />
  </div>
</template>

<style></style>
