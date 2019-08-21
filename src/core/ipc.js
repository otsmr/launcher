"use strict";
const { ipcMain, ipcRenderer } = require('electron');
const Handlelist = require("./handlelist");


module.exports = (app, mainWindow) => {

    const handlelist = new Handlelist();

    ipcMain.on('list-search', (event, query) => {

        event.reply("add-to-list", handlelist.search(query));
        // ipcRenderer.send("add-to-list", )
    })

    ipcMain.on('run', (event, id) => {

        handlelist.run(id);

    });

    ipcMain.on('close', (event, query) => {

        mainWindow.hide();

    });

}