import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import TrafficLightsSpace from './TrafficLightsSpace'
import AccountsTab from './AccountsTab'
import AddAccount from './AddAccount'
import EditAccount from './EditAccount'
import AppUpdate from './AppUpdate'
import ReleaseNotes from './ReleaseNotes'
import { useAccounts, useDarkMode, useAppUpdate, useTitleBar } from './hooks'
import TitleBar from './TitleBar'
import { appRegionDragStyle } from './helpers'
import Accounts from './Accounts'

export default function App() {
  const {
    accounts,
    selectAccount,
    isEditingAccounts,
    closeEditAccounts,
    editAccountById,
    isEditingAccount,
    editAccount,
    cancelEditAccount,
    saveEditAccount,
    removeAccount,
    isAddingAccount,
    addAccount,
    cancelAddAccount,
    saveAddAccount
  } = useAccounts()

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
      return <AddAccount onAdd={saveAddAccount} onCancel={cancelAddAccount} />
    }

    if (editAccount) {
      return (
        <EditAccount
          account={editAccount}
          onSave={saveEditAccount}
          onCancel={cancelEditAccount}
          onRemove={removeAccount}
        />
      )
    }

    if (isEditingAccounts) {
      return (
        <Accounts
          accounts={accounts}
          onEdit={editAccountById}
          onRemove={removeAccount}
          onAdd={addAccount}
          onClose={closeEditAccounts}
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
          isEditingAccounts ||
          isEditingAccount ||
          isAddingAccount ||
          isReleaseNotesVisible
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
