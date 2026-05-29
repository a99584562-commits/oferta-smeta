import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Estimate, EstimateRoom, EstimateRow, CatalogItem } from './types'
import ofertaJson from './data/oferta.json'
import templatesJson from './data/templates.json'

const uid = () => Math.random().toString(36).slice(2, 10)

export const catalog: CatalogItem[] = (ofertaJson.blocks as any[]).flatMap((b) =>
  b.items.map((it: any) => ({
    blockId: b.id,
    blockName: b.name,
    sub: it.sub ?? null,
    n: it.n,
    name: it.name,
    unit: it.unit,
    priceNoVat: it.priceNoVat,
    priceVat: it.priceVat,
    comment: it.comment,
  })),
)

export const blocksMeta = (ofertaJson.blocks as any[]).map((b) => ({ id: b.id, name: b.name, count: b.items.length }))

export function templateToEstimate(key: 'standard' | 'big'): Estimate {
  const tpl = (templatesJson as any)[key]
  const findCatalog = (name: string): CatalogItem | undefined =>
    catalog.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase())
  const rooms: EstimateRoom[] = tpl.rooms.map((room: any) => ({
    id: uid(),
    name: room.name,
    sections: room.sections.map((sec: any) => ({
      id: uid(),
      name: sec.name,
      rows: sec.items.map((it: any) => {
        const cat = findCatalog(it.name)
        return {
          id: uid(),
          name: it.name,
          unit: it.unit || cat?.unit || 'шт.',
          qty: typeof it.qty === 'number' ? it.qty : 1,
          days: typeof it.days === 'number' ? it.days : 1,
          coef: typeof it.coef === 'number' ? it.coef : 1,
          price: cat?.priceNoVat ?? 0,
          basePrice: cat?.priceNoVat ?? 0,
          blockId: cat?.blockId,
          comment: it.comment || '',
        } as EstimateRow
      }),
    })),
  }))
  return {
    id: uid(),
    title: tpl.title,
    client: 'Демо-клиент',
    event: 'Мероприятие',
    dateRange: '',
    rooms,
    vatMode: 'usn5',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function blankEstimate(): Estimate {
  return {
    id: uid(),
    title: 'Новая смета',
    client: '',
    event: '',
    dateRange: '',
    rooms: [
      { id: uid(), name: 'Основной зал', sections: [{ id: uid(), name: 'Видеооборудование', rows: [] }] },
    ],
    vatMode: 'usn5',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

type CustomPrice = { itemName: string; clientPrice: number }

type Store = {
  estimates: Estimate[]
  activeId: string | null
  customPrices: Record<string, CustomPrice[]>   // clientName -> overrides
  createBlank: () => string
  createFromTemplate: (key: 'standard' | 'big') => string
  setActive: (id: string) => void
  removeEstimate: (id: string) => void
  patch: (id: string, fn: (e: Estimate) => void) => void
  addRow: (id: string, sectionId: string, item: CatalogItem) => void
  addRoom: (id: string, name: string) => void
  addSection: (id: string, roomId: string, name: string) => void
  removeRow: (id: string, sectionId: string, rowId: string) => void
  removeSection: (id: string, roomId: string, sectionId: string) => void
  removeRoom: (id: string, roomId: string) => void
  saveCustomPrice: (client: string, itemName: string, price: number) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      estimates: [],
      activeId: null,
      customPrices: {},

      createBlank: () => {
        const e = blankEstimate()
        set((s) => ({ estimates: [e, ...s.estimates], activeId: e.id }))
        return e.id
      },
      createFromTemplate: (key) => {
        const e = templateToEstimate(key)
        set((s) => ({ estimates: [e, ...s.estimates], activeId: e.id }))
        return e.id
      },
      setActive: (id) => set({ activeId: id }),
      removeEstimate: (id) =>
        set((s) => ({
          estimates: s.estimates.filter((e) => e.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      patch: (id, fn) =>
        set((s) => ({
          estimates: s.estimates.map((e) => {
            if (e.id !== id) return e
            const copy = structuredClone(e)
            fn(copy)
            copy.updatedAt = Date.now()
            return copy
          }),
        })),

      addRow: (id, sectionId, item) => {
        const client = get().estimates.find((e) => e.id === id)?.client || ''
        const overrides = get().customPrices[client] || []
        const custom = overrides.find((o) => o.itemName === item.name)
        const price = custom ? custom.clientPrice : item.priceNoVat ?? 0
        get().patch(id, (e) => {
          for (const room of e.rooms)
            for (const sec of room.sections)
              if (sec.id === sectionId) {
                sec.rows.push({
                  id: uid(),
                  name: item.name,
                  unit: item.unit || 'шт.',
                  qty: 1,
                  days: 1,
                  coef: 1,
                  price,
                  basePrice: item.priceNoVat ?? 0,
                  blockId: item.blockId,
                  comment: '',
                })
              }
        })
      },
      addRoom: (id, name) =>
        get().patch(id, (e) => {
          e.rooms.push({ id: uid(), name, sections: [{ id: uid(), name: 'Раздел', rows: [] }] })
        }),
      addSection: (id, roomId, name) =>
        get().patch(id, (e) => {
          const r = e.rooms.find((r) => r.id === roomId)
          if (r) r.sections.push({ id: uid(), name, rows: [] })
        }),
      removeRow: (id, sectionId, rowId) =>
        get().patch(id, (e) => {
          for (const r of e.rooms)
            for (const s of r.sections)
              if (s.id === sectionId) s.rows = s.rows.filter((x) => x.id !== rowId)
        }),
      removeSection: (id, roomId, sectionId) =>
        get().patch(id, (e) => {
          const r = e.rooms.find((r) => r.id === roomId)
          if (r) r.sections = r.sections.filter((s) => s.id !== sectionId)
        }),
      removeRoom: (id, roomId) =>
        get().patch(id, (e) => {
          e.rooms = e.rooms.filter((r) => r.id !== roomId)
        }),
      saveCustomPrice: (client, itemName, price) =>
        set((s) => {
          const list = s.customPrices[client] ? [...s.customPrices[client]] : []
          const idx = list.findIndex((o) => o.itemName === itemName)
          if (idx >= 0) list[idx] = { itemName, clientPrice: price }
          else list.push({ itemName, clientPrice: price })
          return { customPrices: { ...s.customPrices, [client]: list } }
        }),
    }),
    { name: 'oferta-smeta-v1' },
  ),
)

export const seedIfEmpty = () => {
  const s = useStore.getState()
  if (s.estimates.length === 0) {
    s.createFromTemplate('big')
    s.createFromTemplate('standard')
  }
}
