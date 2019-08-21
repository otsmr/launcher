"use strict";
const fs = require("fs");
const path = require('path')
const search = require("./search");
const {shell} = require("electron");
const exec = require('child_process').exec;
require("./globalconfig");
const buildlist = require("./../buildlist");
const powershell = require("./../console/powershell");

module.exports = class {

    constructor () {
        this.iconImages = {};
        this.imgPath = process.lauchner.imgPath + "/explorer/";
        fs.readdirSync(this.imgPath, (err, files) => {
            if (err) return;
            for (const file of files) {
                this.extensions[file.name] = this.imgPath + file.name
            }
        });
    }

    getList () {

        try {
            let json = fs.readFileSync(process.lauchner.appData + "list.json").toString();
            return JSON.parse(json);
        } catch (error) {
            return [];
        }

    }

    explorer (getDir) {
        getDir = getDir.replace("=", "");
        
        let folder = process.lauchner.home + "/";
        let query = getDir;
        let addFolder = "";
        if (getDir.indexOf("/") > -1) {
            getDir.lastIndexOf("/")

            query = getDir.slice(getDir.lastIndexOf("/") + 1, getDir.length);
            folder += addFolder = getDir.slice(0, getDir.lastIndexOf("/"));
            addFolder += "/"
        }

        let readDirs = fs.readdirSync(folder, {withFileTypes: true});
        let folders = [];
        let files = [];
        let id = 0;
        for (const file of readDirs) {
            if (file.name[0] === ".") continue;
            if (file.isDirectory()) {
                folders.push({
                    name: file.name,
                    desc: "Ordner öffnen",
                    icon: this.imgPath + "folder.png",
                    icontype: "file",
                    type: "toinput",
                    toinput: "=" + addFolder +  file.name + "/",
                    id
                })

            } else if(file.isFile()){
                const ext = path.extname(file.name);
                let icon = this.iconImages[ext + ".png"];
                if (!icon) icon = this.imgPath + "file.png";
                files.push({
                    name: file.name,
                    desc: "Datei öffnen",
                    icontype: "file",
                    type: "application",
                    path: path.join(folder, file.name),
                    icon, id
                })
            }
            
            id++;
        }

        let array = folders.concat(files);

        if (query !== "") {
            array = search.list(query, array);
        }

        return this.json = array;

    }

    search (query) {

        const array = this.getList();
        this.json = array;

        if (query.startsWith("d ")) {
            query = query.replace("d ", "");

            return this.json = [{
                name: "DuckDuckGo: <b>" + query + "</b>",
                desc: "Suche auf DuckDuckGo nach " + query,
                type: "website",
                icontype: "file",
                id: 0,
                icon: process.lauchner.imgPath + "duck.svg",
                url: `https://duckduckgo.com/?q=${query}&kae=d&kl=de-de&kak=-1&kax=-1&kaq=-1&kao=-1&kap=-1&kau=-1&kam=osm&kaj=m&k1=-1&t=h_&ia=web`
            }]
        }

        if (query[0] === ">") {

            let res = [];
            for (const item of array) {
                if (item.exact) res.push(item);
            }

            if (query.length > 1) {
                query = query.replace(">", "");
                return search.list(query, res);
            }

            return res;
        }

        if (query[0] === "=") {

            return this.explorer(query);
        }


        let exact = false;

        for (const item of array) {
            if (item.exact && item.exact === query) {
                exact = item;
                break;
            }
        }

        let searchArray = [];
        for (const item of array) {
            if (!item.exact) searchArray.push(item);
        }
        
        let res = search.list(query, searchArray);

        if (exact) {
            exact.isExact = true;
            res.unshift(exact);
        }

        return res;

    }

    run (id) {

        
        if (!this.json) return;

        let run = false;
        for (const item of this.json) {
            if (item.id == id) {
                run = item;
                break;
            }
        }
        if (!run) return;
        
        switch (run.type) {
            case "application": shell.openItem(run.path); break;
            case "command": exec(run.command); break;
            case "updatelist": buildlist(); break; // TrayICON
            case "shortcut": exec(`powershell "invoke-item '${run.path}'"`); break;
            case "website": shell.openExternal(run.url); break;
        }

        console.log(run);

    }

}