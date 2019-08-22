"use strict";
const translate = require("node-google-translate-skidz");
const languages = require("./languages");
const search = require("../../core/search");

class Translate {
    
    constructor (handlelist, mainWindow) {
        this.id = "translate.google";

        this.handlelist = handlelist;
        this.mainWindow = mainWindow;

        this.item = {
            name: "Übersetzen",
            desc: "Übersetzen mit Google Translate. Optionen öffnen \"-\"",
            icon: process.launcher.imgPath + "/gtranslate.png",
            icontyp: "file"
        }

        try {
            this.config = process.launcher.config().module[this.id].config;
        } catch (error) {
            process.launcher.config().module[this.id] = {
                "enabled": true,
                "config": {
                    "translate": {
                        "from": "de",
                        "to": "en"
                    },
                    "waitAfterInput": 1000,
                    "prefix": "$"
                }
            }
            process.launcher.config(true);
            this.config = process.launcher.config().module[this.id].config;
        }

        this.prefix = this.config.prefix;
    }

    register () {

        this.handlelist.register({
            prefix: this.prefix,
            noEnter: true,
            onInput: (input) => {
                this.translate(input);
            },
            onSelect: (input, item) =>{
                input = input.replace(this.prefix, "");
                if (input[0] === " ") input = input.substr(1);

                if (input[0] === "-") this.saveLang(input.split(" ")[0].replace("-", ""), item.id);
        
            }
        })

    }

    saveLang (dir, code) {
        this.config.translate[dir] = code;
        process.launcher.config(true);
        return this.setInput(this.prefix + " ");

    }

    send (list) {

        this.handlelist.json = list;
        this.mainWindow.webContents.send("add-to-list", list);

    }

    setInput (data) {
        this.mainWindow.webContents.send("toinput", data);
    }

    changeLang (input) {
    
        const data = input.split(" ");
        if (data[0] === "change") {
            const from = this.config.translate.from;
            this.config.translate.from = this.config.translate.to;
            this.config.translate.to = from;
            return this.setInput(this.prefix + " ");
        }

        if (data[0] !== "to" && data[0] !== "from") {
            return this.send([{
                ...this.item,
                name: "Parameter nicht bekannt",
                desc: "Richting auswählen: -to, -from; Sprachen tauschen: -change "
            }]);
        }
        let array = [];
        for (const item of languages) {
            array.push({
                name: item.name,
                code: item.value
            })
        }

        let list = [];
        if (data[1]) list = search.list(data[1], array);
        else list = array;

        for (const item of languages) {
            if (item.value === data[1]){
                list.unshift({
                    code: item.code,
                    name: `<b>${item.name}</b>`
                });
            }
        }
        let res = [];
        for (const item of list) {
            res.push({
                ...this.item,
                name: item.name,
                desc: "",
                id: item.code
            });
        }
        this.send(res);
    }

    getLang (code) {

        for (const item of languages) {
            if (item.value === code) return item.name;
        }
        return "Unbekannt";

    }

    translate (input) {

        if (input[0] === " ") input = input.substr(1);

        if (this.timeout) clearTimeout(this.timeout);
        
        let data = {
            source: this.config.translate.from,
            target: this.config.translate.to,
            text: (input) ? input : ""
        }

        const name = "Übersetzen mit Google von " + this.getLang(data.source) + " nach " + this.getLang(data.target);
        if (input === "") {
            this.send([{
                ...this.item,
                name: name
            }])
            return;
        }

        if (input[0] === "-") {
            return this.changeLang(input.substr(1));
        }

        this.send([{
            ...this.item,
            desc: data.text,
            name
        }]);

        if (data.text === "" || data.text === this.prefix) return;

        this.timeout = setTimeout(() => {

            translate(data, (result) => {
                let list = []
                try {
                    list.push({
                        name: "",
                        desc: result.translation,
                        icon: process.launcher.imgPath + "/copy.svg",
                        icontyp: "file",
                        type: "copy",
                        copy: result.translation,
                        id: 1003153
                    });
                } catch (error) {
                    list.push({
                        name: "Fehler bei der Übersetzung",
                        icon: process.launcher.imgPath + "/gtranslate.png",
                        icontyp: "file"
                    });
                }
                list.push({
                    ...this.item,
                    desc: data.text,
                    name: name
                });
                this.send(list);    
    
            });
            
        }, this.config.waitAfterInput || 1000);

        

    }

}

module.exports = (handlelist, mainWindow) => {
    new Translate(handlelist, mainWindow).register();
}
