import React from 'react'
import { Box, Text, Container, Heading, Stack } from '@chakra-ui/react'
import HtmlParser from './HtmlParser'
import { AppUpdateInfo } from '../types'

interface ReleaseNotesProps {
  notes: AppUpdateInfo['releaseNotes']
}

export default function ReleaseNotes({ notes }: ReleaseNotesProps) {
  return (
    <Container>
      <Heading>Release Notes</Heading>
      <Text mb={8}>Since current version</Text>
      <Stack spacing={4}>
        {notes.map(({ version, note }) => (
          <Box key={version}>
            <Heading size="md" mb="2">
              v{version}
            </Heading>
            {note && <HtmlParser html={note} />}
          </Box>
        ))}
      </Stack>
    </Container>
  )
}
