const { Menu, Tray, shell } = require('electron');
const path = require("path");
const buildlist = require("./../buildlist");

class TrayIcon {

    constructor (app, win) {

        this.win = win;

        this.appIcon = new Tray(path.join(__dirname, "/../../assets/img/logo.png"));

        const contextMenu = Menu.buildFromTemplate([{
                label: 'Launcher öffnen',
                click: () => {
                    win.toggleMe();
                }
            },
            {
                label: 'Liste erneuern',
                click: () => {
                    buildlist();
                    win.toggleMe();
                }
            },
            { type: 'separator' },
            {
                label: 'Einstellungen',
                click: () => {
                    shell.openItem(process.launcher.appData + "/config.json")
                }
            },
            { type: 'separator' },
            {
                label: 'Laucher beenden',
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