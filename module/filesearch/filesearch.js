"use strict";
const Search = require("filesearch-windows");
const moment = require("moment");
const Module = require("../module");
const fileicon = require("../packages/fileicons");


class FileSearch extends Module {

    constructor (a, b, home) {
        super("filesearch.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": ">",
                "search": {
                    "excludefolder": [
                        "node_modules",
                        ".git",
                        "AppData"
                    ]

                }
            }
        })

        this.home = home;

        this.item = {
            name: "Filesearch",
            desc: "",
            icon: process.launcher.imgPath + "windows/explorer.png",
        }

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            noEnter: true,
            onInput: (search, sendID) => {
                return this.display(search, sendID);
            }, 
            onSelect: (query, item, sendID) => {
                this.startSearch(query, item, sendID);
            }
        })

    }

    display (query,  sendID) {

        const help = {
            ...this.item,
            desc: "Hilfe: github.com/otsmr/filesearch",
            url: "https://github.com/otsmr/filesearch/blob/master/README.md#SearchByArgs",
            type: "website",
            name: "Hilfe öffnen",
            id: 0
        };

        if (query === "") {
            this.send([{
                ...this.item
            },help ]);
        } else {
            this.send([{
                ...this.item,
                name: "Suchen nach <b>" + query + "</b>",
                id:1
            },help ]);
        }

    }

    startSearch (query, item, sendID) {

        this.setInput(this.prefix + query, false);
        this.send({
            ...this.item,
            name: "Es wird gesucht nach: <b>" + query + "</b>"
        })

        if (query.length < 2) return;
        if (query.indexOf(" -p") < -1) {
            query += " -path " + process.launcher.home
        }
        
        const search = new Search(this.config.search).searchByArgs(query).async(() => {
            const results = search.toJSON();
            if (results.length === 0) {
                return this.send({
                    ...this.item,
                    name: "Keine Ergebnisse gefunden"
                })
            }
            
            let res = [];
            moment.locale("de");
            for (const treffer of results) {
                const c = moment(parseInt(treffer.datecreated));
                const m = moment(parseInt(treffer.datemodified))
                
                let desc = [
                    treffer.itemtypetext,
                    `Erstellt: <b>${c.fromNow()}</b>; Geändert: <b>${m.fromNow()}</b>`,
                    treffer.fullname,
                ];
                let icon;
                if (treffer.fileattributes === 16) {
                    icon = process.launcher.imgPath + "explorer/folder.png";
                } else {
                    desc[0] = treffer.displaysize + ", " + desc[0];
                    icon = fileicon(treffer.fileextension);
                }
                if (treffer.author) {
                    desc.unshift("Von " + treffer.author.join(", "));
                }
                
                res.push({
                    ...this.item,
                    name: treffer.name,
                    icon,
                    desc: desc.join("<br>"),
                    type: "application",
                    path: treffer.fullname,
                    id: res.length
                });

            }

            this.send(res, sendID);
        });

    }

}

module.exports = (handlelist, mainWindow) => {

    new FileSearch(handlelist, mainWindow).register();

}