import React from 'react'
import { Button, Text, Spacer, Progress, Alert, HStack } from '@chakra-ui/react'
import { AppUpdateStatus, AppUpdateInfo } from '../types'
import { TOP_ELEMENT_HEIGHT } from '../constants'

export interface AppUpdateProps {
  status: AppUpdateStatus
  updateInfo: AppUpdateInfo
  downloadPercent: number
  showReleaseNotes: boolean
  onClickDownload: () => void
  onToggleReleaseNotes: (visible: boolean) => void
  onDismiss: () => void
  onCancelDownload: () => void
  onClickRestart: () => void
}

export default function AppUpdate({
  status,
  updateInfo,
  showReleaseNotes,
  downloadPercent,
  onClickDownload,
  onToggleReleaseNotes,
  onDismiss,
  onCancelDownload,
  onClickRestart
}: AppUpdateProps) {
  const releaseNotesButton = (
    <Button
      size="xs"
      variant="ghost"
      onClick={() => {
        onToggleReleaseNotes(!showReleaseNotes)
      }}
    >
      {showReleaseNotes ? 'Hide' : 'Show'} Release Notes
    </Button>
  )

  const { version } = updateInfo
  const normalizedVersion = `(v${version})`

  const renderContent = () => {
    if (status === 'available') {
      return (
        <>
          <Text fontSize="xs">
            A new update is available {normalizedVersion}
          </Text>
          <Button
            size="xs"
            onClick={() => {
              onClickDownload()
            }}
          >
            Download Now
          </Button>
          {releaseNotesButton}
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              onDismiss()
            }}
          >
            Dismiss
          </Button>
        </>
      )
    }

    if (status === 'downloading') {
      return (
        <>
          <Text fontSize="xs">Downloading update {normalizedVersion} ...</Text>
          <Progress
            value={downloadPercent}
            size="sm"
            width="150px"
            borderRadius="150px"
          />
          <Button
            size="xs"
            onClick={() => {
              onCancelDownload()
            }}
          >
            Cancel
          </Button>
          {releaseNotesButton}
        </>
      )
    }

    if (status === 'install') {
      return (
        <>
          <Text fontSize="xs">
            A restart is required to install the update {normalizedVersion}
          </Text>
          <Spacer />
          <Button
            size="xs"
            onClick={() => {
              onClickRestart()
            }}
          >
            Restart Now
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              onDismiss()
            }}
          >
            Restart Later
          </Button>
          {releaseNotesButton}
        </>
      )
    }

    return null
  }

  return (
    <Alert height={TOP_ELEMENT_HEIGHT} justifyContent="center">
      <HStack>{renderContent()}</HStack>
    </Alert>
  )
}
