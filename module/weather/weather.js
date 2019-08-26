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
            icon: "fa-sun fas"
        }

    }

    register() {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            noEnter: false,
            onInput: (name, sendID) => {
                return this.display(name, sendID);
            },
            onSelect: (query, item, sendID) => {
                this.search(query, item, sendID)
            }
        })

    }

    display (name, sendID) {

        if (name === "") {
            this.send(this.item, sendID);
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
            this.send(send, sendID);
        });
        
        return true;
    }

    search(query, item, sendID) {
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
                    desc: `${c.longDesc.replace(", ", "<br>")}`,
                    icon: c.icon,
                })
            }

            this.send(list, sendID);

        });

    }

}

module.exports = (handlelist, mainWindow) => {

    new Weather(handlelist, mainWindow).register();

}