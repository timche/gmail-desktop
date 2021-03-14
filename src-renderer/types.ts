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

export interface Account {
  id: string
  label: string
  unreadCount?: number
  selected?: boolean
}

export type UnreadCounts = Record<string, number>
