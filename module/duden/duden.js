"use strict";
const duden = require("./crawler");

const Module = require("../module");

class Duden extends Module {

    constructor (a, b) {
        super("duden.dudende", a, b, {
            "enabled": true,
            "config": {
                "prefix": "duden "
            }
        })

        this.item = {
            name: "Duden",
            desc: "Duden.de durchsuchen",
            icontyp: "file",
            icon: process.launcher.imgPath + "duden.png",
        }

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            noEnter: true,
            onInput: (q) => {
                return this.display(q);
            }, 
            onSelect: (q, item) => {
                this.showResult(q, item);
            }
        })

    }

    display (query) {

        if (query.length < 2) {
            this.send(this.item);
            return true;
        }

        duden.search(query, (json) => {

            let list = [];
            let id = 0;
            for (const item of json) {
                list.push({
                    ...this.item,
                    ...item,
                    desc: "",
                    id
                });
                id++;
            }

            this.send(list);

        });

        return true;
        
    }

    showResult (q, item) {
        this.send({
            ...this.item,
            name: "Wort wird geladen"
        })
        this.setInput(this.prefix + q, false);

        duden.getWord(item.url, (data) => {

            let list = [];
            list.push({
                ...this.item,
                name: `<b>${item.name}, ${data.Artikel}</b>`,
                desc: ""
            });
            
            for (const title in data) {
                if (title === "Artikel") continue;
                list.push({
                    ...this.item,
                    name: `<div style="white-space: normal; text-align: left;">${title}<br><b>${data[title]}</b></div>`,
                    desc: ""
                });
            }
            this.send(list);
            
        })

    }

}

module.exports = (handlelist, mainWindow) => {

    new Duden(handlelist, mainWindow).register();

}