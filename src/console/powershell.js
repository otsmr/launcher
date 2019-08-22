"use strict";
const spawnSync = require('child_process').spawnSync;

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

        if (params.length > 0) {
            befehl += ` | Select-Object -Property ${params.join(", ")}`
            befehl += ` | ConvertTo-Json`
        }
        
        try {
            return JSON.parse(this.run(befehl));
        } catch (error) {
            console.log(error);
            return false;
        }

    }

}