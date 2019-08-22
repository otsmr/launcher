"use strict";

const Module = require("../module");

class Battery extends Module {

    constructor (a, b) {
        super("quick.launcher", a, b, {
            "enabled": true,
            "config": { }
        });

        this.list = require("./lists/" + process.launcher.platform + ".json");

    }

    register () {

        this.handlelist.register({
            id: this.id,
            addToList: (query) => {
                return this.getList(query);
            }
        })

    }

    getList () {
        
        const list = [];

        for (const item of this.list) {

            list.push({
                ...item,
                icon: item.icon.replace("$imgPath", process.launcher.imgPath)
            })

        }

        return list;

    }

}

module.exports = (handlelist, mainWindow) => {

    new Battery(handlelist, mainWindow).register();

}