"use strict";
const getBookmarks = require("./api/index");
const Module = require("../module");

class Bookmarks extends Module {

    constructor (a, b, search) {
        super("bookmarks.launcher", a, b, {
            "enabled": true,
            "config": {
                "prefix": "b "
            }
        })
        this.search = search;

        this.item = {
            name: "Lesezeichen",
            desc: "Lesezeichen durchsuchen (Firefox)",
            icon: "fa-bookmark fas",
        }

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.prefix,
            noEnter: true,
            onInput: (search, sendID) => {
                this.display(search, sendID);
                return true;
            }
        })

    }

    display (query, sendID) {

        if (query.startsWith("-")) {
            if (query === "-u") {
                this.setInput(this.prefix, false);
                return getBookmarks(this, (list) => {
                    this.send(list);
                }, true);
            }
            return this.send({
                ...this.item,
                name: "Parameter nicht bekannt",
                desc: "Aktualisieren: -u"
            })
        }

        if (query === "") {
            this.send(this.item);
        } else {
            getBookmarks(this, (list) => {
                this.send(this.search.list(query, list));
            })
        }
    }

}

module.exports = (handlelist, mainWindow, search) => {

    new Bookmarks(handlelist, mainWindow, search).register();

}

