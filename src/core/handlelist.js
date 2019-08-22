"use strict";

require("./globalconfig");

const fs = require("fs");
const search = require("./search");
const { shell } = require("electron");
const exec = require('child_process').exec;

const buildlist = require("./../buildlist");
const clipboardy = require("clipboardy");

const modules = [ {
    name: "translate.google",
    install: require("../module/translate/translate")
},{
    name: "explorer.launcher",
    install: require("../module/explorer/explorer")
},{
    name: "search.launcher",
    install: require("../module/search/search")
},{
    name: "battery.launcher",
    install: require("../module/battery/battery")
},{
    name: "screenshot.launcher",
    install: require("../module/screenshot/screenshot")
},{
    name: "calc.launcher",
    install: require("../module/calc/calc")
}]


class HandleList {

    constructor (mainWindow) {

        this.registered = [];
        this.mainWindow = mainWindow;
        this.json = [];

    }

    getList () {

        try {
            let json = fs.readFileSync(process.launcher.appData + "list.json").toString();
            return JSON.parse(json);
        } catch (error) {
            return [];
        }

    }

    register (item) {
        this.registered.push(item);
    }

    search (query) {

        for (const item of this.registered){

            if (item.always && item.always(query)) return;
            
            if (!item.prefix || !query.startsWith(item.prefix)) continue;
            let q = query.replace(item.prefix, "");
            if (q[0] === " ") q = q.substr(1);

            return item.onInput(q);

        }

        if (query[0] === ">") {

            let res = [];
            for (const item of this.getList()) {
                if ((item.exact || item.prefix) && item.name) res.push(item);
            }
            for (const item of this.registered) {
                if ((item.exact || item.prefix) && item.name) res.push(item);
            }
            if (query.length > 1) {
                res = search.list(query.replace(">", ""), res);
            }
            return this.send(res);

        }

        let exact = false;
        let searchArray = [];

        for (const item of this.getList()) {
            if (item.exact && item.exact === query) {
                exact = item;
            }
            if (!item.exact) searchArray.push(item);
        }
        
        let res = search.list(query, searchArray);

        if (exact) {
            exact.isExact = true;
            res.unshift(exact);
            if (exact.noEnter) {
                const data = this.run(exact.id, query);
                if (data) res = data;
            }
        }

        this.send(res);

    }

    send (list) {

        this.json = list;
        this.mainWindow.webContents.send("add-to-list", list);

    }

    run (id, input) {

        if (!this.json) return this.mainWindow.toggleMe(true);

        let run = false;
        for (const item of this.json) {
            if (item.id == id) {
                run = item;
                break;
            }
        }

        if (!run) return this.mainWindow.toggleMe(true);

        if (!run.type) {

            for (const item of this.registered){
    
                if (!item.prefix || !input.startsWith(item.prefix)) continue;
                if (item.onSelect) {
                    let i = input.replace(item.prefix, "");
                    if (i[0] === " ") i = i.substr(1);
                    return item.onSelect(i, run);
                }
    
            }

        }

        if (!run.closeWindowNot) {
            this.mainWindow.toggleMe(true)
        }
        switch (run.type) {
            case "copy": clipboardy.writeSync(run.copy); break;
            case "application": shell.openItem(run.path); break;
            case "command": exec(run.command); break;
            case "updatelist": 
                buildlist();
                this.mainWindow.toggleMe(false)
            break;
            case "shortcut": exec(`powershell "invoke-item '${run.path}'"`); break;
            case "website": shell.openExternal(run.url); break;
        }
        
        return false;

    }

}

module.exports = (mainWindow) => {

    const handleList = new HandleList(mainWindow);

    for (const m of modules) {
        m.install(handleList, mainWindow);
    }

    return handleList;

}
