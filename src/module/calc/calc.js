"use strict";

const Module = require("../module");

class Battery extends Module {

    constructor (a, b) {
        super("calc.launcher", a, b, {
            "enabled": true,
            "config": { }
        })

        this.item = {
            name: "Ergebniss: ",
            desc: "",
            icontyp: "file",
            icon: process.launcher.imgPath + "/calc.svg",
        }

    }

    register () {

        this.handlelist.register({
            always: (query) => {
                return this.calc(query);
            }
        })

    }

    calc (query) {
        try {

            if (query[query.length-1].match(new RegExp("^[0-9]*$", "g")) && query.match(new RegExp("^[0-9\\+\\-\\/\*]*$", "g")) && query.length > 2) {
                this.send({
                    ...this.item,
                    name: this.item.name + eval(query)
                })
                return true;
            }
        } catch (error) { 
            console.log(error);
        }
        return false;        
        
    }

}

module.exports = (handlelist, mainWindow) => {

    new Battery(handlelist, mainWindow).register();

}