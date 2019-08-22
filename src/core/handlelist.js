"use strict";

require("./globalconfig");

const fs = require("fs");
const search = require("./search");
const { shell } = require("electron");
const { exec, spawn } = require('child_process');

const clipboardy = require("clipboardy");

class HandleList {

    constructor (mainWindow) {

        this.registered = [];
        this.mainWindow = mainWindow;
        this.json = [];

        mainWindow.on("focus", () =>{
            this.importModule();
        });

    }

    getList () {

        let json = [];
        json.push({
            "name": "Einstellungen",
            "desc": "Einstellungen für den Launcher",
            "icon": process.launcher.imgPath + "/logo.png",
            "icontyp": "file",
            "type": "application",
            "path": process.launcher.appData + "/config.json",
            "exact": "config"
        })
        return json;

    }

    importModule () {

        const modules = process.launcher.config().module;

        const installed = {};
        for (const m of this.registered) {
            try {
                if (modules[m.id].enabled) {
                    installed[m.id] = true;
                    continue;
                }
            } catch (error) { }

            this.registered.splice(this.registered.indexOf(m), 1);
        }
        for (let m in modules) {
            if (modules[m].enabled) {
                if (installed[m]) continue;
                m = m.split(".")[0];
                const installer = require(process.launcher.modulePath + m + "/" + m);
                installer(this, this.mainWindow, search);
            }
        }

    }

    register (item) {
        this.registered.push(item);
    }

    displayModules (query) {

        const commands = query.split(" ");
        let list = [];
        const modules = process.launcher.config().module;

        let item = false;
        for (const id in modules) {
            if (id === commands[0]) {
                item = modules[id];
                continue;
            }
            list.push({
                icon: process.launcher.imgPath + "box.svg",
                name: "Modul: " + id + ` (${modules[id].config.prefix})`,
                desc: (modules[id].enabled) ? "Aktiviert" : "Deaktiviert",
                type: "toinput",
                toinput: "! " + id
            });
        }
        if (commands[0] !== "") list = search.list(commands[0], list);
            
        
        list.unshift({
            name: "Module",
            desc: "Optionen: $id -disable, -enable",
            icon: process.launcher.imgPath + "box.svg"
        });
        if (item){
            if (commands[1] === "-enable" || commands[1] === "-disable") {
                if (commands[1] === "-disable") {
                    item.enabled = false;
                } else {
                    item.enabled = true;
                }
                process.launcher.config(true);
                this.importModule();
                return this.setInput("! " + commands[0]);
            }

            list.unshift({
                icon: process.launcher.imgPath + "box.svg",
                name: "Modul: <b>" + commands[0] + `</b> (${item.config.prefix})`,
                desc: (item.enabled) ? "Aktiviert" : "Deaktiviert",
            });
        }
        
        return this.send(list)

    }

    search (query) {

        if (query.startsWith("!")) {
            query = query.replace("!", "");
            if (query[0] === " ") query = query.substr(1);
            return this.displayModules(query);
        }

        let list = this.getList();
        
        for (const item of this.registered){

            if (item.always && item.always(query)) return;
            if (item.addToList) {
                const add = item.addToList();
                if (typeof add === "object" && add.length > 0) {
                    list = list.concat(add);
                }
            }
            
            if (!item.prefix || !query.startsWith(item.prefix)) continue;
            let q = query.replace(item.prefix, "");
            if (q[0] === " ") q = q.substr(1);

            return item.onInput(q);

        }

        if (query[0] === ">") {

            let res = [];
            for (const item of list) {
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
        let id = 0;
        for (const item of list) {
            if (item.exact && item.exact === query) {
                exact = item;
            }
            item.id = id;
            id++;
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

    send (list = []) {
        
        if (list.length === undefined) {
            list = [list];
        }

        this.json = list;
        this.mainWindow.webContents.send("add-to-list", list);

    }

    setInput (data) {
        this.mainWindow.webContents.send("toinput", data);
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
        if (run.onSelect) {
            return run.onSelect(input, run);
        }
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
            case "commandps": spawn("powershell.exe", [run.command]);break;
            case "shortcut": exec(`powershell "invoke-item '${run.path}'"`); break;
            case "website": shell.openExternal(run.url); break;
        }
        
        return false;

    }

}

module.exports = (mainWindow) => {

    return  new HandleList(mainWindow);

}
