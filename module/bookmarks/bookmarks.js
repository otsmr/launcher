"use strict";

const getBookmarks = () => {
    let bookmarks = [];
    bookmarks = bookmarks.concat(
        require("./api/firefox")().map(e => {
            if (e.name === "") {
                let n = e.url
                    .replace("https://", "")
                    .replace("http://", "");
                e.name = n.slice(0, n.indexOf("/"));
            }
            e.desc =  `Firefox in ${e.folder}`;
            e.type= "website";
            e.icon = "https://proxy.oabos.de/" + e.icon;
            console.log(e.iconuri); // Bug fix!!!
            return e;
        })
    );
    return bookmarks;
}
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
                return this.display(search, sendID);
            }
        })

    }

    display (query, sendID) {
        if (query === "") {
            this.send(this.item);
        } else {
            this.send(this.search.list(query, getBookmarks()));
        }
        return true;
    }

}

module.exports = (handlelist, mainWindow, search) => {

    new Bookmarks(handlelist, mainWindow, search).register();

}

