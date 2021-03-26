import React from 'react'
import { Box } from '@chakra-ui/react'
import { IS_MAC_OS } from '../constants'

function TrafficLightsSpace() {
  if (IS_MAC_OS) {
    return <Box width="80px" />
  }

  return null
}

export default TrafficLightsSpace
