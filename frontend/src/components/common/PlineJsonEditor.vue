<script setup lang="ts">
const emit = defineEmits<{
  (event: "submittedValue", jsonString: string): void;
}>();

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

let textInput: string | undefined = undefined;
const onKeyPress = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (textInput !== undefined) {
      emit("submittedValue", textInput);
    }
  }
};
const onFocusLost = () => {
  if (textInput !== undefined) {
    emit("submittedValue", textInput);
  }
};

const onChange = (v: string | number | null) => {
  textInput = v as string;
};
</script>

<template>
  <q-input
    ref="inputRef"
    :model-value="modelValue"
    filled
    type="textarea"
    v-bind="$attrs"
    @update:model-value="onChange"
    @keypress="onKeyPress"
    @focusout="onFocusLost"
  ></q-input>
</template>

<style></style>
