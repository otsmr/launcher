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
            icon: process.launcher.imgPath + "engine/duden.png",
        }

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            noEnter: true,
            onInput: (q, sendID) => {
                return this.display(q, sendID);
            }, 
            onSelect: (q, item, sendID) => {
                this.showResult(sendID, q, item);
            }
        })

    }

    display (query, sendID) {

        if (query.length < 2) {
            this.send(this.item, sendID);
            return true;
        }
        this.setLoader(true);
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

            this.send(list, sendID);
            this.setLoader(false);

        });

        return true;
        
    }

    showResult (sendID, q, item) {
        this.send({
            ...this.item,
            name: "<b>" + item.name + "</b> wird geladen"
        }, sendID)
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
                    name: `${title}<br><b>${data[title]}</b>`,
                    desc: ""
                });
            }
            this.send(list, sendID);
            
        })

    }

}

module.exports = (handlelist, mainWindow) => {

    new Duden(handlelist, mainWindow).register();

}