import React, { useEffect, useState } from 'react'
import { action } from '@storybook/addon-actions'
import AppUpdate, { AppUpdateProps } from '.'
import { useDisclosure } from '@chakra-ui/react'

export default {
  title: 'AppUpdate'
}

const getProps = (): AppUpdateProps => ({
  status: 'available',
  version: '3.0.0',
  downloadPercent: 33,
  onDownload: action('onDownload'),
  onToggleReleaseNotes: action('onToggleReleaseNotes'),
  onDismiss: action('onDismiss'),
  onCancelDownload: action('onCancelDownload'),
  onRestart: action('onRestart'),
  onSkipVersion: action('onSkipVersion')
})

export const Available = () => {
  const { isOpen, onToggle } = useDisclosure()
  return (
    <AppUpdate
      {...getProps()}
      isReleaseNotesVisible={isOpen}
      onToggleReleaseNotes={onToggle}
    />
  )
}

export const Downloading = () => {
  const { isOpen, onToggle } = useDisclosure()
  const [downloadPercent, setDownloadPercent] = useState(0)

  useEffect(() => {
    if (downloadPercent < 100) {
      setTimeout(() => {
        setDownloadPercent(downloadPercent + 5)
      }, 1000)
    }
  }, [downloadPercent])

  return (
    <AppUpdate
      {...getProps()}
      status="downloading"
      downloadPercent={downloadPercent}
      isReleaseNotesVisible={isOpen}
      onToggleReleaseNotes={onToggle}
    />
  )
}

export const Install = () => <AppUpdate {...getProps()} status="install" />
