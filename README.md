
# Launcher
Ein Open-Source-Launcher, der vollständig erweiterbar ist. Schnellzugriff auf Einstellungen, Webseiten oder Programme. Einfach installieren, starten und bei Bedarf erweitern.
Es gibt verschiedene Module, die viele verschiedene Funktionen mitbringen.

## Getting Started
### Download
Auf der [Release Page](https://github.com/otsmr/launcher/releases) gibt es die aktuelle Version des Launchers zum herunterladen.

### Kompilieren

```bash
git clone https://github.com/otsmr/launcher.git
cd launcher
npm install
npm run dist
```

# Alle Module

* Module anzeigen/verwalten: **?**


## Dateiensuche *(Windows)*
* Prefix: **>**


Mithilfe des SYSTEMINDEX von Windows und der Powershell in Sekundenschnelle Dateien und Ordner finden. Suche basiert auf [filesearch](https://github.com/otsmr/filesearch).

![Dateisuche](./docs/img/filesearch.png)
### Beispiele
**Suche alle Bilder** [Mehr](https://github.com/otsmr/filesearch#extstringarray)
- ```>* -ext png,jpg,bmp```
- ```>* -kind picture```  

**Alle .mp4 Filme über einem GB** [Mehr](https://github.com/otsmr/filesearch#sizestring)
- ```>*.mp4 -size >=1g```  
- ```>* -size >=1g -ext mp4```  

[Mehr Beispiele](https://github.com/otsmr/filesearch#extstringarray)



## Lesezeichen
Lesezeichen von Firefox und Google Chrome durchsuchen. 
* Prefix: **b**



## Taschenrechner
![Rechner](./docs/img/calc.png)



## Duden

Wörter auf [duden.de](https://duden.de) nachschlagen
* Prefix: **duden**

![Duden](./docs/img/duden.png)



## Dateiexplorer  *(Windows)*

Schnellzugriff auf Dateien und Ordner
* Prefix: **=**

![Explorer](./docs/img/explorer.png)



## OnTop

* Prefix: **top**

Webseiten in einem Popup Fenster öffnen, dass sich immer ganz oben befindet

![Popup](./docs/img/youtubepopup.png)

## Programme *(Windows)*

Nach Programmen suchen

![Programme](./docs/img/programm.png)



## Schnellstarter

Computer schnell Herunterfahren, Neu Starten, ... 

![Schnellstarter](./docs/img/quick.png)



## Screenshot *(Windows)*

* Prefix: **shot**

![Screenshot](./docs/img/shot1.png)
![Screenshot](./docs/img/shot2.png)

## Übersetzer

Schnell mit **Google Translate** Texte übersetzen

![Übersetzer](./docs/img/translate.png)
## Speedtest

![Speedtest](./docs/img/speed.png)


## Suchmaschinen

Schnellzugriff auf Suchmaschinen  
Engine hinzufügen unter *config*  

![Suchmaschinen](./docs/img/engine.png)


**Autocomplete**

![Autocomplete](./docs/img/autocomplete.png)


## Wetter
Schnellzugriff auf die Wetterdaten von [wetter.com](https://wetter.com)

![Wetter](./docs/img/wetter.png)


## YouTube
Zugriff auf YouTube Abos mit [oabos.de](https://oabos.de)

![YouTube Liste](./docs/img/youtube.png)

**Popup**  
Videos werden in einem Popup Fenster geöffnet, welches sich immer ganz oben befindet

![YouTube Popup](./docs/img/youtubepopup.png)