// Central registry of IPC channel names. Keeps main <-> preload <-> renderer in sync.

export const IPC = {
  // Vault lifecycle
  vaultStatus: 'vault:status',
  vaultCreate: 'vault:create',
  vaultUnlock: 'vault:unlock',
  vaultLock: 'vault:lock',
  vaultChangePassword: 'vault:change-password',
  vaultRead: 'vault:read',
  vaultWrite: 'vault:write',
  vaultExport: 'vault:export',
  vaultImport: 'vault:import',

  // SSH session lifecycle
  sshConnect: 'ssh:connect',
  sshData: 'ssh:data', // renderer -> main (keystrokes)
  sshResize: 'ssh:resize',
  sshDisconnect: 'ssh:disconnect',
  sshExec: 'ssh:exec', // run a one-off command, return output

  // SSH session events (main -> renderer, prefixed with session id)
  sshOnData: 'ssh:on-data',
  sshOnStatus: 'ssh:on-status',

  // SFTP
  sftpList: 'sftp:list',
  sftpDownload: 'sftp:download',
  sftpUpload: 'sftp:upload',
  sftpMkdir: 'sftp:mkdir',
  sftpRemove: 'sftp:remove',
  sftpRename: 'sftp:rename',
  sftpReadFile: 'sftp:read-file',
  sftpWriteFile: 'sftp:write-file',

  // Tunnels / port forwarding
  tunnelStart: 'tunnel:start',
  tunnelStop: 'tunnel:stop',
  tunnelOnStatus: 'tunnel:on-status',

  // Dialogs / misc
  dialogOpenFile: 'dialog:open-file',
  dialogSaveFile: 'dialog:save-file',
  windowMinimize: 'window:minimize',
  windowMaximize: 'window:maximize',
  windowClose: 'window:close',

  // Auto-update
  updateCheck: 'update:check',
  updateDownload: 'update:download',
  updateInstall: 'update:install',
  updateGetVersion: 'update:get-version',
  updateOnStatus: 'update:on-status'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]
