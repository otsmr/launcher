"use strict";

module.exports = class {

    constructor (id, handlelist, mainWindow, defaultConfig) {

        this.id = id;
        this.handlelist = handlelist;
        this.mainWindow = mainWindow;
        this._sendCount = 0; // BugFix, wenn zu das Internet zu langsam ist 
        this._inputCount = 0;

        try {
            this.config = process.launcher.config().module[this.id].config;
        } catch (error) {
            process.launcher.config().module[this.id] = defaultConfig;
            process.launcher.config(true);
            this.config = process.launcher.config().module[this.id].config;
        }

        if (this.config.prefix) this.prefix = this.config.prefix;

    }

    send (list = [], sendID = -1) {
        if (sendID > -1) {
            if (sendID !== this.handlelist._lastSendID) {
                return console.log("returned because", sendID, this.handlelist._lastSendID);
            }
        }

        if (list.length === undefined) {
            list = [list];
        }

        this.handlelist.json = list;
        this.mainWindow.webContents.send("add-to-list", list);

    }

    setInput (data, search = true) {
        this.mainWindow.webContents.send("toinput", data, search);
    }

}