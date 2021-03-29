import React from 'react'
import { Box } from '@chakra-ui/react'
import { isMacOS } from '../helpers'

function TrafficLightsSpace() {
  if (isMacOS) {
    return <Box width="80px" />
  }

  return null
}

export default TrafficLightsSpace
