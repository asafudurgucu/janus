import { Terminal as TerminalIcon, FolderTree, Box, ScrollText, X } from 'lucide-react'
import { useStore } from '../store'
import TerminalView from './Terminal'
import SftpPanel from './SftpPanel'
import DockerPanel from './DockerPanel'
import LogsPanel from './LogsPanel'
import SnippetsPanel from './SnippetsPanel'
import TunnelsPanel from './TunnelsPanel'
import SettingsPanel from './SettingsPanel'
import FleetDashboard from './FleetDashboard'
import BroadcastPanel from './BroadcastPanel'
import ServerDetail from './ServerDetail'
import type { Tab } from '../store'

const TAB_ICON = { terminal: TerminalIcon, sftp: FolderTree, docker: Box, logs: ScrollText } as const

function statusColor(status: Tab['status']): string {
  switch (status) {
    case 'connected':
      return 'bg-good'
    case 'connecting':
      return 'bg-warn animate-pulse'
    case 'error':
      return 'bg-bad'
    default:
      return 'bg-slate-600'
  }
}

export default function Workspace(): JSX.Element {
  const { tabs, activeTabId, setActiveTab, closeTab, sidePanel } = useStore()

  // Non-server panels take over the whole workspace.
  if (sidePanel === 'dashboard') return <FleetDashboard />
  if (sidePanel === 'broadcast') return <BroadcastPanel />
  if (sidePanel === 'snippets') return <SnippetsPanel />
  if (sidePanel === 'tunnels') return <TunnelsPanel />
  if (sidePanel === 'settings') return <SettingsPanel />

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-ink-900">
      {/* Tab bar */}
      {tabs.length > 0 && (
        <div className="flex h-10 shrink-0 items-stretch overflow-x-auto border-b border-ink-600 bg-ink-800">
          {tabs.map((tab) => {
            const active = tab.id === activeTabId
            const Icon = TAB_ICON[tab.kind]
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex max-w-[220px] cursor-pointer items-center gap-2 border-r border-ink-600 px-3 text-sm ${
                  active ? 'bg-ink-900 text-white' : 'text-slate-400 hover:bg-ink-700'
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColor(tab.status)}`} />
                <Icon size={13} className="shrink-0" />
                <span className="truncate">{tab.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="shrink-0 rounded p-0.5 text-slate-500 opacity-0 hover:bg-ink-500 hover:text-white group-hover:opacity-100"
                >
                  <X size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="relative min-h-0 flex-1">
        {tabs.length === 0 ? (
          <ServerDetail />
        ) : (
          tabs.map((tab) => (
            <div key={tab.id} className="absolute inset-0" style={{ display: tab.id === activeTabId ? 'block' : 'none' }}>
              {tab.kind === 'terminal' ? (
                <TerminalView tab={tab} />
              ) : tab.kind === 'sftp' ? (
                <SftpPanel tab={tab} />
              ) : tab.kind === 'docker' ? (
                <DockerPanel tab={tab} />
              ) : (
                <LogsPanel tab={tab} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
