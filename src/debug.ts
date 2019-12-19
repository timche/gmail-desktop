import electronDebug = require('electron-debug')

const OPTIONS = {
  showDevTools: false,
  isEnabled: true
}

export function init(): void {
  electronDebug(OPTIONS)
}
