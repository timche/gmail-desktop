import { ipcRenderer as ipc, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ipc', {
  send: ipc.send,
  invoke: ipc.invoke,
  on: (channel: string, listener: (...args: unknown[]) => void) => {
    ipc.on(channel, (_event, ...args) => {
      listener(...args)
    })
  }
})
