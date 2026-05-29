import { useEffect, useState } from 'react'
import { useStore } from '../store'
import type { Estimate, EstimateRow } from '../types'
import { estimateTotals, fmt, rowTotal, sectionTotal } from '../lib/calc'
import { IcoArrow, IcoDownload, IcoPlus, IcoTrash } from './Icons'
import { exportEstimateJson, exportEstimateXlsx } from '../lib/export'

export function Editor({
  estimate,
  targetSectionId,
  setTargetSectionId,
}: {
  estimate: Estimate
  targetSectionId: string | null
  setTargetSectionId: (id: string) => void
}) {
  const patch = useStore((s) => s.patch)
  const addRoom = useStore((s) => s.addRoom)
  const addSection = useStore((s) => s.addSection)
  const removeRow = useStore((s) => s.removeRow)
  const removeSection = useStore((s) => s.removeSection)
  const removeRoom = useStore((s) => s.removeRoom)
  const saveCustomPrice = useStore((s) => s.saveCustomPrice)

  // auto-pick first section if none selected
  useEffect(() => {
    if (!targetSectionId && estimate.rooms[0]?.sections[0]) {
      setTargetSectionId(estimate.rooms[0].sections[0].id)
    }
  }, [estimate.id, targetSectionId, estimate.rooms, setTargetSectionId])

  const totals = estimateTotals(estimate)
  const totalLine =
    estimate.vatMode === 'usn5' ? totals.usn5 : estimate.vatMode === 'vat22' ? totals.vat22 : totals.net

  return (
    <div className="shell h-full flex flex-col">
      <div className="shell-inner flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-7 pb-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <span className="eyebrow">Смета · черновик</span>
              <input
                value={estimate.title}
                onChange={(e) => patch(estimate.id, (x) => (x.title = e.target.value))}
                className="mt-2 block w-full text-3xl font-semibold tracking-tight text-ink-900 bg-transparent outline-none focus:bg-surface-50 rounded-lg px-1 -mx-1"
              />
              <div className="mt-2 grid grid-cols-3 gap-2 max-w-2xl">
                <FieldInline label="Клиент" value={estimate.client} onChange={(v) => patch(estimate.id, (x) => (x.client = v))} />
                <FieldInline label="Мероприятие" value={estimate.event} onChange={(v) => patch(estimate.id, (x) => (x.event = v))} />
                <FieldInline label="Период" value={estimate.dateRange} onChange={(v) => patch(estimate.id, (x) => (x.dateRange = v))} placeholder="01.06 – 04.06" />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="eyebrow !bg-ink-900 !text-lime-300 !ring-ink-700">
                {labelVat(estimate.vatMode)}
              </div>
              <div className="mt-3 num text-4xl font-semibold tracking-tight text-ink-900">{fmt(totalLine)} ₽</div>
              <div className="mt-1 text-[11px] text-ink-500 flex items-center gap-2 justify-end">
                {(['none', 'usn5', 'vat22'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => patch(estimate.id, (x) => (x.vatMode = m))}
                    className={`chip text-[10px] !px-2 !py-0.5 ${estimate.vatMode === m ? 'chip-active' : ''}`}
                  >
                    {labelVat(m)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button onClick={() => exportEstimateXlsx(estimate)} className="btn-primary">
              <span className="pl-1">Экспорт XLSX</span>
              <span className="ico"><IcoDownload size={14} /></span>
            </button>
            <button onClick={() => exportEstimateJson(estimate)} className="btn-ghost">
              <IcoDownload size={14} /> JSON
            </button>
            <button
              onClick={() => {
                const n = prompt('Название зала / локации?', `Зал №${estimate.rooms.length + 1}`)
                if (n) addRoom(estimate.id, n)
              }}
              className="btn-ghost"
            >
              <IcoPlus size={14} /> Зал
            </button>
            <div className="ml-auto text-[11px] text-ink-400">
              Обновлено {new Date(estimate.updatedAt).toLocaleString('ru-RU')}
            </div>
          </div>
        </div>

        <div className="hairline mx-8" />

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {estimate.rooms.map((room) => (
            <div key={room.id} className="shell-sm">
              <div className="shell-sm-inner px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <input
                    value={room.name}
                    onChange={(e) =>
                      patch(estimate.id, (x) => {
                        const r = x.rooms.find((r) => r.id === room.id)
                        if (r) r.name = e.target.value
                      })
                    }
                    className="text-lg font-semibold tracking-tight text-ink-900 bg-transparent outline-none focus:bg-surface-50 rounded-md px-1 -mx-1"
                  />
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => {
                        const n = prompt('Название раздела?', 'Новый раздел')
                        if (n) addSection(estimate.id, room.id, n)
                      }}
                      className="chip"
                    >
                      <IcoPlus size={12} /> Раздел
                    </button>
                    {estimate.rooms.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Удалить зал «${room.name}»?`)) removeRoom(estimate.id, room.id)
                        }}
                        className="text-ink-400 hover:text-red-500 transition-colors"
                      >
                        <IcoTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {room.sections.map((sec) => (
                    <div
                      key={sec.id}
                      onClick={() => setTargetSectionId(sec.id)}
                      className={`rounded-2xl ring-1 transition-all duration-500 ease-spring ${
                        sec.id === targetSectionId
                          ? 'ring-lime-400 bg-lime-50/40'
                          : 'ring-ink-900/[0.05] bg-surface-50'
                      }`}
                    >
                      <div className="px-4 py-3 flex items-center gap-3">
                        <span
                          className={`w-1.5 h-6 rounded-full transition-colors ${
                            sec.id === targetSectionId ? 'bg-lime-400' : 'bg-ink-200'
                          }`}
                        />
                        <input
                          value={sec.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            patch(estimate.id, (x) => {
                              for (const r of x.rooms)
                                for (const s of r.sections) if (s.id === sec.id) s.name = e.target.value
                            })
                          }
                          className="font-semibold text-ink-900 bg-transparent outline-none focus:bg-white rounded-md px-1 -mx-1"
                        />
                        <span className="text-[11px] text-ink-400 num">{sec.rows.length} поз.</span>
                        <span className="ml-auto num text-sm font-semibold text-ink-900">
                          {fmt(sectionTotal(sec.rows))} ₽
                        </span>
                        {sec.id !== targetSectionId && (
                          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">кликни →</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Удалить раздел «${sec.name}»?`)) removeSection(estimate.id, room.id, sec.id)
                          }}
                          className="text-ink-300 hover:text-red-500 transition-colors"
                        >
                          <IcoTrash size={13} />
                        </button>
                      </div>

                      {sec.rows.length > 0 && (
                        <div className="px-2 pb-3">
                          <div className="grid grid-cols-12 gap-2 px-3 text-[10px] uppercase tracking-[0.16em] text-ink-400 font-medium pb-1">
                            <div className="col-span-5">Позиция</div>
                            <div className="col-span-1 text-right">Кол-во</div>
                            <div className="col-span-2 text-right">Цена</div>
                            <div className="col-span-1 text-right">Дн</div>
                            <div className="col-span-1 text-right">К</div>
                            <div className="col-span-2 text-right">Сумма</div>
                          </div>
                          {sec.rows.map((r) => (
                            <RowItem
                              key={r.id}
                              row={r}
                              client={estimate.client}
                              onPatch={(fn) =>
                                patch(estimate.id, (x) => {
                                  for (const rm of x.rooms)
                                    for (const s of rm.sections)
                                      if (s.id === sec.id) {
                                        const i = s.rows.findIndex((rr) => rr.id === r.id)
                                        if (i >= 0) fn(s.rows[i])
                                      }
                                })
                              }
                              onSaveCustomPrice={() => {
                                if (estimate.client.trim()) {
                                  saveCustomPrice(estimate.client.trim(), r.name, r.price)
                                  alert(`Цена ${fmt(r.price)} ₽ сохранена как индивидуальная для клиента «${estimate.client}»`)
                                } else {
                                  alert('Сначала укажите клиента в шапке сметы')
                                }
                              }}
                              onRemove={() => removeRow(estimate.id, sec.id, r.id)}
                            />
                          ))}
                        </div>
                      )}
                      {sec.rows.length === 0 && (
                        <div className="px-5 pb-4 text-xs text-ink-400 italic">
                          Раздел пустой. {sec.id === targetSectionId ? 'Кликайте «+» в каталоге справа →' : 'Сделайте раздел активным, чтобы добавлять позиции.'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="shell-sm">
            <div className="shell-sm-inner px-6 py-5 grid grid-cols-3 gap-6">
              <Total label="Без НДС" value={totals.net} active={estimate.vatMode === 'none'} />
              <Total label="УСН, в т.ч. НДС 5%" value={totals.usn5} active={estimate.vatMode === 'usn5'} />
              <Total label="С НДС 22%" value={totals.vat22} active={estimate.vatMode === 'vat22'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function labelVat(m: 'none' | 'usn5' | 'vat22'): string {
  return m === 'none' ? 'Без НДС' : m === 'usn5' ? 'УСН 5%' : 'НДС 22%'
}

function FieldInline({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400 font-medium mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        className="field"
      />
    </label>
  )
}

function Total({ label, value, active }: { label: string; value: number; active?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 transition-all duration-500 ease-spring ${
      active ? 'bg-ink-900 text-surface-0' : 'bg-surface-50 text-ink-900'
    }`}>
      <div className={`text-[10px] uppercase tracking-[0.2em] ${active ? 'text-lime-300' : 'text-ink-400'}`}>{label}</div>
      <div className="mt-2 num text-2xl font-semibold tracking-tight">{fmt(value)} ₽</div>
    </div>
  )
}

function RowItem({
  row,
  client,
  onPatch,
  onRemove,
  onSaveCustomPrice,
}: {
  row: EstimateRow
  client: string
  onPatch: (fn: (r: EstimateRow) => void) => void
  onRemove: () => void
  onSaveCustomPrice: () => void
}) {
  const [priceOpen, setPriceOpen] = useState(false)
  const overridden = row.price !== row.basePrice && row.basePrice > 0
  return (
    <div className="row-strip group">
      <div className="col-span-5 flex items-center gap-2 min-w-0">
        <span className="text-[10px] text-ink-300 num shrink-0 w-5 text-right">·</span>
        <input
          value={row.name}
          onChange={(e) => onPatch((r) => (r.name = e.target.value))}
          className="field-bare truncate"
        />
        <span className="text-[10px] text-ink-400 shrink-0">{row.unit}</span>
      </div>
      <NumCell value={row.qty} onChange={(v) => onPatch((r) => (r.qty = v))} className="col-span-1" />
      <div className="col-span-2 text-right relative">
        <button
          onClick={() => setPriceOpen((v) => !v)}
          className={`num text-sm font-medium tabular-nums w-full text-right rounded-md px-1.5 py-1 transition-colors ${
            overridden ? 'text-lime-700 bg-lime-50' : 'text-ink-900 hover:bg-surface-100'
          }`}
          title={overridden ? `Индивидуальная цена. База ${fmt(row.basePrice)} ₽` : 'Цена из оферты'}
        >
          {fmt(row.price)}
        </button>
        {priceOpen && (
          <div className="absolute right-0 top-full mt-1 z-20 shell-sm w-64">
            <div className="shell-sm-inner p-3 space-y-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Цена за 1 день, ₽</div>
              <input
                type="number"
                value={row.price}
                onChange={(e) => onPatch((r) => (r.price = Number(e.target.value) || 0))}
                className="field num text-right"
                autoFocus
              />
              <div className="text-[11px] text-ink-500 flex items-center justify-between">
                <span>База: <span className="num">{fmt(row.basePrice)}</span> ₽</span>
                {overridden && (
                  <button
                    onClick={() => onPatch((r) => (r.price = r.basePrice))}
                    className="text-ink-700 hover:text-ink-900 underline decoration-dotted"
                  >
                    сбросить
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  onSaveCustomPrice()
                  setPriceOpen(false)
                }}
                className="btn-primary w-full justify-between"
              >
                <span className="pl-1 text-xs">Сохранить для «{client || '—'}»</span>
                <span className="ico"><IcoArrow size={12} /></span>
              </button>
              <button onClick={() => setPriceOpen(false)} className="text-[11px] text-ink-400 hover:text-ink-700">
                закрыть
              </button>
            </div>
          </div>
        )}
      </div>
      <NumCell value={row.days} onChange={(v) => onPatch((r) => (r.days = v))} className="col-span-1" />
      <NumCell value={row.coef} step={0.1} onChange={(v) => onPatch((r) => (r.coef = v))} className="col-span-1" />
      <div className="col-span-2 flex items-center justify-end gap-2">
        <span className="num text-sm font-semibold text-ink-900">{fmt(rowTotal(row))}</span>
        <button onClick={onRemove} className="text-ink-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <IcoTrash size={12} />
        </button>
      </div>
    </div>
  )
}

function NumCell({
  value,
  onChange,
  className,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  className?: string
  step?: number
}) {
  return (
    <input
      type="number"
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={`field-bare num text-right text-sm tabular-nums ${className || ''}`}
    />
  )
}
