// Shared domain types used by both the main and renderer processes.

export type AuthMethod = 'password' | 'key' | 'agent'

/** A saved server connection profile. */
export interface ServerProfile {
  id: string
  name: string
  host: string
  port: number
  username: string
  authMethod: AuthMethod
  /** Plaintext only ever lives in the decrypted vault in memory / on disk encrypted. */
  password?: string
  /** Private key contents (PEM). Stored encrypted in the vault. */
  privateKey?: string
  passphrase?: string
  groupId: string | null
  tags: string[]
  color?: string
  /** Free-form notes (markdown-ish). */
  notes?: string
  /** Optional jump host (bastion) server id for ProxyJump-style chaining. */
  jumpHostId?: string | null
  /** Keepalive interval in seconds (0 = off). */
  keepaliveInterval?: number
  createdAt: number
  updatedAt: number
  lastConnectedAt?: number
}

/** A group/folder for organizing servers (supports nesting via parentId). */
export interface Group {
  id: string
  name: string
  parentId: string | null
  color?: string
  collapsed?: boolean
  order: number
}

/** A reusable command snippet. */
export interface Snippet {
  id: string
  name: string
  command: string
  description?: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

/** Port forwarding rule. */
export type TunnelType = 'local' | 'remote' | 'dynamic'

export interface TunnelRule {
  id: string
  serverId: string
  name: string
  type: TunnelType
  // local: localPort -> remoteHost:remotePort over server
  // remote: remotePort on server -> localHost:localPort
  // dynamic: SOCKS proxy on localPort
  localHost: string
  localPort: number
  remoteHost: string
  remotePort: number
  autoStart?: boolean
}

export interface AppSettings {
  theme: 'dark' | 'midnight' | 'light'
  fontFamily: string
  fontSize: number
  cursorStyle: 'block' | 'underline' | 'bar'
  cursorBlink: boolean
  scrollback: number
  lockAfterMinutes: number // auto-lock idle vault, 0 = never
  copyOnSelect: boolean
}

/** The full decrypted vault — this is what gets serialized into the single encrypted file. */
export interface Vault {
  version: number
  servers: ServerProfile[]
  groups: Group[]
  snippets: Snippet[]
  tunnels: TunnelRule[]
  settings: AppSettings
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontFamily: 'JetBrains Mono, SFMono-Regular, Menlo, monospace',
  fontSize: 13,
  cursorStyle: 'bar',
  cursorBlink: true,
  scrollback: 10000,
  lockAfterMinutes: 0,
  copyOnSelect: true
}

export function emptyVault(): Vault {
  return {
    version: 1,
    servers: [],
    groups: [],
    snippets: [],
    tunnels: [],
    settings: { ...DEFAULT_SETTINGS }
  }
}

// ---- Runtime (non-persisted) session state shared over IPC ----

export type SessionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface VaultStatus {
  exists: boolean // a vault file is present on disk
  unlocked: boolean // currently decrypted in memory
  path: string
}

// ---- SFTP ----

export interface SftpEntry {
  name: string
  path: string
  type: 'file' | 'directory' | 'symlink' | 'other'
  size: number
  mtime: number
  mode: number
  owner: number
  group: number
}

// ---- Auto-update ----

export type UpdatePhase =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateStatus {
  phase: UpdatePhase
  version?: string
  releaseNotes?: string
  percent?: number
  error?: string
}

// ---- IPC channel result envelope ----

export interface IpcResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}
