"use strict";
const Module = require("../module");
const fontAwesome = require("./providers/font-awesome.json");

class Icons extends Module {

    constructor (a, b) {
        super("icons.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "i "
            }
        });

        this.item = {
            name: "Icon: $query",
            desc: "",
            icon: ""
        }

    }
    
    register () {
        
        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.config.prefix,
            onInput: (query) => {
                let id = 0;
                let list = JSON.parse(JSON.stringify(fontAwesome));
                if (query.length > 0) {
                    list = this.search.list(query, list);
                }
                list = list.map(e => {
                    id++;
                    return {
                        ...this.item,
                        ...e,
                        icon: e.icon.split(" ").reverse().join(" "),
                        desc: "Font Awesome 5 (5.10.2)",
                        type: "copy",
                        copy: e.icon,
                        id
                    }
                })
                this.send(list);
                return true;
            }
        })

    }
    
}

module.exports = (handlelist, mainWindow) => {
    
    new Icons(handlelist, mainWindow).register();
    
}