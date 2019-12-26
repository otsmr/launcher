"use strict";
const translate = require("node-google-translate-skidz");
const languages = require("./languages");
const Module = require("./../module");

class Translate extends Module {
    
    constructor (a, b, search) {
        super("translate.google", a, b, {
            "enabled": true,
            "config": {
                "translate": {
                    "from": "de",
                    "to": "en"
                },
                "waitAfterInput": 1000,
                "prefix": "$"
            }
        });
        this.search = search;

        this.item = {
            name: "Übersetzen",
            desc: "Übersetzen mit Google Translate. Optionen öffnen \"-\"",
            icon: process.launcher.imgPath + "/engine/gtranslate.png"
        }

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,
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

    changeLang (input) {
    
        const data = input.split(" ");
        if (data[0] === "c") {
            const from = this.config.translate.from;
            this.config.translate.from = this.config.translate.to;
            this.config.translate.to = from;
            return this.setInput(this.prefix + " ");
        }

        if (data[0] !== "to" && data[0] !== "from") {
            return this.send([{
                ...this.item,
                name: "Parameter nicht bekannt",
                desc: "Richting auswählen: -to, -from; Sprachen tauschen: -c "
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
        if (data[1]) list = this.search.list(data[1], array);
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

            try {
                
                translate(data, (result) => {
                    let list = []
                    if (!result.translation) {
                        list.push({
                            ...this.item,
                            name: "Fehler bei der Übersetzung",
                            desc: ""
                        });
                    } else {
                        list.push({
                            name: result.translation,
                            desc: "",
                            icon: "fa-copy far",
                            type: "copy",
                            copy: result.translation,
                            id: 1003153
                        });
                    }
                    list.push({
                        ...this.item,
                        desc: data.text,
                        name: name
                    });
                    this.send(list);    
        
                });
            } catch (error) {
                console.log("ERROR");
            }
            
        }, this.config.waitAfterInput || 1000);

        

    }

}

module.exports = (handlelist, mainWindow, search) => {
    new Translate(handlelist, mainWindow, search).register();
}