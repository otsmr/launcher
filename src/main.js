const { app, globalShortcut } = require('electron');
const path = require("path");
const WindowPosition = require("electron-window-position");
const windowHelper = require("./app/window");
const TrayIcon = require("./app/tray");
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
            show: true,
            // show: false,
            frame: false,
            resizable: true,
            transparent: true,
            vibrancy: 'dark',
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

        mainWindow.toggleMe = (hide = "n") => {

            if ((hide && hide !== "n") || (hide === "n" && mainWindow.getPosition()[1] > 0)) {
                mainWindow.webContents.send('toinput', "");
                mainWindow.setPosition(pos.x, -500);
                mainWindow.webContents.send('hide');
            } else {
                mainWindow.setPosition(pos.x, 30);
                mainWindow.focus()
                mainWindow.webContents.send('show');
            }
        }

        let hotkey = false;
        try {
            hotkey = process.launcher.config().hotkey;
        } catch (error) { }
        if (!hotkey) {
            hotkey = "alt+space";
            process.launcher.config().hotkey = hotkey;
            process.launcher.config(true);
        }
        
        const ret = globalShortcut.register(hotkey, () => {
            mainWindow.toggleMe();
        });

        if (!ret) console.log("Shortcut:", 'registration failed');

    });

} else app.quit();