import type { Estimate, EstimateRow } from '../types'

export const NO_COEF_BLOCKS = [14, 15]
export const VAT_RATE = 0.22
export const USN_VAT = 0.05

export function rowTotal(r: EstimateRow): number {
  const useCoef = !r.blockId || !NO_COEF_BLOCKS.includes(r.blockId)
  const coef = useCoef ? r.coef : 1
  return r.price * r.qty * r.days * coef
}

export function sectionTotal(rows: EstimateRow[]): number {
  return rows.reduce((s, r) => s + rowTotal(r), 0)
}

export function estimateTotals(e: Estimate) {
  let net = 0
  for (const room of e.rooms) for (const sec of room.sections) net += sectionTotal(sec.rows)
  const usn5 = net * (1 + USN_VAT)
  const vat22 = net * (1 + VAT_RATE)
  return { net, usn5, vat22 }
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n))

export const fmtPrecise = (n: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n)

export function coefByDays(days: number): number {
  if (days <= 1) return 1
  if (days === 2) return 1 + 0.7
  return 1 + 0.7 + 0.5 * (days - 2)
}
