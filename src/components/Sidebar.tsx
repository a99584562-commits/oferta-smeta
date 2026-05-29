import { useStore } from '../store'
import { estimateTotals, fmt } from '../lib/calc'
import { IcoPlus, IcoSparkle, IcoTrash } from './Icons'

export function Sidebar() {
  const estimates = useStore((s) => s.estimates)
  const activeId = useStore((s) => s.activeId)
  const setActive = useStore((s) => s.setActive)
  const createBlank = useStore((s) => s.createBlank)
  const createFromTemplate = useStore((s) => s.createFromTemplate)
  const removeEstimate = useStore((s) => s.removeEstimate)

  return (
    <aside className="shell h-full flex flex-col">
      <div className="shell-inner flex flex-col flex-1 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <span className="eyebrow">Сметы</span>
          <h2 className="mt-3 text-2xl font-semibold text-ink-900 tracking-tight">Проекты</h2>
          <p className="mt-1 text-xs text-ink-500">Локально в браузере. Готовы к синхронизации с Б24.</p>
        </div>

        <div className="px-3 flex flex-col gap-1.5 pb-3">
          <button onClick={() => createBlank()} className="btn-primary w-full justify-between">
            <span className="pl-1">Новая смета</span>
            <span className="ico"><IcoPlus size={14} /></span>
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => createFromTemplate('standard')} className="btn-ghost justify-center text-xs">
              <IcoSparkle size={13} /> Стандарт
            </button>
            <button onClick={() => createFromTemplate('big')} className="btn-ghost justify-center text-xs">
              <IcoSparkle size={13} /> Большая
            </button>
          </div>
        </div>

        <div className="hairline mx-5" />

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {estimates.length === 0 && (
            <div className="text-center text-xs text-ink-400 py-12 px-4">
              Пока пусто. Начните с шаблона или с нуля.
            </div>
          )}
          {estimates.map((e) => {
            const t = estimateTotals(e)
            const active = e.id === activeId
            return (
              <div
                key={e.id}
                onClick={() => setActive(e.id)}
                className={`group relative cursor-pointer rounded-2xl px-3 py-3 transition-all duration-500 ease-spring ${
                  active
                    ? 'bg-ink-900 text-surface-0 shadow-soft'
                    : 'bg-surface-50 hover:bg-surface-200 text-ink-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${active ? 'text-surface-0' : 'text-ink-900'}`}>
                      {e.title}
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate ${active ? 'text-lime-200' : 'text-ink-500'}`}>
                      {e.client || '— клиент не указан —'}
                    </div>
                  </div>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation()
                      if (confirm('Удалить смету?')) removeEstimate(e.id)
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      active ? 'text-surface-0' : 'text-ink-400'
                    } hover:text-red-500`}
                  >
                    <IcoTrash size={14} />
                  </button>
                </div>
                <div className={`mt-2 flex items-baseline gap-1.5`}>
                  <span className={`num text-base font-semibold ${active ? 'text-lime-300' : 'text-ink-900'}`}>
                    {fmt(t.net)}
                  </span>
                  <span className={`text-[11px] ${active ? 'text-lime-200/70' : 'text-ink-400'}`}>₽ без НДС</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hairline mx-5" />
        <div className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-ink-400">
          ЛАЙМ · Оферта & Смета · demo
        </div>
      </div>
    </aside>
  )
}
