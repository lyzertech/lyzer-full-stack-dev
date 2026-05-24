// ─── Shared Types for Labs Product Spec System ───────────────────────────────

export interface Brand {
  id: number
  name: string
  slug: string
  logo: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: number | null
  sort_order: number
  is_active: boolean
  spec_definitions?: SpecDefinition[]
}

export type DataType =
  | 'text'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'select'
  | 'multi_select'
  | 'range'

export interface SpecDefinition {
  id: number
  spec_name: string
  spec_key: string
  data_type: DataType
  unit: string | null
  group_name: string | null
  options: string[] | null
  is_filterable: boolean
  sort_order: number
  description: string | null
  pivot?: {
    is_required: boolean
    sort_order: number
  }
}

export interface ProductSpecValue {
  id: number
  product_id: number
  spec_definition_id: number
  value_text: string | null
  value_number: number | null
  value_decimal: number | null
  value_boolean: boolean | null
  value_json: any | null
  spec_definition: SpecDefinition
}

export interface Product {
  id: number
  brand_id: number | null
  category_id: number | null
  product_name: string
  model: string | null
  sku: string | null
  description: string | null
  image: string | null
  datasheet: string | null
  specs_cache: Record<string, any> | null
  status: 'Active' | 'Discontinued' | 'Draft'
  brand?: Brand
  category?: Category
  spec_values?: ProductSpecValue[]
  created_at: string
  updated_at: string
}

export const DATA_TYPE_OPTIONS: DataType[] = [
  'text', 'number', 'decimal', 'boolean', 'select', 'multi_select', 'range',
]

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  text:         'Text',
  number:       'Integer Number',
  decimal:      'Decimal Number',
  boolean:      'Boolean (Yes/No)',
  select:       'Single Select',
  multi_select: 'Multi Select',
  range:        'Range (Min/Max)',
}

export const DATA_TYPE_ICONS: Record<DataType, string> = {
  text:         'bi-fonts',
  number:       'bi-123',
  decimal:      'bi-calculator',
  boolean:      'bi-toggle-on',
  select:       'bi-menu-button',
  multi_select: 'bi-ui-checks',
  range:        'bi-distribute-horizontal',
}

export const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Active:       { bg: 'rgba(33,186,69,0.12)',   color: '#21ba45', border: 'rgba(33,186,69,0.3)'   },
  Discontinued: { bg: 'rgba(220,53,69,0.12)',   color: '#f04860', border: 'rgba(220,53,69,0.3)'   },
  Draft:        { bg: 'rgba(108,117,125,0.12)', color: '#8a95a0', border: 'rgba(108,117,125,0.3)' },
}
