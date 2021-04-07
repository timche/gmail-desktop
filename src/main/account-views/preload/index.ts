import { ipcRenderer as ipc } from 'electron'
import { ConfigKey } from '../../config'
import initDarkMode from './dark-mode'
import elementReady = require('element-ready')
import { initGmail } from './gmail'
import { initUrlPreview } from './url-preview'

initGmail()
initDarkMode()
initUrlPreview()

function attachButtonListeners(): void {
  // For windows that won't include the selectors we are expecting,
  //   don't wait for them appear as they never will
  if (!window.location.search.includes('&search=inbox')) {
    return
  }

  const selectors = [
    'lR', // Archive
    'nX' // Delete
  ]

  for (const selector of selectors) {
    const buttonReady = elementReady(`body.xE .G-atb .${selector}`)
    const readyTimeout = setTimeout(() => {
      buttonReady.stop()
    }, 10000)

    buttonReady.then((button) => {
      clearTimeout(readyTimeout)

      if (button) {
        button.addEventListener('click', () => {
          window.close()
        })
      }
    })
  }
}

window.addEventListener('load', () => {
  // Attaching the button listeners to the buttons
  //   that should close the new window
  attachButtonListeners()
})

// Toggle a custom style class when a message is received from the main process
ipc.on('set-custom-style', (_: Event, key: ConfigKey, enabled: boolean) => {
  document.body.classList[enabled ? 'add' : 'remove'](key)
})

// Toggle a full screen class when a message is received from the main process
ipc.on('set-full-screen', (_: Event, enabled: boolean) => {
  document.body.classList[enabled ? 'add' : 'remove']('full-screen')
})

function clickElement(selector: string) {
  const element = document.querySelector<HTMLDivElement>(selector)
  if (element) {
    element.click()
  }
}

ipc.on('compose', () => {
  clickElement('div[gh="cm"]')
})

ipc.on('inbox', () => {
  clickElement('#\\:3d')
})

ipc.on('snoozed', () => {
  clickElement('#\\:3f')
})

ipc.on('sent', () => {
  clickElement('#\\:3i')
})

ipc.on('all-mail', () => {
  clickElement('#\\:3l')
})

ipc.on('burger-menu-offset', (_event, offset: boolean) => {
  document.body.classList[offset ? 'add' : 'remove']('burgerMenu')
})
