export type CatalogItem = {
  // stable key: для seed-позиций — `s:${blockId}:${n}`; для пользовательских — `u:${id}`
  key: string
  source: 'seed' | 'custom'
  blockId: number
  blockName: string
  sub?: string | null
  n: number
  name: string
  unit: string
  priceNoVat: number | null
  priceVat: number | null
  comment: string
  // флаг — есть ли локальные изменения относительно сида
  edited?: boolean
}

export type CatalogOverride = {
  name?: string
  unit?: string
  priceNoVat?: number | null
  priceVat?: number | null
  comment?: string
  sub?: string | null
  blockId?: number
  archived?: boolean
}

export type CustomCatalogItem = {
  id: string
  blockId: number
  sub?: string | null
  name: string
  unit: string
  priceNoVat: number | null
  priceVat: number | null
  comment: string
}

export type EstimateRow = {
  id: string
  name: string
  unit: string
  qty: number
  days: number
  coef: number
  price: number          // base price (без НДС) — может быть индивидуальная
  basePrice: number      // цена из оферты на момент добавления
  blockId?: number       // источник в каталоге, чтобы знать нужно ли применять day-coef
  comment?: string
}

export type EstimateSection = {
  id: string
  name: string
  rows: EstimateRow[]
}

export type EstimateRoom = {
  id: string
  name: string
  sections: EstimateSection[]
}

export type Estimate = {
  id: string
  title: string
  client: string
  event: string
  dateRange: string
  rooms: EstimateRoom[]
  vatMode: 'none' | 'usn5' | 'vat22'
  createdAt: number
  updatedAt: number
}
