// From: https://github.com/sindresorhus/caprine/blob/v2.41.1/source/ensure-online.ts
import { app, dialog } from 'electron'
import isOnline from 'is-online'
import pWaitFor from 'p-wait-for'

function showWaitDialog(): void {
  const buttonIndex = dialog.showMessageBoxSync({
    message:
      'You appear to be offline. Gmail Desktop requires a working internet connection.',
    detail: 'Do you want to wait?',
    buttons: ['Wait', 'Quit'],
    defaultId: 0,
    cancelId: 1
  })

  if (buttonIndex === 1) {
    app.quit()
  }
}

export default async (): Promise<void> => {
  if (!(await isOnline())) {
    const connectivityTimeout = setTimeout(showWaitDialog, 15000)

    await pWaitFor(isOnline, { interval: 1000 })
    clearTimeout(connectivityTimeout)
  }
}
