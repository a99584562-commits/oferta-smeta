import { useMemo, useState } from 'react'
import { blocksMeta, buildCatalog, useStore } from '../store'
import type { CatalogItem } from '../types'
import { IcoArrow, IcoCheck, IcoPlus, IcoSearch, IcoTrash } from './Icons'

export function CatalogPage() {
  const overrides = useStore((s) => s.catalogOverrides)
  const customItems = useStore((s) => s.customItems)
  const catalog = useMemo(() => buildCatalog(overrides, customItems), [overrides, customItems])
  const patchCatalog = useStore((s) => s.patchCatalog)
  const resetCatalog = useStore((s) => s.resetCatalog)
  const archiveCatalog = useStore((s) => s.archiveCatalog)
  const unarchiveCatalog = useStore((s) => s.unarchiveCatalog)
  const addCustomItem = useStore((s) => s.addCustomItem)
  const updateCustomItem = useStore((s) => s.updateCustomItem)
  const removeCustomItem = useStore((s) => s.removeCustomItem)
  const resetAllCatalog = useStore((s) => s.resetAllCatalog)

  const [q, setQ] = useState('')
  const [bid, setBid] = useState<number | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [withVat, setWithVat] = useState(false)

  // Архивные позиции получаем отдельно, т.к. в catalog их нет
  const archivedKeys = useMemo(
    () => Object.entries(overrides).filter(([, v]) => v.archived).map(([k]) => k),
    [overrides],
  )

  const items = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return catalog.filter((c) => {
      if (bid !== null && c.blockId !== bid) return false
      if (qq && !c.name.toLowerCase().includes(qq) && !c.blockName.toLowerCase().includes(qq)) return false
      return true
    })
  }, [catalog, q, bid])

  const grouped = useMemo(() => {
    const m = new Map<number, { name: string; items: CatalogItem[] }>()
    for (const it of items) {
      if (!m.has(it.blockId)) m.set(it.blockId, { name: it.blockName, items: [] })
      m.get(it.blockId)!.items.push(it)
    }
    return Array.from(m.entries()).sort(([a], [b]) => a - b)
  }, [items])

  const editedCount = Object.values(overrides).filter((o) => !o.archived && Object.keys(o).length > 0).length
  const totalActive = catalog.length

  return (
    <div className="shell h-full flex flex-col">
      <div className="shell-inner flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-7 pb-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <span className="eyebrow">Склад · база оборудования</span>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">
                Каталог оферты <span className="text-ink-300">/</span>{' '}
                <span className="text-lime-600">правки и свои позиции</span>
              </h1>
              <p className="mt-2 text-sm text-ink-500 max-w-2xl">
                Меняйте цены, единицы, наименования и комментарии прямо в базе. Изменения автоматически попадут во все новые сметы.
                Можно добавлять свои позиции и архивировать ненужные.
              </p>
            </div>
            <div className="shrink-0 grid grid-cols-3 gap-2">
              <StatChip n={totalActive} l="активных" />
              <StatChip n={editedCount} l="правки" accent />
              <StatChip n={customItems.length} l="свои" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-surface-50 rounded-2xl px-3 py-2 ring-1 ring-ink-900/[0.05] min-w-[280px]">
              <IcoSearch size={16} className="text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск по наименованию или блоку…"
                className="field-bare"
              />
            </div>
            <label className="chip cursor-pointer">
              <input
                type="checkbox"
                checked={withVat}
                onChange={(e) => setWithVat(e.target.checked)}
                className="accent-lime-500"
              />
              Показать «с НДС 22%»
            </label>
            <label className="chip cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="accent-lime-500"
              />
              Архив ({archivedKeys.length})
            </label>
            <div className="ml-auto flex items-center gap-2">
              {(editedCount > 0 || customItems.length > 0) && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Сбросить все правки (${editedCount}) и удалить свои позиции (${customItems.length})?`,
                      )
                    )
                      resetAllCatalog()
                  }}
                  className="btn-ghost text-xs"
                >
                  Сбросить всё к оферте
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button onClick={() => setBid(null)} className={`chip ${bid === null ? 'chip-active' : ''}`}>
              Все блоки
            </button>
            {blocksMeta.map((b) => (
              <button
                key={b.id}
                onClick={() => setBid(b.id)}
                className={`chip ${bid === b.id ? 'chip-active' : ''}`}
                title={b.name}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="hairline mx-8" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {grouped.map(([blockId, { name, items }]) => (
            <BlockSection
              key={blockId}
              blockId={blockId}
              blockName={name}
              items={items}
              withVat={withVat}
              onPatch={patchCatalog}
              onReset={resetCatalog}
              onArchive={archiveCatalog}
              onUpdateCustom={updateCustomItem}
              onRemoveCustom={removeCustomItem}
              onAddCustom={(blockId) =>
                addCustomItem({
                  blockId,
                  sub: null,
                  name: 'Новая позиция',
                  unit: 'шт.',
                  priceNoVat: 0,
                  priceVat: 0,
                  comment: '',
                })
              }
            />
          ))}

          {showArchived && archivedKeys.length > 0 && (
            <ArchivedList archivedKeys={archivedKeys} onUnarchive={unarchiveCatalog} />
          )}

          {grouped.length === 0 && (
            <div className="text-center text-xs text-ink-400 py-16">Ничего не нашлось по фильтру</div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatChip({ n, l, accent }: { n: number; l: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl px-4 py-2 ring-1 ${
        accent ? 'bg-lime-50 ring-lime-200/70 text-lime-800' : 'bg-surface-50 ring-ink-900/[0.06] text-ink-900'
      }`}
    >
      <div className="num text-lg font-semibold tracking-tight">{n}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">{l}</div>
    </div>
  )
}

function BlockSection({
  blockId,
  blockName,
  items,
  withVat,
  onPatch,
  onReset,
  onArchive,
  onUpdateCustom,
  onRemoveCustom,
  onAddCustom,
}: {
  blockId: number
  blockName: string
  items: CatalogItem[]
  withVat: boolean
  onPatch: ReturnType<typeof useStore.getState>['patchCatalog']
  onReset: ReturnType<typeof useStore.getState>['resetCatalog']
  onArchive: ReturnType<typeof useStore.getState>['archiveCatalog']
  onUpdateCustom: ReturnType<typeof useStore.getState>['updateCustomItem']
  onRemoveCustom: ReturnType<typeof useStore.getState>['removeCustomItem']
  onAddCustom: (blockId: number) => void
}) {
  return (
    <div className="shell-sm">
      <div className="shell-sm-inner">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-400 num">блок {blockId}</span>
            <h3 className="text-lg font-semibold tracking-tight text-ink-900">{blockName}</h3>
            <span className="text-[11px] text-ink-400 num">{items.length} поз.</span>
          </div>
          <button onClick={() => onAddCustom(blockId)} className="chip">
            <IcoPlus size={12} /> Своя позиция
          </button>
        </div>

        <div className="px-2 pb-3">
          <div className="grid grid-cols-12 gap-2 px-3 text-[10px] uppercase tracking-[0.16em] text-ink-400 font-medium pb-1">
            <div className="col-span-5">Наименование</div>
            <div className="col-span-1">Ед.</div>
            <div className="col-span-2 text-right">Цена без НДС</div>
            <div className="col-span-2 text-right">{withVat ? 'Цена с НДС' : 'Комментарий'}</div>
            <div className="col-span-2 text-right">Действия</div>
          </div>
          {items.map((it) => (
            <CatalogRow
              key={it.key}
              item={it}
              withVat={withVat}
              onPatch={onPatch}
              onReset={onReset}
              onArchive={onArchive}
              onUpdateCustom={onUpdateCustom}
              onRemoveCustom={onRemoveCustom}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CatalogRow({
  item,
  withVat,
  onPatch,
  onReset,
  onArchive,
  onUpdateCustom,
  onRemoveCustom,
}: {
  item: CatalogItem
  withVat: boolean
  onPatch: ReturnType<typeof useStore.getState>['patchCatalog']
  onReset: ReturnType<typeof useStore.getState>['resetCatalog']
  onArchive: ReturnType<typeof useStore.getState>['archiveCatalog']
  onUpdateCustom: ReturnType<typeof useStore.getState>['updateCustomItem']
  onRemoveCustom: ReturnType<typeof useStore.getState>['removeCustomItem']
}) {
  const isCustom = item.source === 'custom'
  const customId = isCustom ? item.key.slice(2) : null

  const patchField = (field: 'name' | 'unit' | 'comment', value: string) => {
    if (isCustom && customId) onUpdateCustom(customId, { [field]: value })
    else onPatch(item.key, { [field]: value })
  }
  const patchPrice = (which: 'priceNoVat' | 'priceVat', value: number) => {
    if (isCustom && customId) onUpdateCustom(customId, { [which]: value })
    else onPatch(item.key, { [which]: value })
  }

  return (
    <div className="row-strip group items-center">
      <div className="col-span-5 min-w-0 flex items-center gap-2">
        <input
          value={item.name}
          onChange={(e) => patchField('name', e.target.value)}
          className="field-bare truncate text-sm font-medium"
        />
        {item.edited && (
          <span className="text-[9px] uppercase tracking-[0.14em] text-lime-700 bg-lime-50 ring-1 ring-lime-200/70 px-1.5 py-0.5 rounded-full shrink-0">
            правка
          </span>
        )}
        {isCustom && (
          <span className="text-[9px] uppercase tracking-[0.14em] text-ink-700 bg-surface-200 ring-1 ring-ink-200 px-1.5 py-0.5 rounded-full shrink-0">
            своя
          </span>
        )}
      </div>
      <div className="col-span-1">
        <input
          value={item.unit}
          onChange={(e) => patchField('unit', e.target.value)}
          className="field-bare text-xs text-ink-500"
        />
      </div>
      <div className="col-span-2 text-right">
        <PriceInput
          value={item.priceNoVat ?? 0}
          onChange={(v) => patchPrice('priceNoVat', v)}
          edited={item.edited && !isCustom}
        />
      </div>
      <div className="col-span-2 text-right">
        {withVat ? (
          <PriceInput
            value={item.priceVat ?? 0}
            onChange={(v) => patchPrice('priceVat', v)}
            edited={item.edited && !isCustom}
          />
        ) : (
          <input
            value={item.comment || ''}
            onChange={(e) => patchField('comment', e.target.value)}
            placeholder="—"
            className="field-bare text-right text-xs text-ink-500"
          />
        )}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-1.5">
        {item.edited && !isCustom && (
          <button
            onClick={() => onReset(item.key)}
            title="Сбросить правки к оферте"
            className="text-ink-400 hover:text-ink-900 transition-colors text-[11px] underline decoration-dotted"
          >
            к оферте
          </button>
        )}
        {isCustom ? (
          <button
            onClick={() => {
              if (customId && confirm(`Удалить позицию «${item.name}»?`)) onRemoveCustom(customId)
            }}
            className="w-7 h-7 rounded-full grid place-items-center text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <IcoTrash size={13} />
          </button>
        ) : (
          <button
            onClick={() => {
              if (confirm(`Скрыть «${item.name}» из каталога? Можно вернуть из архива.`)) onArchive(item.key)
            }}
            title="Архивировать"
            className="w-7 h-7 rounded-full grid place-items-center text-ink-400 hover:text-ink-900 hover:bg-surface-100 transition-colors"
          >
            <IcoTrash size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

function PriceInput({
  value,
  onChange,
  edited,
}: {
  value: number
  onChange: (v: number) => void
  edited?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative inline-flex items-center justify-end">
      <input
        type="number"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={`field-bare num text-right text-sm font-semibold tabular-nums px-2 py-1 rounded-md transition-colors w-full ${
          edited ? 'text-lime-700 bg-lime-50' : focused ? 'bg-surface-50' : 'text-ink-900'
        }`}
      />
      <span className="ml-1 text-[10px] text-ink-400 num">₽</span>
    </div>
  )
}

function ArchivedList({
  archivedKeys,
  onUnarchive,
}: {
  archivedKeys: string[]
  onUnarchive: (key: string) => void
}) {
  // достаём оригинальное имя из ключа
  const items = archivedKeys.map((k) => {
    const [, , , ...nameParts] = k.split(':')
    return { key: k, name: nameParts.join(':') }
  })
  return (
    <div className="shell-sm">
      <div className="shell-sm-inner px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">Архив ({items.length})</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {items.map((it) => (
            <div key={it.key} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-50">
              <div className="text-sm text-ink-700 truncate flex-1">{it.name}</div>
              <button
                onClick={() => onUnarchive(it.key)}
                className="chip text-[11px]"
              >
                <IcoCheck size={12} /> вернуть
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Стрелки кнопок-табов для верхней навигации */
export function ViewTabs() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  return (
    <div className="shell-sm inline-flex">
      <div className="shell-sm-inner p-1 flex items-center gap-1">
        <TabBtn active={view === 'estimates'} onClick={() => setView('estimates')}>
          Сметы
        </TabBtn>
        <TabBtn active={view === 'catalog'} onClick={() => setView('catalog')}>
          Каталог
          <span className="ml-1.5 text-[10px] opacity-70 num">база</span>
          <span className="ml-1"><IcoArrow size={11} /></span>
        </TabBtn>
      </div>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ease-spring ${
        active ? 'bg-ink-900 text-surface-0 shadow-soft' : 'text-ink-700 hover:bg-surface-50'
      }`}
    >
      {children}
    </button>
  )
}
