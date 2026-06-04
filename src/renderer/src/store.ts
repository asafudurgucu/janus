import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  Vault,
  ServerProfile,
  Group,
  Snippet,
  TunnelRule,
  AppSettings,
  SessionStatus
} from '@shared/types'

export type TabKind = 'terminal' | 'sftp'

export interface Tab {
  id: string
  kind: TabKind
  serverId: string
  title: string
  status: SessionStatus
}

interface UIState {
  // vault
  vault: Vault | null
  locked: boolean
  hasVault: boolean
  loading: boolean
  error: string | null

  // selection / navigation
  selectedServerId: string | null
  search: string
  activeTagFilter: string | null
  sidePanel: 'servers' | 'snippets' | 'tunnels' | 'settings'

  // modals
  editingServer: ServerProfile | null
  serverFormOpen: boolean
  groupFormOpen: boolean
  editingGroup: Group | null

  // tabs / sessions
  tabs: Tab[]
  activeTabId: string | null

  // command palette
  paletteOpen: boolean
}

interface Actions {
  init: () => Promise<void>
  createVault: (password: string) => Promise<void>
  unlock: (password: string) => Promise<void>
  lock: () => Promise<void>
  persist: () => Promise<void>

  // server CRUD
  upsertServer: (server: ServerProfile) => Promise<void>
  deleteServer: (id: string) => Promise<void>
  duplicateServer: (id: string) => Promise<void>
  markConnected: (id: string) => Promise<void>

  // group CRUD
  upsertGroup: (group: Group) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  toggleGroup: (id: string) => Promise<void>

  // snippet CRUD
  upsertSnippet: (s: Snippet) => Promise<void>
  deleteSnippet: (id: string) => Promise<void>

  // tunnel CRUD
  upsertTunnel: (t: TunnelRule) => Promise<void>
  deleteTunnel: (id: string) => Promise<void>

  // settings
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>

  // ui
  setSearch: (q: string) => void
  setTagFilter: (t: string | null) => void
  setSidePanel: (p: UIState['sidePanel']) => void
  selectServer: (id: string | null) => void
  openServerForm: (server?: ServerProfile) => void
  closeServerForm: () => void
  openGroupForm: (group?: Group) => void
  closeGroupForm: () => void

  // tabs
  openTerminal: (serverId: string) => void
  openSftp: (serverId: string) => void
  closeTab: (tabId: string) => void
  closeActiveTab: () => void
  setActiveTab: (tabId: string) => void
  setTabStatus: (tabId: string, status: SessionStatus) => void

  // command palette
  setPalette: (open: boolean) => void
}

export const useStore = create<UIState & Actions>((set, get) => ({
  vault: null,
  locked: true,
  hasVault: false,
  loading: true,
  error: null,

  selectedServerId: null,
  search: '',
  activeTagFilter: null,
  sidePanel: 'servers',

  editingServer: null,
  serverFormOpen: false,
  groupFormOpen: false,
  editingGroup: null,

  tabs: [],
  activeTabId: null,
  paletteOpen: false,

  async init() {
    set({ loading: true })
    const status = await window.janus.vault.status()
    set({ hasVault: status.exists, locked: !status.unlocked, loading: false })
  },

  async createVault(password) {
    const vault = await window.janus.vault.create(password)
    set({ vault, locked: false, hasVault: true, error: null })
  },

  async unlock(password) {
    try {
      const vault = await window.janus.vault.unlock(password)
      set({ vault, locked: false, error: null })
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  async lock() {
    await window.janus.vault.lock()
    set({ vault: null, locked: true, tabs: [], activeTabId: null, selectedServerId: null })
  },

  async persist() {
    const v = get().vault
    if (v) await window.janus.vault.write(v)
  },

  async upsertServer(server) {
    const v = get().vault
    if (!v) return
    const now = Date.now()
    const idx = v.servers.findIndex((s) => s.id === server.id)
    const next = { ...server, updatedAt: now }
    const servers = idx >= 0 ? v.servers.map((s) => (s.id === server.id ? next : s)) : [...v.servers, { ...next, createdAt: now }]
    set({ vault: { ...v, servers } })
    await get().persist()
  },

  async deleteServer(id) {
    const v = get().vault
    if (!v) return
    set({
      vault: { ...v, servers: v.servers.filter((s) => s.id !== id) },
      selectedServerId: get().selectedServerId === id ? null : get().selectedServerId
    })
    await get().persist()
  },

  async duplicateServer(id) {
    const v = get().vault
    if (!v) return
    const src = v.servers.find((s) => s.id === id)
    if (!src) return
    const now = Date.now()
    const copy: ServerProfile = { ...src, id: uuid(), name: `${src.name} (kopya)`, createdAt: now, updatedAt: now }
    set({ vault: { ...v, servers: [...v.servers, copy] } })
    await get().persist()
  },

  async markConnected(id) {
    const v = get().vault
    if (!v) return
    set({ vault: { ...v, servers: v.servers.map((s) => (s.id === id ? { ...s, lastConnectedAt: Date.now() } : s)) } })
    await get().persist()
  },

  async upsertGroup(group) {
    const v = get().vault
    if (!v) return
    const idx = v.groups.findIndex((g) => g.id === group.id)
    const groups = idx >= 0 ? v.groups.map((g) => (g.id === group.id ? group : g)) : [...v.groups, group]
    set({ vault: { ...v, groups } })
    await get().persist()
  },

  async deleteGroup(id) {
    const v = get().vault
    if (!v) return
    // Move children groups & servers to root.
    const groups = v.groups.filter((g) => g.id !== id).map((g) => (g.parentId === id ? { ...g, parentId: null } : g))
    const servers = v.servers.map((s) => (s.groupId === id ? { ...s, groupId: null } : s))
    set({ vault: { ...v, groups, servers } })
    await get().persist()
  },

  async toggleGroup(id) {
    const v = get().vault
    if (!v) return
    set({ vault: { ...v, groups: v.groups.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g)) } })
    await get().persist()
  },

  async upsertSnippet(s) {
    const v = get().vault
    if (!v) return
    const idx = v.snippets.findIndex((x) => x.id === s.id)
    const snippets = idx >= 0 ? v.snippets.map((x) => (x.id === s.id ? s : x)) : [...v.snippets, s]
    set({ vault: { ...v, snippets } })
    await get().persist()
  },

  async deleteSnippet(id) {
    const v = get().vault
    if (!v) return
    set({ vault: { ...v, snippets: v.snippets.filter((s) => s.id !== id) } })
    await get().persist()
  },

  async upsertTunnel(t) {
    const v = get().vault
    if (!v) return
    const idx = v.tunnels.findIndex((x) => x.id === t.id)
    const tunnels = idx >= 0 ? v.tunnels.map((x) => (x.id === t.id ? t : x)) : [...v.tunnels, t]
    set({ vault: { ...v, tunnels } })
    await get().persist()
  },

  async deleteTunnel(id) {
    const v = get().vault
    if (!v) return
    set({ vault: { ...v, tunnels: v.tunnels.filter((t) => t.id !== id) } })
    await get().persist()
  },

  async updateSettings(patch) {
    const v = get().vault
    if (!v) return
    set({ vault: { ...v, settings: { ...v.settings, ...patch } } })
    await get().persist()
  },

  setSearch: (q) => set({ search: q }),
  setTagFilter: (t) => set({ activeTagFilter: t }),
  setSidePanel: (p) => set({ sidePanel: p }),
  selectServer: (id) => set({ selectedServerId: id }),
  openServerForm: (server) => set({ serverFormOpen: true, editingServer: server ?? null }),
  closeServerForm: () => set({ serverFormOpen: false, editingServer: null }),
  openGroupForm: (group) => set({ groupFormOpen: true, editingGroup: group ?? null }),
  closeGroupForm: () => set({ groupFormOpen: false, editingGroup: null }),

  openTerminal(serverId) {
    const v = get().vault
    const server = v?.servers.find((s) => s.id === serverId)
    if (!server) return
    const tab: Tab = { id: uuid(), kind: 'terminal', serverId, title: server.name, status: 'connecting' }
    set({ tabs: [...get().tabs, tab], activeTabId: tab.id })
    get().markConnected(serverId)
  },

  openSftp(serverId) {
    const v = get().vault
    const server = v?.servers.find((s) => s.id === serverId)
    if (!server) return
    const tab: Tab = { id: uuid(), kind: 'sftp', serverId, title: `SFTP · ${server.name}`, status: 'connecting' }
    set({ tabs: [...get().tabs, tab], activeTabId: tab.id })
  },

  closeTab(tabId) {
    const tabs = get().tabs.filter((t) => t.id !== tabId)
    let active = get().activeTabId
    if (active === tabId) active = tabs.length ? tabs[tabs.length - 1].id : null
    set({ tabs, activeTabId: active })
  },

  closeActiveTab() {
    const id = get().activeTabId
    if (id) get().closeTab(id)
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  setTabStatus: (tabId, status) =>
    set({ tabs: get().tabs.map((t) => (t.id === tabId ? { ...t, status } : t)) }),

  setPalette: (open) => set({ paletteOpen: open })
}))
