import { ChakraProvider, useColorMode } from '@chakra-ui/react'
import { useEffect } from 'react'
import theme from '../src-renderer/theme'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' }
}

export const globalTypes = {
  colorMode: {
    name: 'Color Mode',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark']
    }
  }
}

const ColorMode = ({ colorMode }) => {
  const { setColorMode } = useColorMode()
  useEffect(() => {
    setColorMode(colorMode)
  }, [colorMode])
  return null
}

const withChakra = (Story, context) => {
  const { colorMode } = context.globals
  return (
    <ChakraProvider theme={theme}>
      <ColorMode colorMode={colorMode} />
      <Story />
    </ChakraProvider>
  )
}

export const decorators = [withChakra]
