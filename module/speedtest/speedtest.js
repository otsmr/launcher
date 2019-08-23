"use strict";
const tester = require('./tester');
const Module = require("../module");

class Speedtest extends Module {

    constructor(a, b) {
        super("speedtest.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "speed"
            }
        })

        this.item = {
            name: "Speedtest",
            desc: "Internetgeschwindigkeit für Upload und Download",
            icontyp: "file",
            icon: process.launcher.imgPath + "windows/akku.png",
        }

    }

    register() {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            onInput: (search, sendID) => {
                return this.display(search, sendID);
            },
            onSelect: (search, sendID) => {
                this.start(search, sendID);
            }
        })

    }


    display(query, sendID) {

        this.send({
            ...this.item,
            id: 0
        }, sendID);
    }

    async start(search, sendID) {

        const list = [];
        const listready = [];
        list.push({
            ...this.item,
            name: "Speedtest läuft...",
            type: "toinput",
            toinput: this.prefix,
            id: 0
        })
        listready.push({
            ...this.item,
            type: "toinput",
            toinput: this.prefix,
            id: 0
        })
        this.setInput(this.prefix, false);
        this.send(list);
        const down = await tester.download();
        
        list.push({
            ...this.item,
            name: "Download: <b>" +  down.mbps + " MBs</b>",
            desc: ""
        })
        listready.push({
            ...this.item,
            name: "Download: <b>" +  down.mbps + " MBs</b>",
            desc: ""
        })
        const up = await tester.download();
        this.send(list);

        listready.push({
            ...this.item,
            name: "Upload: <b>" +  up.mbps + " MBs</b>",
            desc: ""
        })
        
        this.send(listready, sendID);

    }

}

module.exports = (handlelist, mainWindow) => {

    new Speedtest(handlelist, mainWindow).register();

}