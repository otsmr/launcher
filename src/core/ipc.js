"use strict";
const { ipcMain, ipcRenderer } = require('electron');
const handlelist = require("./handlelist");
const { shell } = require("electron");


module.exports = (app, mainWindow) => {

    const list = handlelist(mainWindow);

    ipcMain.on('list-search', (event, query) => {
        list.search(query);
    })

    ipcMain.on('run', (event, id, input) => {

        list.run(id, input);

    });

    ipcMain.on('close', (event, query) => {

        mainWindow.toggleMe(true);

    });

    ipcMain.on('openSettings', (event, query) => {
        shell.openItem(process.launcher.appData + "/config.json");
    });

}