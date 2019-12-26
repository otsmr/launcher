<p align="center">
  <a href="https://oproj.de/">
    <img src="./assets/img/logo.png" width="150">
  </a>
</p>

<h3 align="center">Launcher</h3>

<p align="center">
    Open-Source-Launcher, der vollständig erweiterbar ist.<br> Schnellzugriff auf Einstellungen, Webseiten oder Programme.<br>
    Einfach installieren, starten und bei Bedarf erweitern.
    <br><br>
    <a href="https://github.com/otsmr/launcher/releases"><strong>-- Download --</strong></a>
    <br>
    <br>
    <img src="https://img.shields.io/badge/platform-windows-%23097aba" alt="Platform">
</p>



# Inhaltsverzeichnis
* <a href="#quickstart">Quickstart</a>
* <a href="#dokumenation">Dokumenation</a>
* <a href="#module">Module</a>
* <a href="#copyright-und-lizenz">Copyright und Lizenz</a>

# Quickstart

Auf der [Release Page](https://github.com/otsmr/launcher/releases) gibt es den Installer für Windows zum herunterladen.

# Module

# Dokumenation

## Kompilieren

```bash
git clone https://github.com/otsmr/launcher.git
cd launcher
npm install
npm run dist
```

## eigenes Modul

```/module```

```javascript
"use strict";

const Module = require("../module");

class EigenesModul extends Module {

    constructor (a, b) {
        super("modulID", a, b, {
            "enabled": true,
            "config": { }
        })

        this.item = {
            name: "Hallo Welt",
            desc: "",
            icon: "Font Awesome Icons (5.2.0) oder Bildquelle",
        }

    }

    register () {

        this.handlelist.register({
            ...this.item,
            id: this.id,

            // immer auslösen
            always: (query) => {
                return this.render(query); // Boolean: Liste hier stoppen?
            },


            // bei einem bestimmten Präfix auslösen
            prefix: this.prefix,
            onInput: (q, sendID) => {
                return true;
            }, 

            // Zur Liste hinzufügen
            addToList: (query) => {
                return [];
            },


            // ein Element aus der Liste wurde ausgewählt
            onSelect: (q, item, sendID) => {
                console.log("Select: ", item);
            }
        })

    }

    render (query) {

        this.send({
            ...this.item,
            name: "Hallo Welt",
            desc: "Eingabe: " + query
        })
        return true; // Wird Syncron hinzugefügt 
        
    }

}

module.exports = (handlelist, mainWindow) => {

    new EigenesModul(handlelist, mainWindow).register();

}
```




# Copyright und Lizenz
Copyright by <a href="https://tsmr.eu">TSMR</a>