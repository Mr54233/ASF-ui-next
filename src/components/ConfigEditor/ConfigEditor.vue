<template>
  <div class="config-editor">
    <el-skeleton v-if="loading" :rows="5" animated />

    <el-empty v-else-if="!fields.length" description="没有可编辑的配置" />

    <template v-else>
      <!-- 分类显示 -->
      <template v-if="categories && categories.length">
        <div
          v-for="category in nonEmptyCategories"
          :key="category.name"
          class="config-category"
        >
          <div class="category-header">
            <h3>{{ category.label }}</h3>
          </div>
          <div class="category-fields">
            <component
              :is="getFieldComponent(field)"
              v-for="field in categoryFields(category.name)"
              :key="field.param"
              :schema="field"
              :model-value="model[getFieldKey(field)]"
              @update:model-value="updateModel(field, $event)"
            />
          </div>
        </div>

        <!-- 未分类的字段 -->
        <div v-if="uncategorizedFields.length" class="config-category">
          <div class="category-header">
            <h3>其他</h3>
          </div>
          <div class="category-fields">
            <component
              :is="getFieldComponent(field)"
              v-for="field in uncategorizedFields"
              :key="field.param"
              :schema="field"
              :model-value="model[getFieldKey(field)]"
              @update:model-value="updateModel(field, $event)"
            />
          </div>
        </div>
      </template>

      <!-- 无分类显示 -->
      <template v-else>
        <component
          :is="getFieldComponent(field)"
          v-for="field in fields"
          :key="field.param"
          :schema="field"
          :model-value="model[getFieldKey(field)]"
          @update:model-value="updateModel(field, $event)"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchConfigSchema, type FieldType } from '@/utils/fetchConfigSchema'
import { loadParameterDescriptions } from '@/utils/loadParameterDescriptions'
import * as FieldComponents from './fields/index'

export interface ConfigCategory {
  name: string
  label: string
  fields: string[] // 字段 param 列表
}

export interface Props {
  // Bot 配置类型
  configType?: string
  // Bot 名称（用于获取现有配置）
  botName?: string
  // 分类
  categories?: ConfigCategory[]
  // 扩展字段（用于添加占位符等）
  extendedFields?: Record<string, Partial<FieldType>>
  // 是否删除默认值
  deleteDefaultValues?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  configType: 'ArchiSteamFarm.Steam.Storage.BotConfig',
  deleteDefaultValues: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'loading': [value: boolean]
}>()

// 状态
const loading = ref(true)
const fields = ref<FieldType[]>([])
const model = ref<Record<string, any>>({})

// 获取非空分类
const nonEmptyCategories = computed(() => {
  if (!props.categories) return []
  return props.categories.filter((category) => categoryFields(category.name).length > 0)
})

// 获取未分类的字段
const uncategorizedFields = computed(() => {
  if (!props.categories) return fields.value

  const categorizedFields = props.categories
    .map((category) => category.fields)
    .reduce((acc, fields) => [...acc, ...fields], [])

  return fields.value.filter((field) => !categorizedFields.includes(field.param || ''))
})

// 获取字段键名（用于 model）
function getFieldKey(field: FieldType): string {
  return (field.paramName || field.param) as string
}

// 获取分类下的字段
function categoryFields(categoryName: string): FieldType[] {
  if (!props.categories) return []

  const category = props.categories.find((c) => c.name === categoryName)
  if (!category) return []

  return category.fields
    .map((param) => fields.value.find((f) => f.param === param))
    .filter((f): f is FieldType => !!f)
    .sort((a, b) => {
      const aIndex = category.fields.indexOf(a.param || '')
      const bIndex = category.fields.indexOf(b.param || '')
      return aIndex - bIndex
    })
}

// 根据字段类型获取对应组件
function getFieldComponent(field: FieldType) {
  switch (field.type) {
    case 'string':
    case 'uint64':
    case 'guid':
      return FieldComponents.StringField
    case 'boolean':
      return FieldComponents.BooleanField
    case 'uint32':
    case 'uint16':
    case 'byte':
      return FieldComponents.NumberField
    case 'flag':
      return FieldComponents.FlagField
    case 'enum':
      return FieldComponents.EnumField
    case 'hashSet':
      return FieldComponents.HashSetField
    case 'list':
      return FieldComponents.ListField
    default:
      // 未知类型使用字符串组件
      return FieldComponents.StringField
  }
}

// 更新模型
function updateModel(field: FieldType, value: any) {
  const key = getFieldKey(field)
  model.value[key] = value

  emit('update:modelValue', { ...model.value })
}

// 加载配置
async function loadConfig() {
  if (loading.value && fields.value.length > 0) return // 如果已经有字段了，说明已加载过

  loading.value = true
  emit('loading', true)

  try {
    // 1. 获取 Schema
    const schemaFields = await fetchConfigSchema(props.configType!)

    // 2. 获取参数描述
    const descriptions = await loadParameterDescriptions('zh-CN')

    // 3. 合并扩展字段
    const extendedFields = props.extendedFields || {}

    // 4. 处理字段
    fields.value = schemaFields.map((field) => {
      const param = field.param || ''
      const description = descriptions[param] || field.description || ''

      // 应用扩展字段
      const extended = (param && extendedFields[param]) || {}

      return {
        ...field,
        description,
        ...extended,
      } as FieldType
    })

    // 5. 初始化模型值
    const initialValues: Record<string, any> = {}

    fields.value.forEach((field) => {
      const key = getFieldKey(field)

      if (props.deleteDefaultValues && field.defaultValue !== undefined) {
        // 如果需要删除默认值，初始化为空
        switch (field.type) {
          case 'boolean':
            initialValues[key] = false
            break
          case 'hashSet':
          case 'list':
            initialValues[key] = []
            break
          case 'dictionary':
            initialValues[key] = {}
            break
          default:
            initialValues[key] = ''
        }
      } else {
        initialValues[key] = field.defaultValue ?? getDefaultValueForType(field.type)
      }
    })

    model.value = initialValues

    // 6. 如果提供了 botName，加载现有配置
    if (props.botName) {
      // TODO: 调用 API 获取现有配置
      // const botConfig = await getBot(props.botName)
      // Object.assign(model.value, botConfig)
    }

    emit('update:modelValue', { ...model.value })
  } catch (error) {
    console.error('Failed to load config:', error)
    ElMessage.error(error instanceof Error ? error.message : '加载配置失败')
  } finally {
    loading.value = false
    emit('loading', false)
  }
}

// 根据类型获取默认值
function getDefaultValueForType(type: string): any {
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

// 初始化
onMounted(() => {
  loadConfig()
})

// 暴露方法
defineExpose({
  loadConfig,
  getModel: () => model.value,
  getFields: () => fields.value,
})
</script>

<style scoped lang="less">
.config-editor {
  padding: 16px 0;
}

.config-category {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.category-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #3a3a3c;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #e5eaf3;
  }
}

.category-fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
