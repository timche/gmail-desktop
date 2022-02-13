import { darkTheme } from '../../../theme'
import { gmailUrl } from '../../../constants'

let urlPreviewElement: HTMLDivElement | null = null

export function initUrlPreview() {
  window.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLAnchorElement | HTMLElement

    if ('href' in target && !target.href.startsWith(gmailUrl)) {
      urlPreviewElement = document.createElement('div')
      urlPreviewElement.className = 'gmail-desktop_url-preview'
      urlPreviewElement.style.color = darkTheme.text.mediumEmphasis
      urlPreviewElement.style.background = darkTheme.bg[2]
      urlPreviewElement.textContent = target.href
      document.body.append(urlPreviewElement)
    }
  })

  window.addEventListener('mouseout', () => {
    if (urlPreviewElement) {
      urlPreviewElement.remove()
      urlPreviewElement = null
    }
  })
}
