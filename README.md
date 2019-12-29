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
    <img src="https://img.shields.io/badge/Platform-windows-%23097aba" alt="Platform">
    <a href="https://paypal.me/otsmr"><img src="https://img.shields.io/badge/PayPal-Kaffee spendieren-%23097aba" alt="Kaffee"></a>
</p>

![Launcher](/docs/img/launcher.gif "Launcher")

# Inhaltsverzeichnis
* <a href="#quickstart">Quickstart</a>
* <a href="#dokumenation">Dokumenation</a>
* <a href="#module">Module</a>
* <a href="#copyright-und-lizenz">Copyright und Lizenz</a>

# Quickstart

Auf der [Release Page](https://github.com/otsmr/launcher/releases) gibt es den Installer für Windows zum herunterladen.

# Module

## Alles finden – schneller als je zuvor

Wenn du an deinem Computer arbeiten, hast du ein Ziel. Ob groß oder klein, für die Arbeit oder zum Spaß - Launcher findet schnell das gewünschte Programm oder die verlorene Datei.

![Suche](/docs/img/paint.png "Suche")

## Tools für jede Lebenslage

Launcher hat alles, was du brauchen, um deinen Computer effizient zu nutzen – zum Beispiel schnelle Ordner- und Dateisuche, Übersetzungen, Wetter und den Explorer erreichbar durch Tasten.

<p align="center">Übersetzung öffnen mit <code>t</code></p>

![Übersetzen](/docs/img/translate.png "Übersetzen")

<p align="center">Wetter öffnen mit <code>w</code></p>

![Wetter](/docs/img/wetter.png "Wetter")

<p align="center">Explorer öffnen mit <code>=</code></p>

![Explorer](/docs/img/explorer.png "Explorer")


## Surfen ist beim Launcher selbstverständlich

Du willst dich nicht für eine Suchmaschine entscheiden? Das musst du auch nicht. Launcher bietet viele verschiedene Suchmaschinen mit Autovervollständigen.

| Suchmaschine | Prefix |
|---|---|
| DuckDuckGo Black Theme | d |
| DuckDuckGo | dl |
| Wikipedia | wi |
| Startpage | s |
| NPM | npm |
| Google Maps | m |
| Google | g |

![Suchmaschinen](/docs/img/wiki.png "Suchmaschinen")


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
            icon: "Font Awesome Icons (5.10.2) oder Bildquelle",
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