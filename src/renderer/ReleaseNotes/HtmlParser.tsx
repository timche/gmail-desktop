import React from 'react'
import {
  Text,
  Heading,
  UnorderedList,
  ListItem,
  Link,
  Code,
  Image,
  Kbd
} from '@chakra-ui/react'
import htmlReactParser, {
  domToReact,
  attributesToProps,
  HTMLReactParserOptions,
  Element
} from 'html-react-parser'

const htmlReactParserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element) {
      const { name, attribs, children } = domNode

      const parseDom = () => domToReact(children, htmlReactParserOptions)

      switch (name) {
        case 'h2':
          return (
            <Heading size="md" mt={4} mb={2}>
              {parseDom()}
            </Heading>
          )
        case 'p':
          return <Text mb={3}>{parseDom()}</Text>
        case 'ul':
          return (
            <UnorderedList spacing={2} my={2}>
              {parseDom()}
            </UnorderedList>
          )
        case 'li':
          return <ListItem>{parseDom()}</ListItem>
        case 'a':
          return (
            <Link {...attributesToProps(attribs)} color="blue.400">
              {parseDom()}
            </Link>
          )
        case 'tt':
          return (
            <Code fontSize="xs" color="gray.400">
              {parseDom()}
            </Code>
          )
        case 'img':
          return <Image {...attributesToProps(attribs)} />
        case 'kbd':
          return <Kbd>{parseDom()}</Kbd>
        case 'code':
          return <Code>{parseDom()}</Code>
        default:
          if (name.startsWith('h')) {
            return <Heading size="sm">{parseDom()}</Heading>
          }
      }
    }

    return null
  }
}

interface HtmlParserProps {
  html: string
}

export default function HtmlParser({ html }: HtmlParserProps) {
  return <>{htmlReactParser(html, htmlReactParserOptions)}</>
}
