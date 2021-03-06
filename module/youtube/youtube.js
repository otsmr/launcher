const {BrowserWindow} = require("electron");
"use strict";
const request = require("request");
const Module = require("../module");
const Positioner = require('electron-positioner');

class Youtube extends Module {

    constructor (a, b) {
        super("youtube.oabos", a, b, {
            "enabled": true,
            "config": {
                "prefix": "yt",
                "apikey": ""
            }
        });

        this.ytImages = `https://oabos.de/img/youtube.php?id=$wID`
        
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
            onInput: (query, sendID) => {
                if (!this.config.apikey|| this.config.apikey === "") {
                    this.send({
                        ...this.item,
                        name: "ApiKey nicht in den Einstellungen",
                        desc: "Den ApiKey gibt es unter 'view-source:https://oabos.de/'."
                    });
                    return true;
                }
                this.send({
                    ...this.item,
                    id: 0
                });
                
                this.showFeed(sendID);
                return true;
                
            },
            onSelect: (query, item, sendID) => {
                if (item.video) {
                    this.window = new BrowserWindow({
                        height: 475,
                        width: 800,
                        center: true,
                        icon: process.launcher.imgPath + "engine/youtube.png",
                        alwaysOnTop: true,
                        darkTheme: true,
                        title: item.name + ' - YouTube'
                    });
                    const pos = new Positioner(this.window);
                    pos.move("center");
                    this.window.loadURL(item.link);
                    this.window.removeMenu();
                    this.mainWindow.toggleMe(true);
                    return;
                }
            }
        })

    }

    showFeed (sendID, callBack) {

        this.setInput(this.prefix, false);

        this.setLoader(true);
        request(`https://oabos.de/?apikey=${this.config.apikey}`, (err, res, req) => {
            this.setLoader(false);

            try {
                const json = JSON.parse(res.body);
                const getName = (id) =>{

                    for (const item of json.chanel) {
                        if (item.id === id) return item.name;
                    }
                    return "-";

                }
                let feed = [];

                for (const i in json.feed) {
                    if (!json.feed.hasOwnProperty(i)) continue;
                    feed.push(json.feed[i]);
                }

                feed = feed.sort((a, b)=> {

                    const dates = ["Sekunde", "Sekunden", "Minute", "Minuten", "Stunde", "Stunden", "Tag", "Tagen", "Monat", "Monaten", "Jahr", "Jahren"]

                    const aDate = dates.indexOf(a.date.split(" ")[1]);
                    const bDate = dates.indexOf(b.date.split(" ")[1]);

                    if (aDate > bDate) {
                        return 1;
                    } else {
                        if (aDate === bDate) {
                            if (a.date.split(" ")[0] > b.date.split(" ")[0]) {
                                return 1;
                            }
                        }
                        return -1;
                    }

                })
                let r = [];
                let id = 100;
                for (const item of feed) {
                    if (!item.title) return;
                    const wID = item.link.substr(item.link.indexOf("=") + 1, item.link.length);
                    r.push({
                        ...this.item,
                        name: item.title,
                        video: true,
                        id,
                        box: {
                            pos: "left",
                            html: `<div class="img">
                                <img src="${this.ytImages.replace("$wID", wID)}">
                            </div>`
                        },
                        link: "https://www.youtube.com/embed/" + wID,
                        desc: `Von <b>${getName(item.id)}</b> hochgeladen vor <b>${item.date}</b>`
                    });
                    id++;
                }   
                this.send(r);
            } catch (error) {
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