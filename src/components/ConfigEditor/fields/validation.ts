import type { FieldSchema } from './ConfigField.vue'

/**
 * 验证字段值
 */
export function validateField(value: any, schema: FieldSchema): string[] {
  const errors: string[] = []

  // 空值验证
  if (value === '' || value === null || value === undefined) {
    // 如果不是可空类型，检查默认值
    if (!schema.nullable && schema.defaultValue !== undefined) {
      // 空值是允许的（会使用默认值）
    }
  }

  // 类型特定验证
  switch (schema.type) {
    case 'uint64':
      if (value && !/^\d+$/.test(value)) {
        errors.push('必须是数字')
      }
      break
    case 'uint32':
    case 'uint16':
    case 'byte':
      if (value !== '' && value !== null && value !== undefined) {
        const num = Number(value)
        if (Number.isNaN(num) || num < 0 || !Number.isInteger(num)) {
          errors.push('必须是非负整数')
        }
      }
      break
    case 'string':
      // 字符串类型没有特殊验证
      break
    case 'boolean':
      // 布尔值总是有效的
      break
  }

  return errors
}
