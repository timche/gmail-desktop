import * as React from 'react'
import {
  Button,
  Text,
  Spacer,
  Progress,
  Heading,
  Container,
  useColorMode,
  Alert,
  Stack,
  Box,
  Flex,
  HStack
} from '@chakra-ui/react'
import HtmlParser from './HtmlParser'
import { AppUpdateStatus, AppUpdateInfo } from '../types'

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
  const { colorMode } = useColorMode()

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

  const { version, releaseNotes } = updateInfo
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
  }

  return (
    <Flex height="100%" flexDirection="column">
      <Alert px={3} py={1} justifyContent="center">
        <HStack>{renderContent()}</HStack>
      </Alert>
      <Box py={10} flex={1} overflowY="auto">
        <Container>
          <Heading mb={8}>Release Notes</Heading>
          <Stack key={version} spacing={4}>
            {releaseNotes.map(({ version, note }) => (
              <Box>
                <Heading size="md" mb="2">
                  v{version}
                </Heading>
                <HtmlParser html={note} />
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>
    </Flex>
  )
}
