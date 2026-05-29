// thin-line SVG icons, 1px stroke, light style
type P = React.SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 16): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IcoArrow = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M7 17 17 7M9 7h8v8" /></svg>
)
export const IcoPlus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const IcoSearch = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></svg>
)
export const IcoTrash = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" /></svg>
)
export const IcoDoc = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /></svg>
)
export const IcoDownload = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" /></svg>
)
export const IcoCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m5 12 5 5 9-11" /></svg>
)
export const IcoSparkle = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3v6m0 6v6M3 12h6m6 0h6M6 6l3 3m6 6 3 3M6 18l3-3m6-6 3-3" /></svg>
)
export const IcoChevDown = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m6 9 6 6 6-6" /></svg>
)
