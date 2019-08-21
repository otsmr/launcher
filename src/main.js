const { app, globalShortcut } = require('electron');
const WindowPosition = require("electron-window-position");
const windowHelper = require("./core/window");
const path = require("path");
const TrayIcon = require("./core/tray");
const ipc = require("./core/ipc");
const AutoLaunch = require("auto-launch");
require("./core/globalconfig");

if (app.requestSingleInstanceLock()) {

    const exe = app.getPath("exe");
    if (!exe.endsWith("electron.exe")) {
        const autolaunch = new AutoLaunch({
            name: 'Launcher',
            path: exe,
        });
        autolaunch.enable();
    }


    app.on('second-instance', (event, commandLine) => {
        if (!window) return;
        if (window.isMinimized()) window.restore();
        window.focus();
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll()
    })

    app.on('ready', () => {

        // Get position for centered window
        var position = new WindowPosition();
        var pos = position.getActiveScreenCenter(600,300);
        
        const mainWindow = windowHelper('main', {
            x: pos.x,
            y: 30,
            width: 600,
            height: 400,
            maxHeight: 400,
            show: false,
            frame: false,
            resizable: true,
            transparent: true,
            vibrancy: 'light',
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            fullscreenable: false,
            title: 'Launcher',
            autoResize: true,
            hasShadow:false,
            url: path.join('file://', __dirname, '/../assets/index.html'),
            webPreferences: {
                backgroundThrottling: false,
                nodeIntegration: true
            }
        });
        
        ipc(app, mainWindow);
        new TrayIcon(app, mainWindow);

        // mainWindow.webContents.toggleDevTools({ mode: 'undocked' })

        mainWindow.toggleMe = () => {
            if (mainWindow.isVisible()) {
                mainWindow.hide()
            } else {
                mainWindow.show()
                mainWindow.focus()
                mainWindow.webContents.send('focued');
            }
        }
        const ret = globalShortcut.register('alt+space', () => {
            mainWindow.toggleMe();
        });

        if (!ret) console.log("Shortcut:", 'registration failed');

    });

} else app.quit();