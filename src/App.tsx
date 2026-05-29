import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Catalog } from './components/Catalog'
import { Empty } from './components/Empty'
import { seedIfEmpty, useStore } from './store'

export default function App() {
  const active = useStore((s) => s.estimates.find((e) => e.id === s.activeId) || null)
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null)

  useEffect(() => {
    seedIfEmpty()
  }, [])

  // reset target section when switching estimates
  useEffect(() => {
    setTargetSectionId(null)
  }, [active?.id])

  return (
    <div className="min-h-[100dvh] p-3 md:p-4 lg:p-5">
      {/* Asymmetrical Bento — sidebar 18% | editor 50% | catalog 32% */}
      <div className="grid gap-3 md:gap-4 lg:gap-5"
        style={{ gridTemplateColumns: '300px minmax(0, 1fr) 440px', height: 'calc(100dvh - 2.5rem)' }}>
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
        <Catalog estimateId={active?.id ?? null} targetSectionId={targetSectionId} />
      </div>
    </div>
  )
}
