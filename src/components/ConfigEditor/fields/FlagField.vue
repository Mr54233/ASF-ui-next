<template>
  <ConfigField :schema="schema" :model-value="modelValue" @update:model-value="emitValue">
    <template #default="{ value }">
      <div class="flag-field">
        <el-select
          :model-value="null"
          placeholder="选择要添加的标志"
          @update:model-value="addFlag"
          style="width: 100%; margin-bottom: 8px"
        >
          <el-option
            v-for="(label, flagValue) in flagOptions"
            v-show="!hasFlag(flagValue)"
            :key="flagValue"
            :label="label"
            :value="flagValue"
          />
        </el-select>

        <div class="flag-values">
          <el-tag
            v-for="flagValue in activeFlags"
            :key="flagValue"
            closable
            @close="removeFlag(flagValue)"
          >
            {{ getFlagLabel(flagValue) }}
          </el-tag>
          <span v-if="activeFlags.length === 0" class="empty-hint">未选择任何标志</span>
        </div>

        <el-button v-if="value !== 0" size="small" @click="clearAll">清空所有</el-button>
      </div>
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

function emitValue(value: any) {
  emit('update:modelValue', value)
}

// 标志选项：值 -> 标签
const flagOptions = computed(() => {
  const schema = props.schema as FieldSchema
  if (!schema.enumValues) return {}

  const options: Record<number, string> = {}
  Object.entries(schema.enumValues).forEach(([label, value]) => {
    options[value] = label
  })
  return options
})

// 当前激活的标志值列表
const activeFlags = computed(() => {
  const value = props.modelValue ?? 0
  const flags: number[] = []

  // 遍历所有位（0-31）
  for (let i = 0; i < 32; i++) {
    const flagValue = 1 << i
    // eslint-disable-next-line no-bitwise
    if ((value & flagValue) === flagValue) {
      flags.push(flagValue)
    }
  }

  return flags
})

function hasFlag(flagValue: number): boolean {
  const value = props.modelValue ?? 0
  // eslint-disable-next-line no-bitwise
  return (value & flagValue) === flagValue
}

function getFlagLabel(flagValue: number): string {
  return flagOptions.value[flagValue] ?? `Unknown(${flagValue})`
}

function addFlag(flagValue: number) {
  const currentValue = props.modelValue ?? 0
  // eslint-disable-next-line no-bitwise
  const newValue = currentValue | flagValue
  emit('update:modelValue', newValue)
}

function removeFlag(flagValue: number) {
  const currentValue = props.modelValue ?? 0
  // eslint-disable-next-line no-bitwise
  const newValue = currentValue & ~flagValue
  emit('update:modelValue', newValue)
}

function clearAll() {
  emit('update:modelValue', 0)
}
</script>

<style scoped lang="less">
.flag-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flag-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 28px;
}

.empty-hint {
  color: #909399;
  font-size: 13px;
  padding: 4px 0;
}
</style>
