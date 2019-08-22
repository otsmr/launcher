"use strict";
const path = require("path");
const { app } = require('electron');
const fs = require("fs");

const userdata = app.getPath("userData") + "/";
const root = path.join(__dirname, "/../../");

let platform = "linux";
switch (process.platform) {
    case "darwin": platform = "mac"; break;
    case "win32": platform = "windows"; break;
}

process.launcher = {
    iconPath: userdata + "/icons/",
    rootPath: root,
    desktopPath: app.getPath("desktop") + "/",
    home: app.getPath("home"),
    appData: userdata,
    imgPath: root + "assets/img/",
    exePath: app.getPath("exe"),
    imgPathPlatform: `${root}assets/img/${platform}/`,
    platform,
    config: (save = false) => {
        const path = userdata + "config.json";
        if (save) {
            try {
                fs.writeFileSync(path, JSON.stringify(this.config, false, 4))
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        } else {
            try {
                return this.config = JSON.parse(fs.readFileSync(path));
            } catch (error) {
                console.log(error);
                return {};
            }
        }
        
    },
}

if (!fs.existsSync(process.launcher.iconPath)) {
    fs.mkdirSync(process.launcher.iconPath);
    fs.mkdirSync(process.launcher.iconPath + "/ext/");
}

// if (!fs.existsSync(process.launcher.config)) {
    fs.copyFileSync(root + "/config.json", userdata + "/config.json")
// }