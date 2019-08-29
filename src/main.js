const { app, globalShortcut } = require('electron');
const path = require("path");
const WindowPosition = require("electron-window-position");
const windowHelper = require("./app/window");
const TrayIcon = require("./app/tray");
const ipc = require("./core/ipc");
const AutoLaunch = require("auto-launch");
require("./core/globalconfig");

if (app.requestSingleInstanceLock()) {

    let mainWindow;
    const exe = app.getPath("exe");
    if (!exe.endsWith("electron.exe")) {
        const autolaunch = new AutoLaunch({
            name: 'Launcher',
            path: exe,
        });
        autolaunch.enable();
    }

    app.on('second-instance', (event, commandLine) => {
        if (!mainWindow) return;
        mainWindow.toogleMe(false);
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll()
    })

    app.on('ready', () => {

        // Get position for centered window
        let pos = {
            center: true
        }
        try {
            pos = new WindowPosition().getActiveScreenCenter(600,300);
        } catch (error) {
            console.log(error);
        }
        
        mainWindow = windowHelper('main', {
            ...pos,
            width: 600,
            height: 400,
            maxHeight: 400,
            show: true,
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

            try {
                if ((hide && hide !== "n") || (hide === "n" && mainWindow.getPosition()[1] > 0)) {
                    mainWindow.webContents.send('toinput', "");
                    mainWindow.setPosition(pos.x, -500);
                    mainWindow.webContents.send('hide');
                } else {
                    mainWindow.setPosition(pos.x, 30);
                    mainWindow.focus()
                    mainWindow.webContents.send('show');
                } 
            } catch (error) { }
            
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
        
        mainWindow.toggleMe(true);

        if (!ret) console.log("Shortcut:", 'registration failed');

    });

} else app.quit();