"use strict";
const Module = require("../module");

class Console extends Module {

    constructor (a, b) {
        super("console.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "r "
            }
        });

        this.item = {
            name: "Befehl: $query",
            desc: `Ausführen in ${this.config.terminal}`,
            icon: "fa-terminal fas"
        }

    }
    
    register () {
        
        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.config.prefix,
            onInput: (query) => {
                this.send({
                    ...this.item,
                    name: this.item.name.replace("$query", query),
                    type: "command",
                    command: "start cmd.exe /k \"" + query + "\"",
                    id: 0
                });
                return true;
            }
        })

    }
    
}

module.exports = (handlelist, mainWindow) => {
    
    new Console(handlelist, mainWindow).register();
    
}