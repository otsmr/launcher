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
                        ".vscode",
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
            ifNoPrefixMatched: (query, sendID) => {
                this.addLiveSearch(query, sendID);
            },
            onInput: (search, sendID) => {
                return this.display(search, sendID);
            }, 
            onSelect: (query, item, sendID) => {
                this.startSearch(query, item, sendID);
            }
        })

    }

    addResults (query, sendID, list, containList = []) {
        if (list.length !== 0) {
            if (this.handlelist._input !== query) return;
            list = this.search.list(this.handlelist._input, list);
            list = list.sort((a, b)=>{
                if (a.fileType === "folder" && b.fileType !== "folder") return -1;
                if (a.fileType !== "folder" && b.fileType === "folder") return 1;

                if (a.points > b.points) return -1;
                else return 1;
            });

            if (list[0].fileType === "folder") list.unshift({
                display: "category",
                category: "Ordner"
            });
            list.find((e, i)=>{
                if (e.display !== "category" && e.fileType !== "folder") {
                    list.splice(i, 0, {
                        display: "category",
                        category: "Dateien"
                    });
                    return true;
                }
            });
        }
        if (containList.length > 0) {
            
            list.push({
                display: "category",
                category: "inhaltliche Übereinstimmung"
            });
            list = list.concat(containList);

        }
        let id = 0;
        list = list.map(e => {
            id++;
            e.id = id;
            return e;
        })
        
        this.send(list, sendID, true);

    }

    addLiveSearch (query,  sendID) {

        
        if (query.length <= 3) return;
        this.setLoader(true);
        
        this.startSearch(`*${query.split(" ").join("*")}*`, null, sendID, (list, sendID) => {
            this.setLoader(false);
            if (list.length !== 0) this.addResults(query, sendID, list);
            if (list.length > 10) return;
            if (query !== this.handlelist._input) return;
            this.setLoader(true);
            
            this.startSearch(`* -c "*${query.split(" ").join("*")}*"`, null, sendID, (containList) => {
                this.setLoader(false);
                if (containList.length === 0) return;
                if (query !== this.handlelist._input) return;
                this.addResults(query, sendID, [], containList);
            });

        });

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

    startSearch (query, item, sendID, callBack = false) {

        if (!callBack) {
            this.setInput(this.prefix + query, false);
            this.send({
                ...this.item,
                name: "Es wird gesucht nach: <b>" + query + "</b>"
            })
        }

        if (query.length < 2) return;
        if (query.indexOf(" -p") < -1) {
            query += " -path " + process.launcher.home
        }
        try {
        
            const search = new Search(this.config.search).searchByArgs(query).async(() => {
                const results = search.toJSON();
                if (results.length === 0) {

                    if (!callBack)  this.send({
                        ...this.item,
                        name: "Keine Ergebnisse gefunden"
                    });
                    else callBack([]);
                    
                    return;
                }
                
                let res = [];
                moment.locale("de");
                for (const treffer of results) {
                    const c = moment(parseInt(treffer.datecreated));
                    const m = moment(parseInt(treffer.datemodified))
                    
                    let desc = [
                        `Zuletzt geändert: <b>${m.format("DD.MM.YYYY, H:mm")}</b>`,
                        treffer.fullname.replace(new RegExp(treffer.name + '$'), '')
                    ];
                    let icon;
                    treffer.fileType = "file";
                    if (treffer.fileattributes === 16) {
                        icon = process.launcher.imgPath + "explorer/folder.png";
                        treffer.fileType = "folder";
                    } else {
                        if (treffer.displaysize) desc[0] = treffer.displaysize + ", " + desc[0];
                        icon = fileicon(treffer.fileextension);
                    }
                    
                    res.push({
                        ...this.item,
                        fileType: treffer.fileType,
                        name: treffer.name,
                        icon,
                        desc: desc.join("<br>"),
                        type: "application",
                        path: treffer.fullname,
                        id: res.length
                    });

                }
                if (callBack) callBack(res, sendID);
                else this.send(res, sendID);
                
            });
        } catch (error) {
            this.setLoader(false);
        }

    }

}

module.exports = (handlelist, mainWindow) => {

    new FileSearch(handlelist, mainWindow).register();

}