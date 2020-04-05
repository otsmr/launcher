"use strict";

const Module = require("../module");

class Calc extends Module {

    constructor (a, b) {
        super("calc.launcher", a, b, {
            "enabled": true,
            "config": { }
        })

        this.item = {
            name: "Ergebnis: ",
            desc: "",
            icon: "fa-calculator fas",
        }

        this.history = [];

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            always: (query) => {
                return this.calc(query);
            },
            afterSelected: (item) => {
                console.log(item);
            }
        })

    }

    calc (query) {
        try {

            const MathConst = [
                "E",
                "LN10",
                "LN2",
                "LOG10E",
                "LOG2E",
                "PI",
                "SQRT1_2",
                "SQRT2"
            ].map(e => `(Math.${e})`)

            query = query.replace(/,/g, ".");

            const regex = `((Math.(.*?)\\\((.*?)\\\))|${MathConst.join("|")}|(\\\+)|(\\\.)|(\\\-)|(\\\*)|(\\\%)|(\\\/)|(\\\ )|(\\\()|(\\\))|([0-9]))`;
            const checkIsNoMath = query.replace(new RegExp(regex, "g"), "");

            const requiredItems = ["+", "-", "*", "%", "/"].map(e => `(\\${e})`).join("|");

            if (checkIsNoMath.length === 0 && query.match(new RegExp(`(${requiredItems}|(Math))`, "g")).length > 0) {

                let result = String(eval(query));

                result = result.replace(".", ",");

                let list = [];

                list.push({
                    ...this.item,
                    type: "copy",
                    copy: result,
                    id: this.history.length,
                    desc: "Enter zum Kopieren",
                    name: this.item.name + result,
                    afterFired: (input, item) => {
                        item.afterFired = null;
                        item.name = item.name.replace("Ergebnis: ", "")
                        item.icon = "<div class='icon'><i class='m-icon'>repeat</i></div>";
                        item.desc = input;
                        this.history.unshift(item);
                    }
                });

                list = list.concat(this.history);

                this.send(list);
                return true;
                
            }
        } catch (error) {
        }
        return false;        
        
    }

}

module.exports = (handlelist, mainWindow) => {

    new Calc(handlelist, mainWindow).register();

}