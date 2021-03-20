import { IpcRenderer } from 'electron'

declare global {
  interface Window {
    ipc: {
      send: IpcRenderer['send']
      invoke: IpcRenderer['invoke']
      on: (channel: string, listener: (...args: any[]) => void) => void
    }
  }
}
