const { Menu, Tray, shell } = require('electron');
const path = require("path");

class TrayIcon {

    constructor (app, win) {

        this.win = win;

        this.appIcon = new Tray(path.join(__dirname, "/../../assets/img/logo.png"));

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Einstellungen',
                click: () => {
                    shell.openItem(process.launcher.appData + "/config.json")
                }
            },
            { type: 'separator' },
            {
                label: 'Launcher öffnen',
                click: () => {
                    win.toggleMe();
                }
            },
            {
                label: 'Launcher neu starten',
                click: () => {
                    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
                    app.exit(0)
                }
            },
            {
                label: 'Launcher beenden',
                click: () => {
                    app.quit();
                }
            },
        ])

        this.appIcon.setToolTip('Launcher')
        this.appIcon.setContextMenu(contextMenu);

        this.appIcon.on('click', () => {
            this.appIcon.popUpContextMenu();
        })

    }

}

module.exports = TrayIcon;