import { BrowserWindow } from 'electron'
import * as appConfig from 'electron-settings'

interface State {
  height?: number
  isFullScreen?: boolean
  isMaximized?: boolean
  width?: number
  x?: number
  y?: number
}

export default class WindowState {
  private state: State
  private stateName: string
  private window: BrowserWindow

  public constructor(stateName: string, window: BrowserWindow) {
    this.stateName = `state.window.${stateName}`
    this.window = window

    // Set the window state from appConfig if available,
    //   otherwise use defaults
    this.state = appConfig.has(this.stateName)
      ? (appConfig.get(this.stateName) as State)
      : { isMaximized: true }

    return this
  }

  private createListeners(): void {
    ;['resize', 'move', 'close'].forEach((event: any) => {
      this.window.on(event, this.saveState.bind(this))
    })
  }

  private setBounds(): void {
    if (this.state.isFullScreen) {
      this.window.setFullScreen(true)
    } else if (this.state.isMaximized) {
      this.window.maximize()
    } else {
      this.window.setBounds({
        x: this.state.x,
        y: this.state.y,
        width: this.state.width,
        height: this.state.height
      })
    }
  }

  private saveState(): void {
    const isMaximized = this.window.isMaximized()
    const isFullScreen = this.window.isFullScreen()

    this.state = {
      ...(isMaximized || isFullScreen ? {} : this.window.getBounds()),
      isFullScreen,
      isMaximized
    }

    appConfig.set(this.stateName, this.state as any)
  }

  public static use(name: string, window: BrowserWindow): void {
    const windowState = new WindowState(name, window)

    // Set the window bounds from state or the defaults
    windowState.setBounds()

    // Setup the event listeners
    windowState.createListeners()
  }
}
