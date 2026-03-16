<template>
  <ConfigField :schema="schema" :model-value="modelValue" @update:model-value="updateValue">
    <template #default="{ value, update }">
      <el-select :model-value="value" @update:model-value="update" style="width: 100%">
        <el-option
          v-for="(label, enumValue) in enumOptions"
          :key="enumValue"
          :label="label"
          :value="enumValue"
        />
      </el-select>
    </template>
  </ConfigField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfigField, { type FieldProps, type FieldSchema } from './ConfigField.vue'

const props = defineProps<FieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// 枚举选项：值 -> 标签
const enumOptions = computed(() => {
  const schema = props.schema as FieldSchema
  if (!schema.enumValues) return {}

  // 翻转键值对：{ 'None': 0 } → { 0: 'None' }
  const options: Record<number, string> = {}
  Object.entries(schema.enumValues).forEach(([label, value]) => {
    options[value] = label
  })
  return options
})

function updateValue(value: any) {
  emit('update:modelValue', value)
}
</script>
