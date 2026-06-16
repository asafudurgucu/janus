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
import NotesWidget from './components/NotesWidget'

export default function App(): JSX.Element {
  const { loading, locked, init, serverFormOpen, groupFormOpen, setPalette, openServerForm, closeActiveTab, vault, lock, miniMode } =
    useStore()

  useEffect(() => {
    init()
  }, [init])

  // Apply the selected theme to the document root.
  const theme = vault?.settings.theme ?? 'midnight'
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Auto-lock after a period of inactivity (0 = never).
  const lockAfterMinutes = vault?.settings.lockAfterMinutes ?? 0
  useEffect(() => {
    if (locked || !lockAfterMinutes) return
    let timer: ReturnType<typeof setTimeout>
    const reset = (): void => {
      clearTimeout(timer)
      timer = setTimeout(() => lock(), lockAfterMinutes * 60_000)
    }
    const events = ['mousemove', 'keydown', 'mousedown', 'wheel', 'touchstart']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [locked, lockAfterMinutes, lock])

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
        {!miniMode && <Sidebar />}
        <Workspace />
      </div>
      <UpdateBanner />
      {!miniMode && <NotesWidget />}
      {serverFormOpen && <ServerForm />}
      {groupFormOpen && <GroupForm />}
      <CommandPalette />
    </div>
  )
}
