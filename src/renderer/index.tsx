import React from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme'
import App from './App'

createRoot(document.querySelector('#root')!).render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
)
