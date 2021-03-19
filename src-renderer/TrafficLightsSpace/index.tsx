import * as React from 'react'
import { useColorMode, Box } from '@chakra-ui/react'
import { TOP_BAR_HEIGHT } from '../constants'

function TrafficLightsSpace() {
  const { colorMode } = useColorMode()

  return (
    <Box
      width="80px"
      height={TOP_BAR_HEIGHT}
      borderBottomWidth="1px"
      borderBottomColor={colorMode === 'light' ? 'gray.200' : 'whiteAlpha.300'}
    />
  )
}

export default TrafficLightsSpace
