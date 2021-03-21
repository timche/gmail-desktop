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
  useAppUpdate,
  useTitleBar
} from './hooks'
import TitleBar from './TitleBar'
import { appRegionDragStyle } from './helpers'

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
    isReleaseNotesVisible,
    skipUpdateVersion
  } = useAppUpdate()
  const {
    isTitleBarEnabled,
    isWindowMaximized,
    openAppMenu,
    minimzeWindow,
    maximizeWindow,
    unmaximizeWindow,
    closeWindow
  } = useTitleBar()

  useDarkMode()

  const renderBanner = () => {
    let banner: JSX.Element | undefined

    if (updateStatus && updateInfo) {
      banner = (
        <AppUpdate
          status={updateStatus}
          version={updateInfo.version}
          isReleaseNotesVisible={isReleaseNotesVisible}
          downloadPercent={updateDownloadPercent}
          onDownload={downloadUpdate}
          onRestart={installUpdate}
          onDismiss={dismissUpdate}
          onCancelDownload={cancelUpdateDownload}
          onToggleReleaseNotes={toggleReleaseNotes}
          onSkipVersion={skipUpdateVersion}
        />
      )
    }

    if (banner) {
      return (
        <Box style={isTitleBarEnabled ? undefined : appRegionDragStyle}>
          {banner}
        </Box>
      )
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

    if (isReleaseNotesVisible && updateInfo) {
      return <ReleaseNotes notes={updateInfo.releaseNotes} />
    }

    return null
  }

  return (
    <Flex height="100vh" flexDirection="column">
      {isTitleBarEnabled && (
        <TitleBar
          isMaximized={isWindowMaximized}
          onClickMenu={openAppMenu}
          onMinimze={minimzeWindow}
          onMaximize={maximizeWindow}
          onUnmaximize={unmaximizeWindow}
          onClose={closeWindow}
        />
      )}
      {renderBanner()}
      <AccountsTab
        accounts={accounts}
        onSelectAccount={selectAccount}
        isDisabled={
          isAddingAccount || isEditingAccount || isReleaseNotesVisible
        }
        style={isTitleBarEnabled ? undefined : appRegionDragStyle}
      >
        {!updateStatus && <TrafficLightsSpace />}
      </AccountsTab>
      <Box flex={1} py={8} overflowY="auto">
        {renderContent()}
      </Box>
    </Flex>
  )
}
