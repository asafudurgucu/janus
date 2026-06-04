import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}

export default function Modal({ title, onClose, children, footer, width = 520 }: Props): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex max-h-[88vh] flex-col rounded-xl border border-ink-500 bg-ink-800 shadow-2xl"
        style={{ width }}
      >
        <div className="flex items-center justify-between border-b border-ink-600 px-5 py-3">
          <h2 className="font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-ink-600 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-600 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}
