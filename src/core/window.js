const electron = require('electron')
const { BrowserWindow } = process.type === 'renderer' ? electron.remote : electron

const autoResize = (dynamicWindow) => {

    const defaultSize = {
        width: dynamicWindow.getSize()[0],
        height: dynamicWindow.getSize()[1],
    }

    let currentHeight = defaultSize.height
    const resize = (height) => {
        if (height !== currentHeight) {
            currentHeight = height
            height += 50;
            dynamicWindow.setSize(defaultSize.width, height);
        }
    }

    const updateHeight = () => {
        if (!dynamicWindow) return;
        dynamicWindow.webContents.executeJavaScript('document.body.children[0].offsetHeight', (mainContentHeight) => {
            resize(parseInt(mainContentHeight))
        })
    }

    let updateHeightIntervalId = null
    const clearUpdateHeightInterval = () => {
        if (updateHeightIntervalId) {
            clearInterval(updateHeightIntervalId)
            updateHeightIntervalId = null
        }
    }

    const registerUpdateHeightInterval = () => {
        clearUpdateHeightInterval()
        if (dynamicWindow.isVisible()) {
            updateHeight()
            updateHeightIntervalId = setInterval(updateHeight, 125)
        }
    }

    dynamicWindow.webContents.on('did-finish-load', () => {
        dynamicWindow.on('closed', clearUpdateHeightInterval)
        dynamicWindow.on('hide', clearUpdateHeightInterval)
        dynamicWindow.on('show', () => {
            registerUpdateHeightInterval()
        })
        registerUpdateHeightInterval()
    });

}

const namedWindows = {}

module.exports = (name, options) => {
    if (namedWindows[name]) {
        namedWindows[name].focus()
        return namedWindows[name]
    }

    namedWindows[name] = new BrowserWindow(options)
    if (options.autoResize) {
        autoResize(namedWindows[name])
    }

    namedWindows[name].on('closed', () => {
        namedWindows[name] = null
    })

    namedWindows[name].loadURL(options.url)

    return namedWindows[name]
}