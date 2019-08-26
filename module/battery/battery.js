"use strict";
const powershell = require("../packages/powershell");

const Module = require("../module");

class Battery extends Module {

    constructor (a, b) {
        super("battery.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "battery"
            }
        })

        this.item = {
            name: "Akku",
            desc: "Informationen zum Akku",
            icontyp: "file",
            icon: process.launcher.imgPath + "windows/akku.png",
        }

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            noEnter: true,
            onInput: (search, sendID) => {
                return this.display(search, sendID);
            }
        })

    }

    getBatteryInfo () {

        try {

            const infos = powershell.getJSON("Get-WmiObject win32_battery", [
                "Description",
                "EstimatedChargeRemaining",
                "EstimatedRunTime",
                "BatteryStatus"
            ]);
            if (infos.EstimatedChargeRemaining)  return infos;
            
        } catch (error) { }
        
        return false;
    }

    display (query,  sendID) {

        this.send([this.item])

        const infos = this.getBatteryInfo();

        if (!infos) return this.send([this.item],  sendID);
        const def = {
            ...this.item,
            desc: ""
        }

        let remainingTime = infos.EstimatedRunTime + " Minuten";
        if (infos.EstimatedRunTime > 1000) {
            remainingTime = "Wird geladen"
        } 

        this.send([{ ...def,
            name: "Akku",
            desc: "Informationen zum Akku"
        },{ ...def,
            name: "Ladezustand: <b>" + infos.EstimatedChargeRemaining + "%</b>"
        },{ ...def,
            name: "Verbleibende Zeit: <b>" + remainingTime + "</b>"
        }],  sendID);
        
    }

}

module.exports = (handlelist, mainWindow) => {

    new Battery(handlelist, mainWindow).register();

}