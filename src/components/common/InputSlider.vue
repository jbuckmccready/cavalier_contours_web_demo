<script setup lang="ts">
import { computed } from "vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: number): void;
}>();

interface Props {
  label?: string;
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
}
const props = withDefaults(defineProps<Props>(), {
  label: "",
  min: 0,
  max: 10,
  step: 1,
});

const modelValueProxy = computed({
  get() {
    return props.modelValue;
  },
  set(v: number) {
    const val = Math.max(Math.min(v, props.max), props.min);
    emit("update:modelValue", val);
  },
});
</script>

<template>
  <div>
    <q-input v-model.number="modelValueProxy" :label="label" type="number" outlined />
    <q-slider v-model="modelValueProxy" :min="min" :max="max" :step="step" label />
  </div>
</template>
