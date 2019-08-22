"use strict";

const fs = require("fs");
const Module = require("../module");
const path = require("path");
const search = require("../../core/search");

class Explorer extends Module {

    constructor (a, b) {
        super("explorer.launcher", a, b, {
            enabled: true,
            config: {
                show: {
                    copypath: true,
                    openinexplorer: true
                },
                prefix: "="
            }
        });

        this.iconImages = {};
        this.imgPath = process.launcher.imgPath + "/explorer/";
        fs.readdir(this.imgPath, (err, files) => {
            if (err) return;
            for (const file of files) this.iconImages[file] = this.imgPath + file
        });

        this.item = {
            name: "Launcher Explorer",
            desc: "Launcher Explorer öffnen mit \"=\"",
            type: "toinput",
            icon: process.launcher.imgPath + "windows/explorer.png",
            icontyp: "file",
            toinput: `=`,

        }

    }

    register () {

        this.handlelist.register({
            prefix: this.prefix,
            noEnter: true,
            onInput: (input) => {
                console.log("input", input);
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
        let copy = path.join(folder, query);
        if (this.config.show.copypath)  array.push({
            name: "Pfad kopieren",
            icon: process.launcher.imgPath + "copy.svg",
            icontype: "file",
            desc: copy,
            type: "copy",
            copy: copy,
            id: array.length
        });
        try {
            if (this.config.show.openinexplorer) {
                const dir = path.join(folder, "");
                if (fs.lstatSync(dir).isDirectory()) {
                    array.unshift({
                        name: "Im Explorer öffnen",
                        icon: process.launcher.imgPath + "windows/explorer.png",
                        icontype: "file",
                        desc: dir,
                        type: "command",
                        command: "start explorer \"" + dir + "\"",
                        id: array.length
                    })
                }
            }
        } catch (error) { }

        this.send(array);
    }

}

module.exports = (handlelist, mainWindow) => {

    new Explorer(handlelist, mainWindow).register();

}