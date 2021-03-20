import * as React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import TrafficLightsSpace from './TrafficLightsSpace'
import AccountsTab from './AccountsTab'
import AddAccount from './AddAccount'
import EditAccount from './EditAccount'
import AppUpdate from './AppUpdate'
import {
  useAccounts,
  useAddAccount,
  useDarkMode,
  useEditAccount,
  useIsCompactHeaderEnabled,
  useAppUpdate
} from './hooks'
import { IS_MAC_OS } from './constants'

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
  const {
    updateStatus,
    updateInfo,
    updateDownloadPercent,
    downloadUpdate,
    installUpdate,
    dismissUpdate,
    cancelUpdateDownload,
    toggleReleaseNotes,
    showReleaseNotes
  } = useAppUpdate()

  useDarkMode()

  const renderContent = () => {
    if (isAddingAccount) {
      return <AddAccount onAdd={addAccount} onCancel={cancelAddAccount} />
    }

    if (isEditingAccount) {
      return (
        <EditAccount
          account={editingAccount}
          onSave={saveEditAccount}
          onCancel={cancelEditAccount}
          onRemove={removeAccount}
        />
      )
    }

    if (updateStatus) {
      return (
        <AppUpdate
          status={updateStatus}
          updateInfo={updateInfo}
          showReleaseNotes={showReleaseNotes}
          downloadPercent={updateDownloadPercent}
          onClickDownload={downloadUpdate}
          onClickRestart={installUpdate}
          onDismiss={dismissUpdate}
          onCancelDownload={cancelUpdateDownload}
          onToggleReleaseNotes={toggleReleaseNotes}
        />
      )
    }
  }

  return (
    <Flex height="100vh" flexDirection="column">
      <Flex
        style={{
          // @ts-expect-error: Complains that it doesn't exist, but it does.
          WebkitAppRegion: 'drag'
        }}
      >
        {IS_MAC_OS && isCompactHeaderEnabled && <TrafficLightsSpace />}
        <AccountsTab
          accounts={accounts}
          onSelectAccount={selectAccount}
          isDisabled={isAddingAccount || isEditingAccount || showReleaseNotes}
        />
      </Flex>
      <Box flex={1} overflowY="auto" pt={!updateStatus && 10}>
        {renderContent()}
      </Box>
    </Flex>
  )
}
