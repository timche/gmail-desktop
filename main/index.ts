import { app, BrowserWindow } from 'electron'
import * as path from 'path'

async function main() {
  await app.whenReady()

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hiddenInset'
  })

  win.loadFile(path.resolve(__dirname, '..', 'static', 'index.html'))
}

main()
