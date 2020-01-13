"use strict";
const Module = require("../module");
const fontAwesome = require("./providers/font-awesome.json");
const materialicons = require("./providers/materialicons.json");
let search = null;
const getIcons = (query) => {

    
    let id = 0;
    let list = [];

    console.log(query);

    if (query.indexOf("-m") === -1) JSON.parse(JSON.stringify(fontAwesome)).map(e => { // JSON to clone
        list.push({
            ...e,
            desc: "Font Awesome 5 (5.10.2)",
            icon: e.icon.split(" ").reverse().join(" ")
        });
    });

    if (query.indexOf("-f") === -1) JSON.parse(JSON.stringify(materialicons)).map(icon => {
        list.push({
            name: icon,
            desc: "Material Icons",
            icon: `<div class="icon"><i class="m-icon">${icon}</i></div>`
        });
    });
    
    
    query = query.replace("-f ", "").replace("-m ", "");
    console.log(query);

    if (query.length > 0) {
        list = search.list(query, list);
    }
    list = list.map(e => {
        id++;
        return {
            ...e,
            type: "copy",
            copy: e.icon,
            id
        }
    })

    return list;

}

class Icons extends Module {

    constructor (a, b) {
        super("icons.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "i "
            }
        });

        search = this.search;
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
                this.send(getIcons(query));
                return true;
            }
        })

    }
    
}

module.exports = (handlelist, mainWindow) => {
    
    new Icons(handlelist, mainWindow).register();
    
}