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

process.lauchner = {
    iconPath: userdata + "/icons/",
    rootPath: root,
    home: app.getPath("home"),
    appData: userdata,
    imgPath: root + "assets/img/",
    exePath: app.getPath("exe"),
    imgPathPlatform: `${root}assets/img/${platform}/`,
    platform
}

if (!fs.existsSync(process.lauchner.iconPath)) {
    fs.mkdirSync(process.lauchner.iconPath);
    fs.mkdirSync(process.lauchner.iconPath + "/ext/");
}