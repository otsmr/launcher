"use strict";
const fs = require("fs");
const Module = require("../module");

class Programms extends Module {

    constructor (a, b, home) {
        super("programms.launcher", a, b, {
            "enabled": true,
            "config": { }
        });

        this.home = home;
        this.crawler = require("./crawler/" + process.launcher.platform + ".js");

    }

    register () {

        this.handlelist.register({
            id: this.id,
            addToList: () => {
                return this.getList();
            }
        })

    }

    getList () {

        const list = this.crawler(this.home);

        list.push({
            name: "Programmliste aktualisieren",
            desc: "Liste der Programme aktualisieren",
            icon: process.launcher.imgPath + "windows/application.png",
            exact: "-update",
            id: 99999,
            onSelect: () => {
                this.mainWindow.toggleMe(true);
                this.crawler(this.home, true)
                this.mainWindow.toggleMe(false);
            }
        });
        return list;

    }

}

module.exports = (handlelist, mainWindow) => {

    const home = process.launcher.modulePathData + "/programms.launcher/";

    if (!fs.existsSync(home)) {
        fs.mkdirSync(home);
        fs.mkdirSync(home + "/icons/");
    }

    new Programms(handlelist, mainWindow, home).register();

}