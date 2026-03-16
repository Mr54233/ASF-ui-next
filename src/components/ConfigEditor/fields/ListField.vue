<template>
  <ConfigField :schema="schema" :model-value="modelValue" @update:model-value="emitValue">
    <template #default="{ value }">
      <div class="list-field">
        <div class="list-items">
          <div
            v-for="(item, index) in normalizedValue"
            :key="index"
            class="list-item"
          >
            <el-input
              :model-value="String(item)"
              placeholder="列表项"
              @update:model-value="updateItem(index, $event)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="removeItem(index)"
            />
          </div>
        </div>

        <el-button :icon="Plus" @click="addItem">添加项</el-button>
      </div>
    </template>
  </ConfigField>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import ConfigField, { type FieldProps } from './ConfigField.vue'

const props = defineProps<FieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

function emitValue(value: any) {
  emit('update:modelValue', value)
}

// 标准化值（确保是数组）
const normalizedValue = computed(() => {
  const value = props.modelValue
  if (Array.isArray(value)) return value
  if (value) return [value]
  return []
})

function addItem() {
  const current = normalizedValue.value
  const newValue = [...current, '']
  emitValue(newValue)
}

function updateItem(index: number, newValue: string) {
  const current = normalizedValue.value
  const updated = [...current]
  updated[index] = newValue
  emit('update:modelValue', updated)
}

function removeItem(index: number) {
  const current = normalizedValue.value
  const newValue = current.filter((_, i) => i !== index)
  emitValue(newValue)
}
</script>

<style scoped lang="less">
.list-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  gap: 8px;

  .el-input {
    flex: 1;
  }
}
</style>
