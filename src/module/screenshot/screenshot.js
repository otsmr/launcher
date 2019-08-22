"use strict";
const screenshot = require('desktop-screenshot');
const path = require("path");
const Module = require("../module")

class Battery extends Module{

    constructor (a, b) {
        super("screenshot.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "shot"
            }
        });

        this.item = {
            name: "Screenshot",
            desc: "Erstellt ein Screenshot (Speicherort: Desktop)",
            icon: process.launcher.imgPath + "/screenshot.png",
            icontyp: "file"
        }
        
    }

    register () {

        this.handlelist.register({
            prefix: this.prefix,
            noEnter: true,
            onInput: (name) => {
                return this.display(name);
            },
            onSelect: (name) => {
                this.make(name)
            }
        })

    }

    display (name) {

        if (name[0] === " ") name = name.substr(1)

        if (name === "") name = "screenshot.png";
        else if (!name.endsWith(".png")) name += ".png";

        this.send([{
            ...this.item,
            name: "Screenshot: " + name,
            id: 0
        }]);
        return true;
    }

    make (name) {
        name = name.replace(this.prefix, "")
        if (name[0] === " ") name = name.substr(1)
        if (name === "") name = "screenshot.png";
        else if (!name.endsWith(".png")) name += ".png";
        const file = path.join(process.launcher.desktopPath, name);
        this.mainWindow.toggleMe(true);
        screenshot(file, (error, complete) => {
            this.mainWindow.toggleMe(false);
            if (!error) this.mainWindow.webContents.send("toinput", "=" + file)
        });
        
    }

}

module.exports = (handlelist, mainWindow) => {

    new Battery(handlelist, mainWindow).register();

}