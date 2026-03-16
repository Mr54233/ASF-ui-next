<template>
  <ConfigField :schema="schema" :model-value="modelValue" @update:model-value="updateValue">
    <template #default="{ value, update }">
      <el-input-number
        :model-value="value"
        :min="0"
        :step="1"
        :precision="0"
        controls-position="right"
        @update:model-value="update"
      />
    </template>
  </ConfigField>
</template>

<script setup lang="ts">
import ConfigField, { type FieldProps } from './ConfigField.vue'

const props = defineProps<FieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

function updateValue(value: any) {
  emit('update:modelValue', value)
}
</script>
