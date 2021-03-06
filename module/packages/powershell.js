"use strict";
const spawnSync = require('child_process').spawnSync;
const fs = require("fs");
const path = require("path");
const geticonps1 = require("./ps/get-icon");

module.exports = new class {

    admin (befehl) {
        return this.run(`Start-Process powershell -WindowStyle Minimized -Verb runAs -ArgumentList \\\"${befehl}\\\"`);
    }

    run (befehl) {
        try {
            return spawnSync("powershell.exe", [befehl], { encoding : 'utf8' }).stdout;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    getJSON (befehl, params = []) {

        const file = path.join(process.launcher.modulePathData, "/tmp.json");
        if (params.length > 0) {
            befehl += ` | Select-Object -Property ${params.join(", ")}`
            befehl += ` | ConvertTo-Json`
            befehl += ` | Out-File '${file}' -Encoding UTF8` // stupid endcoding
        }

        try {

            this.run(befehl);
            let data = fs.readFileSync(file).toString();
            fs.unlinkSync(file);
            data = data.substr(1); // Bug Fix: '﻿' Encoding
            if (data === "") return [];
            const match = data.match(/:(.*?)"(.*?)"(.*?)"(.*?)"(.*?),/g);

            if (match) for (const item of match) {
                let part = item.substr(1).slice(0, -2).trim();
                if (part[0] === '"') part = part.substr(1);
                part = part.replace(/\"/g, '"').replace(/"/g, '\\"');
                data = data.replace(item, `:  "${part}",`)
            }
            
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            return [];
        }

    }

    geticon (ext, saveto) {

        try {
            // const geticonps1 = path.join(__dirname, "ps" , "get-icon.ps1");
            const dumpfile = path.join(process.launcher.modulePathData, "tmp." + ext);
            fs.writeFileSync(dumpfile, "");
            const befehl = `${geticonps1}; (Get-Icon -Path '${dumpfile}' -ToBitmap).Save('${saveto}.png', [System.Drawing.Imaging.ImageFormat]::Png) `
            this.run(befehl);
            fs.unlinkSync(dumpfile);
            return true;
        } catch (error) {
            return false;
        }
    
    }

}