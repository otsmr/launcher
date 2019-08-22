"use strict";

const Module = require("../module")
const weather = require("./api/wetter.com.js");

class Weather extends Module {

    constructor(a, b) {
        super("weather.wettercom", a, b, {
            "enabled": true,
            "config": {
                "prefix": "wetter "
            }
        });

        this.item = {
            name: "Wetter by wetter.com",
            desc: "",
            icon: process.launcher.imgPath + "/weather.svg",
            icontyp: "file"
        }

    }

    register() {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            noEnter: false,
            onInput: (name) => {
                return this.display(name);
            },
            onSelect: (query, item) => {
                this.search(query, item)
            }
        })

    }

    display(name) {

        if (name === "") {
            this.send(this.item);
            return true;
        }

        weather.search(name, (citys) => {
            if (!citys) return;
            let send = [];
            let id = 0;
            for (const city of citys) {
                send.push({
                    ...this.item,
                    ...city,
                    id
                });
                id++;
            }
            this.send(send);
        });
        
        return true;
    }

    search(query, item) {
        this.send({
            ...this.item,
            name: "Wetter wird geladen"
        })
        this.setInput(this.prefix + query, false);
        
        weather.forecast(item.code, (json) => {

            let list = [];

            list.push({
                ...this.item,
                name: "Wetter in " + item.name
            });
            
            for (const c of json) {
                list.push({
                    ...this.item,
                    name: `${c.date}<br>
                           <b>${c.smallDesc}</b>, bei Temp. von <b>${c.tempMin}</b> bis <b>${c.tempMax}</b><br>
                           Zu <b>${c.rainfall}</b> Regen, <b>${c.sunHours}</b> Sonne`,
                    desc: `<div style="white-space: normal; text-align: left;">${c.longDesc.replace(", ", "<br>")}</div>`,
                    icon: c.icon,
                })
            }

            this.send(list);

        });

    }

}

module.exports = (handlelist, mainWindow) => {

    new Weather(handlelist, mainWindow).register();

}