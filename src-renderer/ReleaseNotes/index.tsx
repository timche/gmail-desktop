import * as React from 'react'
import { Box, Container, Heading, Stack } from '@chakra-ui/react'
import HtmlParser from './HtmlParser'
import { AppUpdateInfo } from '../types'

interface ReleaseNotesProps {
  notes: AppUpdateInfo['releaseNotes']
}

export default function ReleaseNotes({ notes }: ReleaseNotesProps) {
  return (
    <Container>
      <Heading mb={8}>Release Notes</Heading>
      <Stack spacing={4}>
        {notes.map(({ version, note }) => (
          <Box key={version}>
            <Heading size="md" mb="2">
              v{version}
            </Heading>
            <HtmlParser html={note} />
          </Box>
        ))}
      </Stack>
    </Container>
  )
}
