import { BrowserView } from 'electron'
import electronContextMenu = require('electron-context-menu')

export function addContextMenu(accountView: BrowserView) {
  accountView.webContents.on('did-finish-load', () => {
    electronContextMenu({
      window: accountView,
      showCopyImageAddress: true,
      showSaveImageAs: true,
      showInspectElement: false,
      append: (_defaultActions, parameters) => [
        {
          label: 'Inspect Element',
          click() {
            accountView.webContents.inspectElement(parameters.x, parameters.y)
            if (accountView.webContents.isDevToolsOpened()) {
              accountView.webContents.devToolsWebContents?.focus()
            }
          }
        }
      ]
    })
  })
}
