import http from '@/axios'

// 缓存
const cachedTypeDefinitions = new Map<string, Promise<any>>()
const cachedStructureDefinitions = new Map<string, Promise<any>>()

const subtypeRegex = /\[[^\]]+]/g

/**
 * 解析泛型参数
 */
function resolveSubtypes(type: string): string[] {
  const subtypes = type.match(subtypeRegex)
  if (!subtypes) return []
  return subtypes.map((subtype) => subtype.slice(1, subtype.length - 1))
}

/**
 * 获取结构定义
 */
async function getStructureDefinition(type: string): Promise<any> {
  if (cachedStructureDefinitions.has(type)) return cachedStructureDefinitions.get(type)!

  const structureDefinition = http.get<any>(`api/Structure/${encodeURIComponent(type)}`)
  cachedStructureDefinitions.set(type, structureDefinition)

  return structureDefinition
}

/**
 * 获取类型定义
 */
async function getTypeDefinition(type: string): Promise<any> {
  if (cachedTypeDefinitions.has(type)) return cachedTypeDefinitions.get(type)!

  const typeDefinition = http.get<any>(`api/Type/${encodeURIComponent(type)}`)
  cachedTypeDefinitions.set(type, typeDefinition)

  return typeDefinition
}

/**
 * 解析字段类型
 */
export interface FieldType {
  type: string
  defaultValue?: any
  paramName?: string
  param?: string
  description?: string
  placeholder?: string
  nullable?: boolean
  // 复杂类型（嵌套类型）
  values?: FieldType
  key?: FieldType
  value?: FieldType
  body?: Record<string, FieldType>
  // 枚举类型
  enumValues?: Record<string, number>
  // 未知类型（用于调试）
  typeDefinition?: any
  structureDefinition?: any
}

/**
 * 递归解析类型
 */
async function resolveType(targetType: string): Promise<FieldType> {
  const subtypes = resolveSubtypes(targetType)

  const baseType = targetType.split('`')[0]

  switch (baseType) {
    case 'System.Boolean':
      return { type: 'boolean' }
    case 'System.String':
    case 'System.Guid':
      return { type: 'string' }
    case 'System.Byte':
      return { type: 'byte' }
    case 'System.UInt32':
      return { type: 'uint32' }
    case 'System.UInt16':
      return { type: 'uint16' }
    case 'System.UInt64':
      return { type: 'uint64' }
    case 'System.Collections.Generic.HashSet':
    case 'System.Collections.Immutable.ImmutableHashSet':
      return { type: 'hashSet', values: await resolveType(subtypes[0]) }
    case 'System.Collections.Immutable.ImmutableList':
    case 'System.Collections.Generic.List':
      return { type: 'list', values: await resolveType(subtypes[0]) }
    case 'System.Collections.Generic.Dictionary':
    case 'System.Collections.Immutable.ImmutableDictionary':
      return {
        type: 'dictionary',
        key: await resolveType(subtypes[0]),
        value: await resolveType(subtypes[1]),
      }
    case 'System.Nullable':
      const { type } = await resolveType(subtypes[0])
      return { type, nullable: true }
    default:
      // 复杂类型
      return unwindType(targetType)
  }
}

/**
 * 解析对象类型
 */
async function unwindObject(type: string, typeDefinition: any): Promise<FieldType> {
  const resolvedStructure: FieldType = {
    type: 'object',
    body: {},
  }

  const [structureDefinition, resolvedTypes] = await Promise.all([
    getStructureDefinition(type),
    Promise.all(
      Object.keys(typeDefinition.Body).map(
        async (param) =>
          ({
            param,
            type: await resolveType(typeDefinition.Body[param]),
          }) as { param: string; type: FieldType },
      ),
    ),
  ])

  resolvedTypes.forEach((resolvedType) => {
    const { param, type } = resolvedType
    // UInt64 类型在序列化时使用 s_ 前缀
    const paramName = typeDefinition.Body[param] !== 'System.UInt64' ? param : `s_${param}`

    resolvedStructure.body![param] = {
      defaultValue: structureDefinition[param],
      paramName,
      param,
      ...type,
    }
  })

  return resolvedStructure
}

/**
 * 解析枚举值
 */
function parseEnumValues(rawValues: Record<string, string>): Record<string, number> {
  const enumValues: Record<string, number> = {}

  Object.keys(rawValues).forEach((key) => {
    enumValues[key] = Number.parseInt(rawValues[key], 10)
  })

  return enumValues
}

/**
 * 解析类型（主入口）
 */
async function unwindType(type: string): Promise<FieldType> {
  // 预加载缓存（dirty trick 但能提升 30% 性能）
  if (type === 'ArchiSteamFarm.Steam.Storage.BotConfig') {
    getStructureDefinition(type)
  }

  const typeDefinition = await getTypeDefinition(type)

  switch (typeDefinition.Properties.BaseType) {
    case 'System.Object':
      return unwindObject(type, typeDefinition)
    case 'System.Enum': {
      const isFlag = (typeDefinition.Properties.CustomAttributes || []).includes(
        'System.FlagsAttribute',
      )
      return {
        type: isFlag ? 'flag' : 'enum',
        enumValues: parseEnumValues(typeDefinition.Body),
      }
    }
    default: {
      const structureDefinition = await getStructureDefinition(type)
      return {
        type: 'unknown',
        typeDefinition,
        structureDefinition,
      }
    }
  }
}

/**
 * 获取配置 Schema
 * @param typeName 类型名称，如 'ArchiSteamFarm.Steam.Storage.BotConfig'
 * @returns 字段定义数组
 */
export async function fetchConfigSchema(typeName: string): Promise<FieldType[]> {
  const schema = await unwindType(typeName)

  if (schema.type === 'object' && schema.body) {
    return Object.keys(schema.body).map((key) => schema.body![key])
  }

  return []
}
