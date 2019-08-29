"use strict";
const {BrowserWindow} = require("electron");
const Module = require("../module");
const Positioner = require('electron-positioner');

class OnTop extends Module {

    constructor (a, b) {
        super("ontop.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "top", 
                "youtubeOnlyVideo": true
            }
        });

        this.item = {
            name: "ontop: $query",
            desc: "Öffnet eine Webseite in einem Fenster immer oben",
            icon: "fa-window-restore far"
        }

    }
    
    register () {
        
        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.config.prefix,
            name: "OnTop",
            onInput: (query) => {
                this.send({
                    ...this.item,
                    name: this.item.name.replace("$query", query),
                    id: 0
                });
                return true;
            },
            onSelect: (query) => {
                this.openWindow(query);
            }
        })

    }

    openWindow (url) {
        
        if (!url.startsWith("https://")) {
            this.setInput(this.prefix + url, false);
            return this.send({
                ...this.item,
                name: "Keine gültige Webseite! Muss mit <b>https://</b> beginnen"
            });
        }

        if (this.config.youtubeOnlyVideo && url.indexOf("youtube.com") > -1) {
            url = `https://youtube.com/embed/${url.substr(url.indexOf("=") + 1, url.length)}`
        }

        this.window = new BrowserWindow({
            height: 475,
            width: 800,
            center: true,
            darkTheme: true,
            icon: process.launcher.imgPath + "logo.png",
            alwaysOnTop: true,
            title: url
        });

        const pos = new Positioner(this.window);
        pos.move("topCenter");

        const newPos = this.window.getPosition();
        this.window.setPosition(newPos[0], newPos[1] + 50);

        this.window.loadURL(url);
        this.window.removeMenu();
        this.mainWindow.toggleMe(true);        

    }
    
}

module.exports = (handlelist, mainWindow) => {
    
    new OnTop(handlelist, mainWindow).register();
    
}