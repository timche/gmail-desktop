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

          /* [Custom User Agent only] Sign-in page: Random filled sections */
          div#view_container > div > div[role='presentation'] > div[role='presentation'] > div[role='presentation'] {
            border-color: transparent !important;
          }

          /* [Custom User Agent only] Sign-in page - fix border */
          div#initialView > * {
            background-color: transparent !important;
            border-color: #776e62 !important; // Hard-coded border color
          }

          /* [Custom User Agent only] Sign-in page - add border to some buttons */
          .VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.qIypjc.TrZEUc.lw1w4b {
            border: 1px #776e62 solid !important; // Hard-coded border color
            border-radius: 8px !important;
          }

          /* [Custom User Agent only] Sign-in page - fix button borders */
          .VfPpkd-RLmnJb,
          .VfPpkd-Jh9lGc {
            background-color: transparent !important;
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
