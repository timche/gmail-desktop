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
        '.aEe, .aEc.aHS-bnr .qj',
        // Input tool - most icons
        '[class*="ita-icon-"]',
        // Input tool - settings menu bar icons
        'body > div[id*="ita-"] > div:nth-child(1) > div:last-child > span:empty',
        // Input tool - virtual keyboard top right icons
        '#kbd > div:nth-child(1) > div:nth-child(2) div:empty',
        // Input tool - virtual keyboard button icons
        '#kbd > div:nth-child(2) span:empty',
        // Input tool - menu up/down and left/right icons
        'body > div[id*="ita-"] > div:nth-child(2) > div > div:nth-child(2) > div > a span:empty',
        'body > div[id*="ita-"] > div:nth-child(2) > div > div:nth-child(3) > div > a span:empty',
        // Input tool - handwriting panel drag handle
        'div[tabindex="-1"][style*="left:"][style*="top:"][style*="user-select: none"].notranslate > div:nth-child(5):empty'
      ],
      disableStyleSheetsProxy: false
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
