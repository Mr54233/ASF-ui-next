<template>
  <ConfigField :schema="schema" :model-value="modelValue" @update:model-value="emitValue">
    <template #default="{ value }">
      <div class="hashset-field">
        <el-select
          v-if="isEnumHashSet"
          :model-value="null"
          placeholder="选择要添加的值"
          @update:model-value="addItem"
          style="width: 100%; margin-bottom: 8px"
        >
          <el-option
            v-for="(label, enumValue) in enumOptions"
            v-show="!hasItem(enumValue)"
            :key="enumValue"
            :label="label"
            :value="enumValue"
          />
        </el-select>
        <el-input
          v-else
          :model-value="inputValue"
          placeholder="输入值后按回车添加"
          @update:model-value="inputValue = $event"
          @keyup.enter="addInputItem"
        />

        <div class="hashset-items">
          <el-tag
            v-for="(item, index) in normalizedValue"
            :key="index"
            closable
            @close="removeItem(item)"
          >
            {{ formatItem(item) }}
          </el-tag>
          <span v-if="normalizedValue.length === 0" class="empty-hint">未添加任何值</span>
        </div>
      </div>
    </template>
  </ConfigField>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfigField, { type FieldProps, type FieldSchema } from './ConfigField.vue'

const props = defineProps<FieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

function emitValue(value: any) {
  emit('update:modelValue', value)
}

const inputValue = ref('')

// 判断是否是枚举类型的 HashSet
const isEnumHashSet = computed(() => {
  const schema = props.schema as FieldSchema
  return schema.values?.type === 'enum' || !!schema.enumValues
})

// 枚举选项（如果是嵌套枚举）
const enumOptions = computed(() => {
  const schema = props.schema as FieldSchema
  const nestedType = schema.values as any

  if (nestedType?.type === 'enum' && nestedType?.enumValues) {
    // 嵌套的枚举类型
    const options: Record<number, string> = {}
    Object.entries(nestedType.enumValues).forEach(([label, value]) => {
      options[Number(value)] = label
    })
    return options
  }

  return {}
})

// 标准化值（确保是数组）
const normalizedValue = computed(() => {
  const value = props.modelValue
  if (Array.isArray(value)) return value
  if (value) return [value]
  return []
})

function hasItem(item: any): boolean {
  return normalizedValue.value.includes(item)
}

function formatItem(item: any): string {
  if (isEnumHashSet.value) {
    return enumOptions.value[item] ?? String(item)
  }
  return String(item)
}

function addItem(item: any) {
  const current = normalizedValue.value
  if (current.includes(item)) return

  const newValue = [...current, item]
  emitValue(newValue)
}

function addInputItem() {
  const val = inputValue.value.trim()
  if (!val) return

  // 尝试解析为数字
  const numVal = Number.parseInt(val, 10)
  addItem(Number.isNaN(numVal) ? val : numVal)

  inputValue.value = ''
}

function removeItem(item: any) {
  const current = normalizedValue.value
  const newValue = current.filter((v: any) => v !== item)
  emitValue(newValue)
}
</script>

<style scoped lang="less">
.hashset-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hashset-items {
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
