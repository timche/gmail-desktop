import * as React from 'react'
import { useColorMode, Box } from '@chakra-ui/react'
import { accountTabsHeight } from '../constants'

function TrafficLightsSpace() {
  const { colorMode } = useColorMode()

  return (
    <Box
      width="80px"
      height={accountTabsHeight}
      borderBottomWidth="1px"
      borderBottomColor={colorMode === 'light' ? 'gray.200' : 'whiteAlpha.300'}
    />
  )
}

export default TrafficLightsSpace
