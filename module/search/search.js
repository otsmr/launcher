"use strict";

const Module = require("../module");

const suggestqueries = {
    google: require("./suggestqueries/google"),
    duckduckgo: require("./suggestqueries/duckduckgo"),
    wikipedia: require("./suggestqueries/wikipedia"),
    startpage: require("./suggestqueries/startpage"),
    npms: require("./suggestqueries/npms")
}

class Search extends Module {

    constructor (a, b) {
        super("search.launcher", a, b, {
            "enabled": true,
            "config": {
                "waitAfterInput": 500,
                "engines": [
                    {
                        "prefix": "wi ",
                        "name": "Wikipedia: <b>$query</b>",
                        "desc": "Auf Wikipedia nach $query suchen",
                        "icon": "$imgPath/engine/wikipedia.png",
                        "engine": "wikipedia",
                        "suggestqueries": true,
                        "url": "https://de.wikipedia.org/w/index.php?title=Spezial%3ASuche&fulltext=Suchen&search=$query"
                    },
                    {
                        "prefix": "s ",
                        "name": "Startpage: <b>$query</b>",
                        "desc": "Auf Startpage nach $query suchen",
                        "icon": "$imgPath/engine/startpage.png",
                        "engine": "startpage",
                        "suggestqueries": true,
                        "url": "https://www.startpage.com/sp/search?q=$query&language=deutsch"
                    },
                    {
                        "prefix": "d ",
                        "name": "DuckDuckGo Black: <b>$query</b>",
                        "desc": "Auf DuckDuckGo nach $query suchen",
                        "icon": "$imgPath/engine/duckblack.png",
                        "engine": "duckduckgo",
                        "suggestqueries": true,
                        "url": "https://duckduckgo.com/?q=$query&kae=d&kl=de-de&kak=-1&kax=-1&kaq=-1&kao=-1&kap=-1&kau=-1&kam=osm&kaj=m&k1=-1&t=h_&ia=web"
                    },
                    {
                        "prefix": "dl ",
                        "name": "DuckDuckGo: <b>$query</b>",
                        "desc": "Auf DuckDuckGo nach $query suchen",
                        "icon": "$imgPath/engine/duck.svg",
                        "engine": "duckduckgo",
                        "url": "https://duckduckgo.com/?q=$query&kl=de-de&kak=-1&kax=-1&kaq=-1&kao=-1&kap=-1&kau=-1&kam=osm&kaj=m&k1=-1&t=h_&ia=web"
                    },
                    {
                        "prefix": "g ",
                        "name": "Google: <b>$query</b>",
                        "desc": "Auf Google nach $query suchen",
                        "icon": "$imgPath/engine/google.png",
                        "url": "https://www.google.de/search?q=$query",
                        "engine": "google",
                        "suggestqueries": true 
                    },
                    {
                        "prefix": "hs ",
                        "name": "https://<b>$query</b>",
                        "desc": "Url öffnen",
                        "icon": "$imgPath/engine/http.svg",
                        "url": "https:/$query"
                    },
                    {
                        "prefix": "npm ",
                        "name": "npms: <b>$query</b>",
                        "desc": "Auf npms nach $query suchen",
                        "icon": "$imgPath/engine/npm.png",
                        "url": "https://npms.io/search?q=$query",
                        "engine": "npms",
                        "suggestqueries": true 
                    },
                    {
                        "prefix": "m ",
                        "name": "Maps: <b>$query</b>",
                        "desc": "Auf Google Maps nach $query suchen",
                        "icon": "$imgPath/engine/maps.png",
                        "url": "https://www.google.com/maps/search/$query",
                        "engine": "maps"
                    }
                ]
            }
        });

        this.item = {
            name: "Suchmaschinen",
            icon: process.launcher.imgPath + "/engine/duck.svg"
        }
        
    }


    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            always: (query, sendID) => {
                return this.check(query, sendID);
            },
            addToList: (query) => {
                return [{
                    ...this.item,
                    desc: "",
                    name: "Alle aktiven Suchmaschinen",
                    exact: "-engine"
                }]
            }
        })

    }

    check (query, sendID) {

        if (query === "-engine") {
            let list = [];

            const config = process.launcher.config().module[this.id].config;
                
            for (const engine of config.engines) {
                list.push({
                    ...this.item,
                    ...engine,
                    type: "toinput",
                    icon: engine.icon.replace("$imgPath", process.launcher.imgPath),
                    name: engine.name.replace("$query", engine.prefix),
                    desc: "Autocomplete: " + ((engine.suggestqueries) ? "Aktiviert" : "Deaktiviert"),
                    toinput: engine.prefix
                });
            }
            this.send(list, sendID);

            return true;

        }

        if (this.timer) clearTimeout(this.timer);

        const config = process.launcher.config().module[this.id].config;

        let searches = [];
            
        for (const engine of config.engines) {
            if (!query.startsWith(engine.prefix)) continue;
            let q = query.replace(engine.prefix, "");
            if (q[0] === " ") q = q.substr(1);

            if (q[0] === "-") {
                const args = q.replace("-", "");
                if (args === "off" || args === "on") {
                    let opt = false;
                    if (args === "on") opt = true;
                    engine.suggestqueries = opt;
                    process.launcher.config(true);
                    this.setInput(engine.prefix + " ");
                    return true;
                }
                if (this.timer) clearTimeout(this.timer);
                this.send({
                    ...engine,
                    icon: engine.icon.replace("$imgPath", process.launcher.imgPath),
                    name: "Optionen für " + engine.engine,
                    desc: "Autocomplete: -off, -on"
                }, sendID);
                return true;
            }

            const view = {
                name: engine.name.replace("$query", q),
                desc: engine.desc.replace("$query", q),
                type: "website",
                id: searches.length,
                icon: engine.icon.replace("$imgPath", process.launcher.imgPath),
                url: engine.url.replace("$query", q)
            }
            searches.push(view);

            if (engine.suggestqueries && suggestqueries[engine.engine]) {
                this.timer = setTimeout(() => {
                    
                    suggestqueries[engine.engine](q, (data) => {
                        this.addSuggest(engine, view, data, sendID);
                    })
                    
                }, config.waitAfterInput || 500);
            }
            
        }
        
        if (searches.length > 0) {
            this.send(searches);
            return true;
        } else return false;

    }

    addSuggest (engine, view, querys, sendID) {

        let list = [];

        list.push(view);

        let id = 1000;
        for (const item of querys) {
            let name = item;
            if (item.name) name = item.name;
            let desc = "Suche nach " + name;
            if (item.desc) desc = item.desc;
            
            list.push({
                ...view,
                desc,
                name,
                url: item.url || engine.url.replace("$query", name),
                id
            })
            id++;
        }

        this.send(list, sendID);
    }

}

module.exports = (handlelist, mainWindow) => {

    new Search(handlelist, mainWindow).register();

}