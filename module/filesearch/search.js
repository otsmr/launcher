const powershell = require("../packages/powershell");
const path = require("path");

const property = [ 
    "AUTHOR",
    "DATEACCESSED",
    "DATECREATED",
    "DATEIMPORTED",
    "DATEMODIFIED",
    "FILEEXTENSION",
    "FILENAME",
    "FILEOWNER",
    "ITEMNAME",
    "ITEMTYPE",
    "ITEMTYPETEXT",
    "FullName",
    "Name",
    "SIZE",
    "TITLE",
    "KIND",
    "KINDTEXT",
    "AlbumArtist",
    "AlbumID",
    "AlbumTitle",
    "Artist",
    "Genre"
]


class Search {

    constructor () {
        this._searchQuery = "";
        this._filter = [];
        this._inMatchNumber = [];
        this._excludeFolders = [];
        this._ext = [];
    }

    get befehl () {

        let run = this._searchQuery;
        if (this._filter.length > 0) {
            run += " -Filter " + this._filter.join(", ");
        }
        
        const modulPath = path.join(__dirname, "get-indexitem.ps1").replace(/\\/, "/");
        return `.'${modulPath}'; Get-IndexedItem ` + run;

    }

    _getFromPowershell (query) {
        return powershell.getJSON(query, property);
    }
   
    _search () {

        let json = [];

        if (this._ext.length > 0) {

            const defQuery = this._searchQuery.slice();
            const filter = this._filter.slice();
            for (const ext of this._ext) {
                this._searchQuery = defQuery.slice();
                this._filter = filter.slice();
                this.ext(ext);
                json = json.concat(this._getFromPowershell(this.befehl));
            }
            
        } else {
            json = this._getFromPowershell(this.befehl);
        }

        if (!json) return false;
        
        if (this._excludeFolders.length === 0 && this._inMatchNumber.length === 0) return json;
        let res = [];

        for (const item of json) {
            let flag = false;
            if (this._inMatchNumber.length > 0) {
                for (const match of this._inMatchNumber) {
                    if (item.Name.indexOf(match.replace(/\*/g, "")) > -1) {
                        flag = true;
                        break;
                    }
                } 
                if (flag) continue;   
            }
            if (this._excludeFolders.length > 0) {
                for (const exlude of this._excludeFolders) {
                    if (item.FullName.indexOf(`\\${exlude}\\`) > -1) {
                        flag = true;
                        break;
                    }
                } 
                if (flag) continue; 
            }
            res.push(item);
        }
        return res;

    }

    paths (paths) {

        if (typeof paths === "string") {
            paths = paths.replace(/\\/, "/")
            this._searchQuery += ` -path '${paths}'`
        } else {

        }
        return this;

    }

    recurse () {

        this._searchQuery += " -recurse"
        return this;

    }

    ext (types) {
        if (typeof types === "string") {
            this._filter.push(`'itemtype=.${types}'`);
        } else {
            this._ext = types;
        }
        return this;
    }

    sync () {
        let match = this._search();
        if (!match.length && match.length !== 0) match = [match];
        return match;
    }

    getKinds () {
        this._searchQuery = " -Value 'kind'";
        let kinds = [];
        for (const item of this._search()) {
            kinds.push(item.kind);
        }
        return kinds;  
    }

    kind (kind) {
        this._filter.push(`'kind=${kind}'`);
        return this;
    }

    match (match, type = "name") {
        if (match.match(/[0-9]/) && type === "name") {
            this._inMatchNumber.push(match);
            match = match.replace(/[0-9]/g, "_");
        }
        match = match.replace(/\*/g, "%");
        match = match.replace(/_/g, "\_");
        match = match.replace(/ /g, "_");
        match = match.replace(/[^a-zA-ZäüöÖÄÜß_.%_]/g, "");
        this._filter.push(`'${type} like ${match}'`);
        return this;
    }

    contain (match) {
        return this.match(`%${match}%`, "autosummary");
    }

    excludeFolders (name) {
        if (typeof name === "string") name = [name];
        this._excludeFolders = name;
        return this;
    }

}

/**
 * Möglichkeiten
 * Multiple: (-ext .json -ext .html) || -ext .json,.html
 * 
 * # Standalone
 * --kinds         |                   |                             |           | Gibt die vorhandenen Typlisten zurück
 * 
 * 
 * # Dateisuche
 * match           | String            |                             | required  | Name; Platzhalter: _, Wildcat: *
 * --path, -p      | String (Multiple) | Default: home               |           | 
 * --ext, -e       | String (Multiple) |                             |           | Dateiendung
 * --kind, -k      | String            |                             |           | Dateityp: documents,... Liste: --kinds
 * --contain -c    | String            |                             |           | Content; Platzhalter: _, Wildcat: *
 * --noRecurse -nr | Boolean           | Default: false              |           |
 * --excludefolder | String (Multiple) | Default: node_modules,.git  |           |
 * 
 */


const parseargv = require('../packages/parseargv')

const argv = '-path "c:/users/tom/" -excludefolder node_modules -ext .json -contain Tobias -kind'

console.log(parseargv(argv));
// console.log(parseargv(argv));

process.exit(0);

const search = new Search()
    .paths("c:/users/tom/")
    .recurse()
    .match("calc.js")
    .excludeFolders("node_modules")
    // .contain("Tobias ")
    // .kind("music")
    // .ext("txt")
    // .ext(["html", "docx"]);
    
const result = search.sync();
if (!result) {
    console.log("FEHLER");
} else {
    
    for (const item of result) {
        console.log("Name:", item.Name);
        console.log(" ");
    }
    const fs = require("fs");
    fs.writeFileSync("result.json", JSON.stringify(result, null, 4));
}

console.log("  ---------------  ");
console.log(search.befehl);