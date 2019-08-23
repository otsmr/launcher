"use strict";

require("./globalconfig");

const fs = require("fs");
const search = require("./search");
const { shell } = require("electron");
const { exec, spawn } = require('child_process');
const path = require("path");
const clipboardy = require("clipboardy");

class HandleList {

    constructor (mainWindow) {

        this.registered = [];
        this.mainWindow = mainWindow;
        this.json = [];
        this._lastSendID = 0;

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
        const modulesFiles = fs.readdirSync(process.launcher.modulePath);

        const installed = {};
        for (const m of this.registered) {
            try {
                if (modules[m.id].enabled) {
                    installed[m.id] = true;
                    continue;
                }
            } catch (error) { }

            // Deaktiviert
            this.registered.splice(this.registered.indexOf(m), 1);
        }
        let inits = {};
        for (let m in modules) {
            inits[m.split(".")[0]] = true;
            if (modules[m].enabled) {
                if (installed[m]) continue;
                m = m.split(".")[0];
                const installer = require(process.launcher.modulePath + m + "/" + m);
                installer(this, this.mainWindow, search);
                // console.log(m + " installiert/neugeladen.");
            }
        }
        for (let item of modulesFiles){
            if (item === "module.js") continue;
            if (inits[item]) continue;
            const installFile = path.join(process.launcher.modulePath, item, item + ".js");
            if (fs.existsSync(installFile)) {
                const installer = require(installFile);
                installer(this, this.mainWindow, search);
                // console.log(item + " neu installiert.");
            }
        }

    }

    register (item) {
        this.registered.push(item);
    }

    displayModules (query) {
        
        if (query === "-reload") {
            this.registered = [];
            this.importModule();
            this.setInput("! ")
            return;
        }

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
                name: "Modul: " + id + ((modules[id].config.prefix != undefined) ? ` (${(modules[id].config.prefix)})` : ""),

                desc: (modules[id].enabled) ? "Aktiviert" : "Deaktiviert",
                type: "toinput",
                toinput: "! " + id
            });
        }
        if (commands[0] !== "") list = search.list(commands[0], list);
            
        
        list.unshift({
            name: "Module",
            desc: "Optionen: $id -disable, -enable; -reload",
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
                name: "Modul: <b>" + commands[0] + ((item.config.prefix != undefined) ? `</b> (${(item.config.prefix)})` : "</b>"),
                desc: (item.enabled) ? "Aktiviert" : "Deaktiviert",
            });
        }
        
        return this.send(list)

    }

    search (query) {
        this._lastSendID++;
        if (query.startsWith("!")) {
            query = query.replace("!", "");
            if (query[0] === " ") query = query.substr(1);
            return this.displayModules(query);
        }

        let list = this.getList();

        for (const item of this.registered){

            if (item.addToList) {
                const add = item.addToList();
                if (typeof add === "object" && add.length > 0) {
                    list = list.concat(add);
                }
            }
        }

        if (query[0] === "?") {
            
            let res = [];
            for (const item of this.registered) {
                if (!item.name) continue;
                if (item.exact) res.push({ ...item, name: item.name + ` (${item.exact})`, type: "toinput", toinput: item.exact });
                if (item.prefix) res.push({ ...item, name: item.name + ` (${item.prefix})`, type: "toinput", toinput: item.prefix });
            }
            for (const item of list) {
                if (!item.name) continue;
                if (item.exact) res.push({ ...item, name: item.name + ` (${item.exact})`, type: "toinput", toinput: item.exact });
                if (item.prefix) res.push({ ...item, name: item.name + ` (${item.prefix})`, type: "toinput", toinput: item.prefix });
            }
            if (query.length > 1) {
                res = search.list(query.replace("?", "").trimStart(), res);
            }
            return this.send(res);

        }

        for (const item of this.registered){

            if (item.always && item.always(query, this._lastSendID)) return;

            if (!item.prefix || !query.startsWith(item.prefix)) continue;
            let q = query.replace(item.prefix, "");
            if (q[0] === " ") q = q.substr(1);
            return item.onInput(q, this._lastSendID);

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
        this._lastSendID++;
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
            return run.onSelect(input, run, this._lastSendID);
        }
        if (!run.type) {

            for (const item of this.registered){
    
                if (!item.prefix || !input.startsWith(item.prefix)) continue;
                if (item.onSelect) {
                    let i = input.replace(item.prefix, "");
                    if (i[0] === " ") i = i.substr(1);
                    return item.onSelect(i, run, this._lastSendID);
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
