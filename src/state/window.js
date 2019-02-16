const appConfig = require('electron-settings')

const defaultBounds = {
  x: undefined,
  y: undefined,
  width: 1280,
  height: 800
}

class WindowState {
  constructor(stateName, window) {
    this.stateName = `state.window.${stateName}`
    this.window = window

    console.log(appConfig.get(this.stateName))

    // Set the window state from appConfig if available,
    //   otherwise use defaults
    this.state = appConfig.has(this.stateName)
      ? appConfig.get(this.stateName)
      : defaultBounds

    return this
  }

  createListeners() {
    ;['resize', 'move', 'close'].forEach(event => {
      this.window.on(event, this.saveState.bind(this))
    })
  }

  setBounds() {
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

  saveState() {
    const isMaximized = this.window.isMaximized()
    const isFullScreen = this.window.isFullScreen()

    this.state = {
      ...(isMaximized || isFullScreen ? {} : this.window.getBounds()),
      isFullScreen,
      isMaximized
    }

    appConfig.set(this.stateName, this.state)
  }

  static use(name, window) {
    const windowState = new WindowState(name, window)

    // Set the window bounds from state or the defaults
    windowState.setBounds()

    // Setup the event listeners
    windowState.createListeners()
  }
}

module.exports = WindowState
