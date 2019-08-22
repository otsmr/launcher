"use strict";

const lists = {
    windows: [
        require("./windows/programms"),
        require("./windows/system")
    ],
    linux: [ ],
    mac: [ ],
    all: [
        require("./default")
    ]
}

const icons = {
    "application": process.launcher.imgPathPlatform + "application.png",
    "command": process.launcher.imgPath + "command.svg",
}

/*
list: {
    name: String,
    desc: String,
    icon: String: [path],
    icontyp: [file],
    path: String // Pfad zu einer Datei...
    type: [copy,  website, application, command, window, updatelist, shortcut, toinput],
    open: [help] // ( nur bei window)
    toinput: // Input veränndern
    url: // website
    // copy// copy
    exact: String
}
*/
// (Get-WmiObject win32_battery)


module.exports = () => {

    let list = [];

    for (const listitem of lists[process.launcher.platform]) {
        let adds = listitem.json;
        for (let add of adds) {

            if (!add.icon && add.type && icons[add.type]) {
                add.icon = icons[add.type];
                add.icontyp = "file";
            }

        }

        list = list.concat(adds);
        
    }

    for (const listitem of lists["all"]) {
        let adds = listitem.json;
        for (let add of adds) {
            if (!add.icon && add.type && icons[add.type]) {
                add.icon = icons[add.type];
                add.icontyp = "file";
            }
        }
        list = list.concat(adds);
    }
    let id = 0;
    for (const item of list) {
        item.id = id;
        id++;
    }
    
    return list;

}