import { useStore } from '../store'
import { IcoArrow, IcoSparkle } from './Icons'

export function Empty() {
  const createBlank = useStore((s) => s.createBlank)
  const createFromTemplate = useStore((s) => s.createFromTemplate)

  return (
    <div className="shell h-full">
      <div className="shell-inner h-full grid place-items-center px-10">
        <div className="max-w-xl text-center reveal">
          <span className="eyebrow">Lime · CRM</span>
          <h1 className="mt-5 text-5xl md:text-6xl font-semibold tracking-tight text-ink-900 leading-[0.95]">
            Оферта 2026 <br />
            <span className="text-lime-600">в смету за минуту.</span>
          </h1>
          <p className="mt-5 text-base text-ink-500">
            185 позиций каталога, индивидуальные цены клиентов, коэффициенты по дням аренды, итоги
            по УСН 5% и НДС 22%. Подготовлено к синхронизации с Битрикс24.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => createFromTemplate('big')} className="btn-primary">
              <span className="pl-1">Открыть «Большую» смету</span>
              <span className="ico"><IcoArrow size={14} /></span>
            </button>
            <button onClick={() => createFromTemplate('standard')} className="btn-ghost">
              <IcoSparkle size={13} /> Шаблон «Стандарт»
            </button>
            <button onClick={() => createBlank()} className="btn-ghost">
              Чистый лист
            </button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-3 text-left">
            <Stat n="185" l="позиций в оферте" />
            <Stat n="15" l="блоков каталога" />
            <Stat n="3" l="режима НДС" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="shell-sm">
      <div className="shell-sm-inner px-4 py-3">
        <div className="num text-2xl font-semibold tracking-tight text-ink-900">{n}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400 mt-1">{l}</div>
      </div>
    </div>
  )
}
