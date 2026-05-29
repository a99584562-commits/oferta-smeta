import { useMemo, useState } from 'react'
import { blocksMeta, catalog, useStore } from '../store'
import { IcoPlus, IcoSearch } from './Icons'
import { fmt } from '../lib/calc'

export function Catalog({
  estimateId,
  targetSectionId,
}: {
  estimateId: string | null
  targetSectionId: string | null
}) {
  const [q, setQ] = useState('')
  const [bid, setBid] = useState<number | null>(null)
  const addRow = useStore((s) => s.addRow)

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return catalog.filter((c) => {
      if (bid !== null && c.blockId !== bid) return false
      if (qq && !c.name.toLowerCase().includes(qq) && !c.blockName.toLowerCase().includes(qq)) return false
      return true
    })
  }, [q, bid])

  const grouped = useMemo(() => {
    const m = new Map<string, typeof catalog>()
    filtered.forEach((c) => {
      const key = `${c.blockId}|${c.blockName}`
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(c)
    })
    return Array.from(m.entries())
  }, [filtered])

  const canAdd = !!estimateId && !!targetSectionId

  return (
    <div className="shell h-full flex flex-col">
      <div className="shell-inner flex flex-col flex-1 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Оферта 2026</span>
            <span className="text-[11px] text-ink-400 num">{catalog.length} позиций</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">Каталог</h2>
          <p className="mt-1 text-xs text-ink-500">
            Кликните «+», чтобы добавить позицию в активный раздел сметы.
          </p>

          <div className="mt-4 flex items-center gap-2 bg-surface-50 rounded-2xl px-3 py-2 ring-1 ring-ink-900/[0.05]">
            <IcoSearch size={16} className="text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по 185 позициям…"
              className="field-bare"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button onClick={() => setBid(null)} className={`chip ${bid === null ? 'chip-active' : ''}`}>
              Все
            </button>
            {blocksMeta.map((b) => (
              <button
                key={b.id}
                onClick={() => setBid(b.id)}
                className={`chip ${bid === b.id ? 'chip-active' : ''}`}
                title={b.name}
              >
                {shortBlockName(b.name)}
                <span className="num text-[10px] opacity-60">{b.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hairline mx-6" />

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {!canAdd && (
            <div className="mx-3 mb-3 text-[11px] text-ink-500 bg-lime-50 rounded-xl px-3 py-2 ring-1 ring-lime-200/70">
              Выберите смету и раздел в ней — позиции из каталога будут добавляться туда.
            </div>
          )}
          {grouped.map(([key, items]) => {
            const [, name] = key.split('|')
            return (
              <div key={key} className="mb-4">
                <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-ink-400 font-semibold">
                  {name}
                </div>
                <div className="space-y-1">
                  {items.map((it) => (
                    <div
                      key={`${it.blockId}-${it.n}-${it.name}`}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 transition-colors duration-300 ease-spring"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-ink-900 font-medium leading-snug line-clamp-2">{it.name}</div>
                        <div className="text-[11px] text-ink-400 mt-0.5 flex items-center gap-2">
                          <span>{it.unit || '—'}</span>
                          {it.sub && <span className="truncate">· {it.sub}</span>}
                          {it.comment && <span className="truncate">· {it.comment}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="num text-sm font-semibold text-ink-900">
                          {it.priceNoVat === null ? '—' : `${fmt(it.priceNoVat)} ₽`}
                        </div>
                        <div className="text-[10px] text-ink-400">за день, без НДС</div>
                      </div>
                      <button
                        disabled={!canAdd}
                        onClick={() => addRow(estimateId!, targetSectionId!, it)}
                        className={`w-8 h-8 rounded-full grid place-items-center transition-all duration-500 ease-spring ${
                          canAdd
                            ? 'bg-lime-400 text-ink-900 hover:bg-lime-300 hover:scale-105 active:scale-95'
                            : 'bg-surface-200 text-ink-300 cursor-not-allowed'
                        }`}
                      >
                        <IcoPlus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center text-xs text-ink-400 py-12">Ничего не нашлось</div>
          )}
        </div>
      </div>
    </div>
  )
}

function shortBlockName(name: string): string {
  const map: Record<string, string> = {
    'Конгрессное оборудование': 'Конгресс',
    'Оборудование синхронного перевода': 'Синхрон',
    'Звуковое оборудование': 'Звук',
    'Мультимедийное оборудование': 'Мультимедиа',
    'Световое оборудование': 'Свет',
    Тотемы: 'Тотемы',
    'СЦЕНИЧЕСКОЕ ОБОРУДОВАНИЕ И КОНСТРУКТИВ': 'Сцена',
    Декорации: 'Декор',
    'Оборудование для электронной регистрации посетителей': 'Регистрация',
    Оргтехника: 'Оргтехника',
    'Интерактивная система голосования': 'Голосование',
    'Дополнительное оборудование': 'Дополнительно',
    'Персонал и услуги': 'Персонал',
    'Транспортные расходы': 'Транспорт',
  }
  return map[name] || name
}
