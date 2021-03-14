import * as React from 'react'
import TrafficLightsSpace from './TrafficLightsSpace'
import AccountsTab from './AccountsTab'
import AddAccount from './AddAccount'
import EditAccount from './EditAccount'
import { Flex } from '@chakra-ui/react'
import { useAccounts, useAddAccount, useEditAccount } from './hooks'

export default function App() {
  const { accounts, selectAccount } = useAccounts()
  const { isAddingAccount, addAccount, cancelAddAccount } = useAddAccount()
  const {
    isEditingAccount,
    editingAccount,
    saveEditAccount,
    cancelEditAccount,
    removeAccount
  } = useEditAccount()

  return (
    <>
      <Flex
        mb="10"
        style={{
          // @ts-ignore
          WebkitAppRegion: 'drag'
        }}
      >
        <TrafficLightsSpace />
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
