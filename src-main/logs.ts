import { shell } from 'electron'
import log from 'electron-log'

export function viewLogs(): void {
  shell.openPath(log.transports.file.findLogPath())
}
