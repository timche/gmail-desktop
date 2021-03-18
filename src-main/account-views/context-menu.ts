import { BrowserView } from 'electron'
import electronContextMenu = require('electron-context-menu')

export function addContextMenu(accountView: BrowserView) {
  accountView.webContents.on('did-finish-load', () => {
    electronContextMenu({
      window: accountView,
      showCopyImageAddress: true,
      showSaveImageAs: true,
      showInspectElement: false
    })
  })
}
