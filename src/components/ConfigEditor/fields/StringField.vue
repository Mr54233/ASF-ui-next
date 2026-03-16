<template>
  <ConfigField :schema="schema" :model-value="modelValue" @update:model-value="updateValue">
    <template #default="{ value, update }">
      <el-input
        :model-value="value"
        :placeholder="placeholder"
        clearable
        @update:model-value="update"
        @blur="handleBlur"
      />
    </template>
  </ConfigField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfigField, { type FieldSchema, type FieldProps } from './ConfigField.vue'

const props = defineProps<FieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const placeholder = computed(() => props.schema.placeholder ?? props.schema.defaultValue ?? '')

function updateValue(value: any) {
  emit('update:modelValue', value)
}

function handleBlur() {
  // 如果值为空，使用默认值
  if (props.modelValue === '' && props.schema.defaultValue !== undefined) {
    emit('update:modelValue', props.schema.defaultValue)
  }
}
</script>
