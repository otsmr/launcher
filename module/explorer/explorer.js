"use strict";

const fs = require("fs");
const Module = require("../module");
const path = require("path");

const fileicon = require("../packages/fileicons");


class Explorer extends Module {

    constructor (a, b, search) {
        super("explorer.launcher", a, b, {
            enabled: true,
            config: {
                show: {
                    copypath: true,
                    openinexplorer: true,
                    cmd: true
                },
                prefix: "="
            }
        });
        this.search = search;

        this.item = {
            name: "Launcher Explorer",
            desc: "Launcher Explorer öffnen mit \"=\"",
            type: "toinput",
            icon: process.launcher.imgPath + "windows/explorer.png",
            toinput: `=`,

        }

    }

    register () {

        this.handlelist.register({
            id: this.id,
            ...this.item,
            prefix: this.prefix,
            noEnter: true,
            onInput: (input) => {
                this.build(input);
            }
        })

    }

    build (getDir) {
        
        let folder = process.launcher.home + "/";
        let query = getDir;
        let addFolder = "";
        let readDirs;
        let folders = [];
        let files = [];
        let id = 0;

        if (getDir.startsWith("C:/")) folder = "";
        if (getDir.indexOf("/") > -1) {

            getDir.lastIndexOf("/")

            query = getDir.slice(getDir.lastIndexOf("/") + 1, getDir.length);
            folder += addFolder = getDir.slice(0, getDir.lastIndexOf("/"));
            addFolder += "/"

        }
        try {
            readDirs = fs.readdirSync(folder, {withFileTypes: true});
        } catch (error) {
            return this.send();
        }

        for (const file of readDirs) {

            if (file.name[0] === ".") continue;
            if (file.isDirectory()) {
                folders.push({
                    name: file.name,
                    desc: "Ordner öffnen",
                    icon: process.launcher.imgPath + "explorer/folder.png",
                    type: "toinput",
                    toinput: "=" + addFolder +  file.name + "/",
                    id
                })
            } else if(file.isFile()){
                files.push({
                    name: file.name,
                    desc: "Datei öffnen",
                    type: "application",
                    path: path.join(folder, file.name),
                    icon: fileicon(path.extname(file.name)),
                    id
                })
            }
            
            id++;
        }

        let array = folders.concat(files);

        if (query !== "") {
            array = this.search.list(query, array);
        }
        let copy = path.join(folder, query);
        if (this.config.show.copypath)  array.push({
            name: "Pfad kopieren",
            icon: "fa-copy far",
            desc: copy,
            type: "copy",
            copy: copy,
            id: array.length
        });
        
        try {
            const dir = path.join(folder, "");
            if (fs.lstatSync(dir).isDirectory()) {
                if (this.config.show.openinexplorer) {
                    array.push({
                        name: "Im Explorer öffnen",
                        icon: process.launcher.imgPath + "windows/explorer.png",
                        desc: dir,
                        type: "command",
                        command: "start explorer \"" + dir + "\"",
                        id: array.length
                    });
                }
                if (this.config.show.cmd) array.push({
                    name: "Konsole hier öffnen",
                    icon: process.launcher.imgPath + "windows/cmd.png",
                    desc: dir,
                    type: "command",
                    command: "start cmd.exe /k \"cd " + dir + "\"",
                    id: array.length
                })
            }
        } catch (error) { }

        this.send(array);
    }

}

module.exports = (handlelist, mainWindow, search) => {

    new Explorer(handlelist, mainWindow, search).register();

}