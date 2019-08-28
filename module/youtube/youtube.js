
// https://proxy.oabos.de/https://img.youtube.com/vi/<?php echo $wID ?>/mqdefault.jpg



"use strict";
const request = require("request");
const Module = require("../module");

class Youtube extends Module {

    constructor (a, b) {
        super("youtube.oabos", a, b, {
            "enabled": true,
            "config": {
                "prefix": "yt",
                "apikey": ""
            }
        })
        
        this.item = {
            name: "YouTube Feed by oabos.de",
            desc: "",
            icon: process.launcher.imgPath + "engine/youtube.png"
        }

    }
    
    register () {
        
        this.handlelist.register({
            ...this.item,
            id: this.id,
            prefix: this.config.prefix,
            onInput: () => {
                if (!this.config.apikey|| this.config.apikey === "") {
                    this.send({
                        ...this.item,
                        name: "ApiKey nicht vorhanden",
                        desc: "ApiKey setzen: -key <apikey>"
                    });
                    return true;
                }
                this.send({
                    ...this.item,
                    id: 0
                });
                return true;
                
            },
            onSelect: (query, item, sendID) => {
                this.showFeed(sendID);
            }
        })

    }

    showFeed (sendID) {
        // https://oabos.de/?apikey=
        this.setInput(this.prefix, false);

        request(`https://oabos.de/?apikey=${this.config.apikey}`, (err, res, req) => {
            try {
                const json = JSON.parse(res.body);
                const getName = (id) =>{

                    for (const item of json.chanel) {
                        if (item.id === id) return item.name;
                    }
                    return "Unbekannt"

                }
                let r = [];
                for (const i in json.feed) {
                    if (!json.feed.hasOwnProperty(i)) continue;
                    const item = json.feed[i];
                    if (!item.title) return;
                    r.push({
                        ...this.item,
                        name: item.title,
                        desc: `Von ${getName(item.id)}`
                    });
                }   
                this.send(r);
            } catch (error) {
                console.log(error);
                this.send({
                    ...this.item,
                    name: "Feed konnte nicht geladen werden"
                }, sendID);
            }
        })

    }

    

}

module.exports = (handlelist, mainWindow) => {
    
    new Youtube(handlelist, mainWindow).register();
    
}