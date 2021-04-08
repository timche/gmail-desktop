import React from 'react'
import { Box, Text, Container, Heading, Stack, Link } from '@chakra-ui/react'
import HtmlParser from './HtmlParser'
import { AppUpdateInfo } from '../../types'

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
            <Heading size="lg" mb="2">
              <Link
                href={`https://github.com/timche/gmail-desktop/releases/tag/v${version}`}
              >
                v{version}
              </Link>
            </Heading>
            {note && <HtmlParser html={note} />}
          </Box>
        ))}
      </Stack>
    </Container>
  )
}
