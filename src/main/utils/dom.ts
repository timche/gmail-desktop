export const domParser = new DOMParser()

export function getContentBySelector(
  node: Document | Element,
  selector: string
) {
  return node.querySelector(selector)?.textContent ?? ''
}

export function getNumberBySelector(
  node: Document | Element,
  selector: string
) {
  const content = getContentBySelector(node, selector)
  return content ? Number(content) : 0
}

export function getDateBySelector(node: Document | Element, selector: string) {
  return new Date(getContentBySelector(node, selector)).getTime()
}
