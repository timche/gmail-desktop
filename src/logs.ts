import { shell } from 'electron'
import log from 'electron-log'

export function viewLogs(): void {
  shell.openItem(log.transports.file.findLogPath())
}
