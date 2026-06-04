import { useEffect } from 'react'
import { useStore } from './store'
import LockScreen from './components/LockScreen'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Workspace from './components/Workspace'
import ServerForm from './components/ServerForm'
import GroupForm from './components/GroupForm'
import CommandPalette from './components/CommandPalette'
import UpdateBanner from './components/UpdateBanner'

export default function App(): JSX.Element {
  const { loading, locked, init, serverFormOpen, groupFormOpen, setPalette, openServerForm, closeActiveTab } =
    useStore()

  useEffect(() => {
    init()
  }, [init])

  // Global keyboard shortcuts.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const mod = e.metaKey || e.ctrlKey
      if (locked) return
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette(!useStore.getState().paletteOpen)
      } else if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        openServerForm()
      } else if (mod && e.key.toLowerCase() === 'w') {
        e.preventDefault()
        closeActiveTab()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, setPalette, openServerForm, closeActiveTab])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-ink-900 text-slate-500">
        <div className="animate-pulse text-sm">Janus yükleniyor…</div>
      </div>
    )
  }

  if (locked) {
    return (
      <div className="flex h-full flex-col bg-ink-900">
        <TitleBar minimal />
        <LockScreen />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-ink-900">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <Workspace />
      </div>
      <UpdateBanner />
      {serverFormOpen && <ServerForm />}
      {groupFormOpen && <GroupForm />}
      <CommandPalette />
    </div>
  )
}
