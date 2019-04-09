import { BrowserWindow, Rectangle } from 'electron'
import appConfig from 'electron-settings'

interface State {
  bounds?: Rectangle
  isFullScreen?: boolean
  isMaximized?: boolean
}

export default class WindowState {
  private _state: State

  private _stateName: string

  private _window: BrowserWindow

  public constructor(stateName: string, window: BrowserWindow) {
    this._stateName = `state.window.${stateName}`
    this._window = window

    // Set the window state from appConfig if available,
    //   otherwise use defaults
    this._state = appConfig.has(this._stateName)
      ? (appConfig.get(this._stateName) as State)
      : { isMaximized: true }

    return this
  }

  public static use(name: string, window: BrowserWindow): void {
    const windowState = new WindowState(name, window)

    // Set the window bounds from state or the defaults
    windowState._setBounds()

    // Setup the event listeners
    windowState._createListeners()
  }

  private _createListeners(): void {
    ;['resize', 'move', 'close'].forEach((event: any) => {
      this._window.on(event, this._saveState.bind(this))
    })
  }

  private _setBounds(): void {
    if (this._state.isFullScreen) {
      this._window.setFullScreen(true)
    } else if (this._state.isMaximized) {
      this._window.maximize()
    } else {
      this._window.setBounds(this._state.bounds!)
    }
  }

  private _saveState(): void {
    const isMaximized = this._window.isMaximized()
    const isFullScreen = this._window.isFullScreen()

    this._state = { isFullScreen, isMaximized }
    if (!(isMaximized || isFullScreen)) {
      this._state.bounds = this._window.getBounds()
    }

    appConfig.set(this._stateName, this._state as any)
  }
}
