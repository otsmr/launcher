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
        this.item = {
            name: "Programmliste aktualisieren",
            desc: "Liste der Programme aktualisieren",
            icon: process.launcher.imgPath + "windows/application.png"
        }
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
            ...this.item,
            exact: "update",
            id: 99999,
            onSelect: () => {
                this.setLoader(true);
                this.crawler(this.home, true)
                this.setLoader(false);
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