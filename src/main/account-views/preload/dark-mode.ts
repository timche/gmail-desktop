import { ipcRenderer } from 'electron'
import * as DarkReader from 'darkreader'
import { darkTheme } from '../../../theme'

DarkReader.setFetchMethod(window.fetch)

function enableDarkMode(): void {
  DarkReader.enable(
    {
      darkSchemeBackgroundColor: darkTheme.bg[0],
      selectionColor: darkTheme.selection
    },
    {
      css: `
          /* Read email */
          .yO {
            background-color: ${darkTheme.bg[0]} !important;
          }

          /* Unread email */
          .zE {
            background-color: ${darkTheme.bg[1]} !important;
          }

          /* Selected email */
          .x7 {
            background-color: ${darkTheme.bg[2]} !important;
          }

          /* Snackbar (bottom-left) */
          .bAp.b8.UC .vh {
            background-color: ${darkTheme.bg[1]} !important;
          }

          /* Compose */
          .z0 > .L3 {
            background-color: ${darkTheme.bg[1]} !important;
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
        '.a8V',
        // Labels
        '.aEe, .aEc.aHS-bnr .qj'
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
