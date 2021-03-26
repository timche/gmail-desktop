import { ipcRenderer } from 'electron'
import * as DarkReader from 'darkreader'
import {
  darkModeBackgroundColor,
  darkModeSelectionColor
} from '../../constants'

DarkReader.setFetchMethod(window.fetch)

function enableDarkMode(): void {
  DarkReader.enable(
    {
      darkSchemeBackgroundColor: darkModeBackgroundColor,
      selectionColor: darkModeSelectionColor
    },
    {
      css: `
          /* Read email */
          .yO {
            background-color: ${darkModeBackgroundColor} !important;
          }

          /* Unread email */
          .zE {
            background-color: #1a1a1a !important;
          }

          /* Selected email */
          .x7 {
            background-color: #161d1d !important;
          }

          /* Snackbar (bottom-left) */
          .bAp.b8.UC .vh {
            background-color: #1a1a1a !important;
          }

          /* Compose */
          .z0 > .L3 {
            background-color: #1a1a1a !important;
          }
        `,
      ignoreImageAnalysis: [],
      ignoreInlineStyle: [],
      invert: [
        // Mail (e.g. Search Dropdown)
        '.gsoi_0',
        // Clock (e.g. Search Dropdown)
        '.asor',
        // Arrow (e.g. View Issue)
        '.aTn',
        // Hangouts Contacts
        '.aH3',
        // Hangouts Conversations
        '.aj2',
        // Hangouts Phone
        '.a8V'
      ]
    }
  )
}

async function initDarkMode(): Promise<void> {
  const darkMode = await ipcRenderer.invoke('init-dark-mode')

  if (darkMode.enabled) {
    if (darkMode.initLazy) {
      ipcRenderer.once('account-selected', () => {
        enableDarkMode()
      })
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        enableDarkMode()
      })
    }
  }

  ipcRenderer.on('dark-mode-updated', (_event, enabled: boolean) => {
    if (enabled) {
      enableDarkMode()
    } else {
      DarkReader.disable()
    }
  })
}

export default initDarkMode
