import { IpcRenderer } from 'electron'

declare global {
  interface Window {
    ipc: {
      send: IpcRenderer['send']
      invoke: IpcRenderer['invoke']
      on: (channel: string, listener: (...args: any[]) => void) => void
    }
    accounts: Account[]
  }
}

declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion: 'drag' | 'no-drag'
  }
}

export interface Account {
  id: string
  label: string
  unreadCount?: number
  selected?: boolean
}

export type UnreadCounts = Record<string, number>

export type AppUpdateStatus = 'available' | 'downloading' | 'install'

export type AppUpdateInfo = {
  version: string
  releaseNotes: Array<{ version: string; note: string | null }>
}
