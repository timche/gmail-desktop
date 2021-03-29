import React, { ComponentProps } from 'react'
import {
  Button as ChakraButton,
  Text,
  Spacer,
  Progress,
  Alert,
  HStack
} from '@chakra-ui/react'
import { AppUpdateStatus } from '../../types'
import { topElementHeight } from '../../constants'
import { appRegionNoDragStyle } from '../helpers'

function Button({
  onClick,
  ...props
}: ComponentProps<typeof ChakraButton> & { onClick: () => void }) {
  return (
    <ChakraButton
      size="xs"
      variant="ghost"
      onClick={() => {
        if (onClick) {
          onClick()
        }
      }}
      _focus={{
        outline: 'none'
      }}
      style={appRegionNoDragStyle}
      {...props}
    />
  )
}

export interface AppUpdateProps {
  status: AppUpdateStatus
  version: string
  downloadPercent: number
  isReleaseNotesVisible?: boolean
  onDownload: () => void
  onToggleReleaseNotes: (visible: boolean) => void
  onDismiss: () => void
  onSkipVersion: (version: string) => void
  onCancelDownload: () => void
  onRestart: () => void
}

export default function AppUpdate({
  status,
  version,
  isReleaseNotesVisible,
  downloadPercent,
  onDownload,
  onToggleReleaseNotes,
  onDismiss,
  onSkipVersion,
  onCancelDownload,
  onRestart
}: AppUpdateProps) {
  const releaseNotesButton = (
    <Button
      onClick={() => {
        onToggleReleaseNotes(!isReleaseNotesVisible)
      }}
    >
      {isReleaseNotesVisible ? 'Hide' : 'Show'} Release Notes
    </Button>
  )

  const normalizedVersion = `(v${version})`

  const renderContent = () => {
    if (status === 'available') {
      return (
        <>
          <Text fontSize="xs">An update is available {normalizedVersion}</Text>
          <Button
            variant="solid"
            onClick={() => {
              onDownload()
            }}
          >
            Download Now
          </Button>
          {releaseNotesButton}
          <Button
            onClick={() => {
              onSkipVersion(version)
            }}
          >
            Skip This Version
          </Button>
          <Button onClick={onDismiss}>Remind Me Later</Button>
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
          <Button onClick={onCancelDownload}>Cancel</Button>
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
          <Button variant="solid" onClick={onRestart}>
            Restart Now
          </Button>
          <Button onClick={onDismiss}>Restart Later</Button>
          {releaseNotesButton}
        </>
      )
    }

    return null
  }

  return (
    <Alert height={`${topElementHeight}px`} justifyContent="center">
      <HStack>{renderContent()}</HStack>
    </Alert>
  )
}
