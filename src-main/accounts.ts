import { globalShortcut, ipcMain } from 'electron'
import config, { ConfigKey, Account } from './config'
import { sendChannelToAllWindows } from './utils'

export function getAccounts() {
  return config.get(ConfigKey.Accounts)
}

export function getSelectedAccount() {
  const accounts = config.get(ConfigKey.Accounts)
  return accounts.find(({ selected }) => selected)
}

export function selectAccount(accountId: string) {
  const accounts = getAccounts().map((account) => ({
    ...account,
    selected: account.id === accountId
  }))
  sendChannelToAllWindows('accounts-updated', accounts)
  config.set(ConfigKey.Accounts, accounts)
}

export function editAccount(editedAccount: Account) {
  const accounts = getAccounts().map((account) =>
    account.id === editedAccount.id
      ? {
          ...account,
          ...editedAccount
        }
      : account
  )
  sendChannelToAllWindows('accounts-updated', accounts)
  config.set(ConfigKey.Accounts, accounts)
}

export function addAccount(addedAccount: Account) {
  const accounts = getAccounts()
    .map((account) => ({ ...account, selected: false }))
    .concat({ ...addedAccount, selected: true })
  sendChannelToAllWindows('accounts-updated', accounts)
  config.set(ConfigKey.Accounts, accounts)
}

export function removeAccount(accountId: string) {
  const accounts = getAccounts().filter((account) => account.id !== accountId)
  if (accounts[0]) {
    accounts[0].selected = true
  }

  sendChannelToAllWindows('accounts-updated', accounts)
  config.set(ConfigKey.Accounts, accounts)
}

function registerAccountShortcuts() {
  for (let i = 1; i <= 9; i++) {
    globalShortcut.register(`CommandOrControl+${i}`, () => {
      const account = getAccounts()[i - 1]
      if (account) {
        selectAccount(account.id)
      }
    })
  }
}

export function initAccounts() {
  ipcMain.handle('get-accounts', () => {
    return getAccounts()
  })

  ipcMain.on('select-account', (_event, accountId: string) => {
    selectAccount(accountId)
  })

  ipcMain.on('edit-account-save', (_event, account: Account) => {
    editAccount(account)
  })

  ipcMain.on('add-account', (_event, account: Account) => {
    addAccount(account)
  })

  ipcMain.on('remove-account', (_event, accountId: string) => {
    removeAccount(accountId)
  })

  registerAccountShortcuts()
}
