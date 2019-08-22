"use strict";
const { ipcMain, ipcRenderer } = require('electron');
const handlelist = require("./handlelist");


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

}