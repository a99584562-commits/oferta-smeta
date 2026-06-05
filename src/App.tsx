import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { CatalogPanel } from './components/CatalogPanel'
import { CatalogPage } from './components/CatalogPage'
import { Empty } from './components/Empty'
import { seedIfEmpty, useStore } from './store'
import { IcoArrow } from './components/Icons'

export default function App() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const active = useStore((s) => s.estimates.find((e) => e.id === s.activeId) || null)
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null)

  useEffect(() => {
    seedIfEmpty()
  }, [])

  useEffect(() => {
    setTargetSectionId(null)
  }, [active?.id])

  if (view === 'catalog') {
    return (
      <div className="min-h-[100dvh] p-3 md:p-4 lg:p-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setView('estimates')}
            className="btn-ghost text-xs"
          >
            <IcoArrow size={12} className="rotate-180" />
            К сметам
          </button>
          <span className="eyebrow">ЛАЙМ · Оферта & Смета · Каталог</span>
        </div>
        <div className="reveal" style={{ height: 'calc(100dvh - 4.5rem)' }}>
          <CatalogPage />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] p-3 md:p-4 lg:p-5">
      <div
        className="grid gap-3 md:gap-4 lg:gap-5"
        style={{ gridTemplateColumns: '300px minmax(0, 1fr) 440px', height: 'calc(100dvh - 2.5rem)' }}
      >
        <Sidebar />
        <div className="min-w-0 reveal">
          {active ? (
            <Editor
              estimate={active}
              targetSectionId={targetSectionId}
              setTargetSectionId={setTargetSectionId}
            />
          ) : (
            <Empty />
          )}
        </div>
        <CatalogPanel estimateId={active?.id ?? null} targetSectionId={targetSectionId} />
      </div>
    </div>
  )
}
