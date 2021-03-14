import { app, dialog } from 'electron'
import pWaitFor from 'p-wait-for'
import got from 'got'

async function isOnline() {
  try {
    await got('https://mail.google.com', {
      timeout: 5000
    })
    return true
  } catch {
    return false
  }
}

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

export default async function ensureOnline(): Promise<void> {
  if (!(await isOnline())) {
    const connectivityTimeout = setTimeout(showWaitDialog, 15000)

    await pWaitFor(isOnline, { interval: 1000 })
    clearTimeout(connectivityTimeout)
  }
}
