import * as React from 'react'
import TrafficLightsSpace from './TrafficLightsSpace'
import AccountsTab from './AccountsTab'
import AddAccount from './AddAccount'
import EditAccount from './EditAccount'
import { Flex } from '@chakra-ui/react'
import {
  useAccounts,
  useAddAccount,
  useDarkMode,
  useEditAccount,
  useIsCompactHeaderEnabled
} from './hooks'
import { isMacOS } from './constants'

export default function App() {
  const { isCompactHeaderEnabled } = useIsCompactHeaderEnabled()
  const { accounts, selectAccount } = useAccounts()
  const { isAddingAccount, addAccount, cancelAddAccount } = useAddAccount()
  const {
    isEditingAccount,
    editingAccount,
    saveEditAccount,
    cancelEditAccount,
    removeAccount
  } = useEditAccount()

  useDarkMode()

  return (
    <>
      <Flex
        mb="10"
        style={{
          // @ts-expect-error: Complains that it doesn't exist, but it does.
          WebkitAppRegion: 'drag'
        }}
      >
        {isMacOS && isCompactHeaderEnabled && <TrafficLightsSpace />}
        <AccountsTab
          accounts={accounts}
          onSelectAccount={selectAccount}
          isDisabled={isAddingAccount || isEditingAccount}
        />
      </Flex>
      {isAddingAccount && (
        <AddAccount onAdd={addAccount} onCancel={cancelAddAccount} />
      )}
      {isEditingAccount && (
        <EditAccount
          account={editingAccount}
          onSave={saveEditAccount}
          onCancel={cancelEditAccount}
          onRemove={removeAccount}
        />
      )}
    </>
  )
}
