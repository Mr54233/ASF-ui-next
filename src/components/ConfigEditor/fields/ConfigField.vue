<template>
  <div class="config-field">
    <div class="field-header">
      <label class="field-label" :class="{ 'has-desc': hasDescription }" @click="toggleDescription">
        {{ label }}
      </label>
      <el-tooltip v-if="hasDescription" content="查看说明" placement="top">
        <el-icon class="field-info-icon" @click="toggleDescription">
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </div>

    <div class="field-value">
      <slot
        :value="internalValue"
        :update="(val: any) => updateValue(val)"
        :errors="errors"
      />
      <div v-if="hasErrors" class="field-errors">
        <span v-for="(error, index) in errors" :key="index" class="error-text">{{ error }}</span>
      </div>
    </div>

    <el-collapse-transition>
      <div v-if="hasDescription && showDescription" class="field-description" v-html="description"></div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { validateField } from './validation'

export interface FieldSchema {
  type: string
  defaultValue?: any
  paramName?: string
  param?: string
  description?: string
  placeholder?: string
  nullable?: boolean
  // 复杂类型
  values?: { type: any }
  enumValues?: Record<string, number>
}

export interface FieldProps {
  schema: FieldSchema
  modelValue: any
}

const props = defineProps<FieldProps>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const internalValue = ref<any>(props.modelValue ?? props.schema.defaultValue ?? getDefaultValue())

const showDescription = ref(false)

// 根据类型获取默认值
function getDefaultValue(): any {
  const { type } = props.schema
  switch (type) {
    case 'boolean':
      return false
    case 'hashSet':
    case 'list':
      return []
    case 'dictionary':
      return {}
    default:
      return ''
  }
}

// 计算属性
const label = computed(() => props.schema.paramName || props.schema.param || '')

const hasDescription = computed(() => !!props.schema.description)

const description = computed(() => props.schema.description || '')

const placeholder = computed(() => props.schema.placeholder ?? props.schema.defaultValue ?? '')

// 验证
const errors = computed(() => validateField(internalValue.value, props.schema))

const hasErrors = computed(() => errors.value.length > 0)

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== internalValue.value) {
      internalValue.value = newVal
    }
  },
)

// 更新值
function updateValue(newValue: any) {
  internalValue.value = newValue
  emit('update:modelValue', newValue)
}

// 切换说明显示
function toggleDescription() {
  if (hasDescription.value) {
    showDescription.value = !showDescription.value
  }
}
</script>

<style scoped lang="less">
.config-field {
  margin-bottom: 16px;
}

.field-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #e5eaf3;
  cursor: default;

  &.has-desc {
    cursor: pointer;
    color: #409eff;

    &:hover {
      text-decoration: underline;
    }
  }
}

.field-info-icon {
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #409eff;
  }
}

.field-value {
  position: relative;
}

.field-errors {
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
}

.field-description {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #262727;
  border-left: 3px solid #409eff;
  font-size: 13px;
  color: #cfd3dc;
  line-height: 1.6;

  :deep(p) {
    margin: 0 0 8px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(code) {
    padding: 2px 6px;
    background-color: #1d1d1d;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
  }

  :deep(a) {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
