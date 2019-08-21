"use strict";

module.exports = new class {

    get json () {

        const img = process.lauchner.imgPath;
        
        return [
            {
                name: "Hilfe",
                desc: "Öffnet das Hilfe-Fenster",
                icon: img + "help.svg",
                icontyp: "file",
                type: "window",
                open: "help",
                exact: "help"
            },
            {
                name: "Liste erneuern",
                desc: "Die Liste muss erneuert werden, wenn zB. ein neues Programm installiert wurde.",
                icon: img + "logo.svg",
                icontyp: "file",
                type: "updatelist",
                exact: "update"
            }
        ]

    }

}