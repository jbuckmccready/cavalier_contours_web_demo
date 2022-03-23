<script setup lang="ts">
import { computed } from "vue";

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

const modelValueProxy = computed({
  get() {
    return props.modelValue;
  },
  set(v: number) {
    emit("update:modelValue", v);
  },
});
</script>

<template>
  <div>
    <q-input v-model.number="modelValueProxy" :label="label" type="number" outlined />
    <q-slider v-model="modelValueProxy" label :min="min" :max="max" :step="step"></q-slider>
  </div>
</template>
