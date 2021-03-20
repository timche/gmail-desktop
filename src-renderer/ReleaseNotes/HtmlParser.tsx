import * as React from 'react'
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
  DOMNode
} from 'html-react-parser'
import { Element as ElementNode } from 'domhandler/lib/node'

function parseDom(nodes: DOMNode[]) {
  return domToReact(nodes, htmlReactParserOptions)
}

const htmlReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof ElementNode) {
      const { name, attribs, children } = domNode

      if (name.startsWith('h')) {
        return <Heading size="sm">{parseDom(children)}</Heading>
      }

      switch (name) {
        case 'p':
          return <Text mb={1}>{parseDom(children)}</Text>
        case 'ul':
          return <UnorderedList>{parseDom(children)}</UnorderedList>
        case 'li':
          return <ListItem>{parseDom(children)}</ListItem>
        case 'a':
          return (
            <Link {...attributesToProps(attribs)} color="blue.400">
              {parseDom(children)}
            </Link>
          )
        case 'tt':
          return <Code fontSize="xs">{parseDom(children)}</Code>
        case 'img':
          return <Image {...attributesToProps(attribs)} />
        case 'kbd':
          return <Kbd>{parseDom(children)}</Kbd>
        case 'code':
          return <Code>{parseDom(children)}</Code>
        default:
      }
    }
  }
}

interface HtmlParserProps {
  html: string
}

export default function HtmlParser({ html }: HtmlParserProps) {
  return <>{htmlReactParser(html, htmlReactParserOptions)}</>
}
