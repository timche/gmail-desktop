const { app, dialog } = require('electron')
const { is } = require('electron-util')
const appConfig = require('electron-settings')
const electronDebug = require('electron-debug')

const CONFIG_KEY = 'debug-mode'
const OPTIONS = {
  showDevTools: false
}

function showRestartDialog(enabled) {
  const state = enabled ? 'enable' : 'disable'

  dialog.showMessageBox(
    {
      type: 'info',
      buttons: ['Restart', 'Cancel'],
      message: 'Restart required',
      detail: `To ${state} debug mode, please restart Gmail Desktop`
    },
    response => {
      // If restart was clicked (index of 0), restart the app
      if (response === 0) {
        app.relaunch()
        app.quit()
      }
    }
  )
}

function init() {
  let enabled = appConfig.get(CONFIG_KEY)

  // If the environment is development and debug-mode hasn't been set,
  //   default debug mode to enabled
  if (is.development && enabled === null) {
    enabled = true
  }

  electronDebug({ ...OPTIONS, enabled })
}

module.exports = {
  CONFIG_KEY,
  init,
  showRestartDialog
}
