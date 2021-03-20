import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import TrafficLightsSpace from './TrafficLightsSpace'
import AccountsTab from './AccountsTab'
import AddAccount from './AddAccount'
import EditAccount from './EditAccount'
import AppUpdate from './AppUpdate'
import ReleaseNotes from './ReleaseNotes'
import {
  useAccounts,
  useAddAccount,
  useDarkMode,
  useEditAccount,
  useAppUpdate
} from './hooks'
import { IS_MAC_OS } from './constants'

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

  const appRegionStyle: React.CSSProperties | undefined = IS_MAC_OS
    ? {
        WebkitAppRegion: 'drag',
        WebkitUserSelect: 'none'
      }
    : undefined

  const renderBanner = () => {
    let banner: JSX.Element | undefined

    if (updateStatus && updateInfo) {
      banner = (
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

    if (banner) {
      return <Box style={appRegionStyle}>{banner}</Box>
    }

    return null
  }

  const renderContent = () => {
    if (isAddingAccount) {
      return <AddAccount onAdd={addAccount} onCancel={cancelAddAccount} />
    }

    if (isEditingAccount && editingAccount) {
      return (
        <EditAccount
          account={editingAccount}
          onSave={saveEditAccount}
          onCancel={cancelEditAccount}
          onRemove={removeAccount}
        />
      )
    }

    if (showReleaseNotes && updateInfo) {
      return <ReleaseNotes notes={updateInfo.releaseNotes} />
    }

    return null
  }

  return (
    <Flex height="100vh" flexDirection="column">
      {renderBanner()}
      <AccountsTab
        accounts={accounts}
        onSelectAccount={selectAccount}
        isDisabled={isAddingAccount || isEditingAccount || showReleaseNotes}
        style={appRegionStyle}
      >
        {!updateStatus && <TrafficLightsSpace />}
      </AccountsTab>
      <Box flex={1} py={8} overflowY="auto">
        {renderContent()}
      </Box>
    </Flex>
  )
}
