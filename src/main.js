const { app, globalShortcut } = require('electron');
const path = require("path");
const windowHelper = require("./app/window");
const TrayIcon = require("./app/tray");
const ipc = require("./core/ipc");
const AutoLaunch = require("auto-launch");

const Positioner = require('electron-positioner');

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
        mainWindow.toggleMe(false);
    });

    app.on('will-quit', () => {
        globalShortcut.unregisterAll()
    })

    app.on('ready', () => {

        if (process.launcher.config().showWelcome) {
        
            const window = windowHelper('showWelcome', {
                width: 600,
                height: 400,
                show: true,
                vibrancy: 'dark',
                minimizable: false,
                maximizable: false,
                fullscreenable: false,
                title: 'Willkommen',
                url: path.join('file://', __dirname, '/../assets/welcome.html'),
                webPreferences: {
                    backgroundThrottling: false,
                    nodeIntegration: true
                }
            });

            window.setMenu(null);
        
        }

        mainWindow = windowHelper('main', {
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
        const positioner = new Positioner(mainWindow)
        
        ipc(app, mainWindow);
        new TrayIcon(app, mainWindow);

        mainWindow.toggleMe = (hide = "n") => {

            try {
                if ((hide && hide !== "n") || (hide === "n" && mainWindow.getPosition()[1] > 0)) {
                    mainWindow.webContents.send('toinput', "");
                    mainWindow.setPosition(0, -500);
                    mainWindow.webContents.send('hide');
                } else {
                    positioner.move("topCenter")
                    mainWindow.focus()
                    mainWindow.webContents.send('show');
                } 
            } catch (error) {
                console.log(error);
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

        mainWindow.toggleMe(true);

        if (!ret) console.log("Shortcut:", 'registration failed');

    });

} else app.quit();