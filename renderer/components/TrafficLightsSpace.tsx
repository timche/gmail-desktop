import * as React from 'react'
import { useColorMode, Box } from '@chakra-ui/react'
import { tabsHeight } from '../constants'

function TrafficLightsSpace() {
  const { colorMode } = useColorMode()

  return (
    <Box
      width="80px"
      height={tabsHeight}
      borderBottomWidth="1px"
      borderBottomColor={colorMode === 'light' ? 'gray.200' : 'whiteAlpha.300'}
    />
  )
}

export default TrafficLightsSpace
