"use strict";

const Module = require("../module");

const suggestqueries = {
    google: require("./suggestqueries/google"),
    duckduckgo: require("./suggestqueries/duckduckgo"),
    wikipedia: require("./suggestqueries/wikipedia")
}

class Search extends Module {

    constructor (a, b) {
        super("search.launcher", a, b, {
            "enabled": true,
            "config": {
                "waitAfterInput": 500,
                "engines": [
                    {
                        "prefix": "d ",
                        "name": "DuckDuckGo Black: <b>$query</b>",
                        "desc": "Auf DuckDuckGo nach $query suchen",
                        "icon": "$imgPath/duckblack.png",
                        "engine": "duckduckgo",
                        "suggestqueries": true,
                        "url": "https://duckduckgo.com/?q=$query&kae=d&kl=de-de&kak=-1&kax=-1&kaq=-1&kao=-1&kap=-1&kau=-1&kam=osm&kaj=m&k1=-1&t=h_&ia=web"
                    },
                    {
                        "prefix": "dl ",
                        "name": "DuckDuckGo: <b>$query</b>",
                        "desc": "Auf DuckDuckGo nach $query suchen",
                        "icon": "$imgPath/duck.svg",
                        "engine": "duckduckgo",
                        "url": "https://duckduckgo.com/?q=$query&kl=de-de&kak=-1&kax=-1&kaq=-1&kao=-1&kap=-1&kau=-1&kam=osm&kaj=m&k1=-1&t=h_&ia=web"
                    },
                    {
                        "prefix": "g ",
                        "name": "Google: <b>$query</b>",
                        "desc": "Auf Google nach $query suchen",
                        "icon": "$imgPath/google.png",
                        "url": "https://www.google.de/search?q=$query",
                        "engine": "google",
                        "suggestqueries": true 
                    },
                    {
                        "prefix": "hs ",
                        "name": "https://<b>$query</b>",
                        "desc": "Url öffnen",
                        "icon": "$imgPath/http.svg",
                        "url": "https:/$query"
                    }
                ]
            }
        });

        this.item = {
            name: "Suchmaschinen",
            icontype: "file",
            icon: process.launcher.imgPath + "duck.svg"
        }
        
    }


    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
            always: (query) => {
                return this.check(query);
            }
        })

    }

    check (query) {
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
                });
                return true;
            }

            const view = {
                name: engine.name.replace("$query", q),
                desc: engine.desc.replace("$query", q),
                type: "website",
                icontype: "file",
                id: searches.length,
                icon: engine.icon.replace("$imgPath", process.launcher.imgPath),
                url: engine.url.replace("$query", q)
            }
            searches.push(view);

            if (engine.suggestqueries) {
                this.timer = setTimeout(() => {
                    
                    switch (engine.engine) {
                        case "google": 
                            suggestqueries.google(q, (data) => {
                                this.addSuggest(engine, view, data);
                            })
                        break;
                        case "duckduckgo": 
                            suggestqueries.duckduckgo(q, (data) => {
                                this.addSuggest(engine, view, data);
                            })
                        break;
                        case "wikipedia": 
                            suggestqueries.wikipedia(q, (data) => {
                                this.addSuggest(engine, view, data);
                            })
                        break;
                    }
                }, config.waitAfterInput || 500);
            }
            
        }
        
        if (searches.length > 0) {
            this.send(searches);
            return true;
        } else return false;

    }

    addSuggest (engine, view, querys) {

        let list = [];

        list.push(view);

        let id = 1000;
        for (const query of querys) {
            list.push({
                ...view,
                desc: "Suche nach " + query,
                name: query,
                url: engine.url.replace("$query", query),
                id
            })
            id++;
        }

        this.send(list);
    }

}

module.exports = (handlelist, mainWindow) => {

    new Search(handlelist, mainWindow).register();

}